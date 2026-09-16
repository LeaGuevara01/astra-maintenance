---
document_id: ASTRA-010
title: "Lector seguro de fuentes por revisión documental"
type: plan
status: partial
owner: integrator
version: 0.1
updated_at: 2026-09-16
applies_to: main-after-a0c9178d668305bc33bc8bacdad9f0ec529e4653
supersedes: none
related_code:
  - apps/api/src/document-review.ts
  - apps/api/src/config.ts
  - apps/web/src/DocumentReview.tsx
  - prisma/schema.prisma
technical_corpus_references: sourceId+sha256+locator only
---

# ASTRA-010 — Lector seguro de fuentes por revisión documental

## Resultado observable

Un usuario autenticado puede abrir desde `/documents` el original correspondiente a una `DocumentRevision` autorizada sin recibir una ruta local. La API sólo sirve un archivo regular que esté bajo una raíz configurada, coincida con `sourceId` y SHA-256, cumpla límites explícitos y permanezca en modo lectura. La ausencia o alteración de la fuente se muestra como estado verificable; nunca se sustituye silenciosamente por otra revisión.

Este plan expande P039 y P053. No modifica catálogo, stock, decisiones técnicas, planes ni OT.

## Decisiones propuestas para el contrato

- Identidad pública: `revisionId`; `sourceId`, hash y locator continúan visibles como procedencia. El cliente no envía ni recibe rutas físicas.
- Resolución: registro local sanitizado `sourceId + sha256 → ruta relativa`; las raíces se configuran fuera de Git y se montan read-only cuando el entorno lo autoriza.
- Contención: resolver ruta canónica con `realpath`, exigir pertenencia a una raíz permitida y rechazar escapes, enlaces/reparse points fuera de raíz y archivos no regulares.
- Integridad: calcular SHA-256 antes de servir y compararlo con `DocumentRevision.sha256`; un hash distinto responde conflicto y exige crear/importar una revisión nueva.
- Límites iniciales: allowlist de PDF e imágenes soportadas, máximo configurable, `Content-Type` conocido, `Content-Disposition: inline`, `X-Content-Type-Options: nosniff`, política same-origin y soporte de rango sólo si queda cubierto por pruebas.
- Autorización: ADMIN, TECHNICIAN y VIEWER autenticados pueden leer; ninguna ruta permite upload, escritura, listado de directorios o acceso por path arbitrario.
- Localizador: página/hoja/región se usa para orientar la UI; no relaja la validación del original ni se interpreta como dato técnico validado.
- Observabilidad: auditar resultado por `revisionId` y código estable sin registrar rutas privadas. No registrar el contenido completo.

Las decisiones de endpoint, tamaño máximo y MIME final deben incorporarse a `API-CONTRACT.md`, OpenAPI y un ADR antes de implementar comportamiento público. La propuesta de ruta es `GET /api/v1/document-revisions/:revisionId/content`.

## Incrementos de implementación

### ASTRA-010A — Contrato, configuración y resolver

Propiedad: integrador + backend; `apps/api`, configuración, ADR, contrato y pruebas unitarias. Sin Prisma salvo que la revisión demuestre que el registro externo no basta.

1. Documentar el modelo de amenaza y aceptar el contrato.
2. Añadir configuración para manifiesto y raíces autorizadas, sin defaults hacia carpetas personales.
3. Implementar un resolver puro e inyectable contra fixtures temporales.
4. Rechazar ruta absoluta recibida del cliente, traversal, escape por enlace, archivo no regular, tamaño/MIME no permitido, fuente ausente y hash distinto.

Aceptación: ningún error o DTO expone una ruta; fixtures válidos resuelven por revisión/hash; todos los casos de escape y mutación fallan de forma determinista.

### ASTRA-010B — Endpoint autenticado

Propiedad: backend; router documental, OpenAPI y pruebas PostgreSQL/HTTP.

1. Resolver `revisionId` desde `DocumentRevision` y después consultar el registro externo.
2. Aplicar sesión y roles, cabeceras defensivas y códigos estables (`SOURCE_NOT_AVAILABLE`, `SOURCE_CHANGED`, `SOURCE_ACCESS_DENIED`, `SOURCE_TOO_LARGE`, `SOURCE_TYPE_UNSUPPORTED`).
3. Transmitir sin cargar archivos grandes completos en memoria; cancelar correctamente al cerrar el cliente.
4. Añadir paridad OpenAPI y pruebas de 401/404/409/413/415, lectura permitida y ausencia de filtración de path.

Aceptación: los tres roles leen una fixture autorizada; no autenticado falla; revisión/hash incorrectos no entregan bytes; no hay mutación de base ni stock.

### ASTRA-010C — Integración UI accesible

Propiedad: frontend; `DocumentReview`, tipos/transporte y estilos acotados.

1. Añadir “Abrir fuente” en fuente, hallazgo y candidato cuando exista una revisión resoluble.
2. Conservar acción por botón/teclado; no depender de drag & drop.
3. Abrir contenido en contexto separado same-origin y presentar estados ausente/cambiado/no soportado sin ocultar `sourceId`, hash y locator.
4. Descartar respuestas tardías al cambiar de selección o sesión.

Aceptación: ADMIN, TECHNICIAN y VIEWER pueden abrir la fixture; foco y nombre accesible son verificables; un fallo mantiene la cola y la selección utilizables.

### ASTRA-010D — Staging sintético y operación

Propiedad: integrador; Compose, runbook, evidencia y despliegue.

1. Montar sólo un directorio de fixtures sintéticas read-only; no usar el corpus privado para aceptación automatizada.
2. Verificar SHA limpio, health, version y footer contra el mismo commit.
3. Probar fuente válida, alterada y ausente; confirmar que logs/respuestas no contienen la ruta del host.
4. Documentar habilitación opcional de raíces autorizadas y backup separado de originales.

Aceptación: staging conserva datos sintéticos, no publica una raíz del host y el lector queda deshabilitado de forma segura cuando falta configuración.

## Verificación mínima

```powershell
npm run typecheck
npm test --workspace @astra/api
npm run build
./scripts/Verify.ps1 -SkipInstall
```

Además: pruebas del resolver con directorio temporal, prueba HTTP de streaming y una aceptación dirigida de `/documents`. No es necesario repetir el circuito preventivo completo de tres roles ni PDF A6/A4 porque el incremento no modifica esos flujos.

## Fuera de alcance

- subir, editar, borrar, OCR o convertir originales;
- servir rutas arbitrarias, shares de red no autorizados o listados de carpetas;
- incorporar originales, rutas privadas o credenciales a Git/imagen;
- validar PN, equivalencia OEM, aplicabilidad o contenido por el hecho de poder abrirlo;
- aplicar candidatos al catálogo o modificar stock;
- producción, LAN pública o acceso externo.

## Riesgos y stop conditions

- Si el runtime no puede montar una raíz read-only sin ampliar exposición, detener ASTRA-010D y conservar el lector deshabilitado.
- Si Windows y el contenedor resuelven enlaces/reparse points de forma diferente, aceptar sólo archivos regulares bajo la ruta canónica observada dentro del runtime.
- Si el archivo cambió, no actualizar el hash automáticamente: registrar `SOURCE_CHANGED` y volver al flujo de nueva revisión.
- Si se requiere guardar paths en Prisma o cambiar el contrato público compartido, el integrador debe aprobar el ADR y la migración antes de continuar.
- Si una prueba necesita originales reales o datos sensibles, reemplazarla por fixture o detener el incremento.

## Handoff esperado por incremento

Registrar base/final SHA, paths modificados, comandos y resultados, checks omitidos, impacto de datos, configuración requerida y siguiente gate. Merge a `main` y producción conservan su aprobación humana separada.
