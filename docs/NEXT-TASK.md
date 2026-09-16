# Próximo trabajo

Actualizado: 2026-09-16. `main`, verificación y staging sintético coinciden en `a0c9178d668305bc33bc8bacdad9f0ec529e4653`. ASTRA-DOC-001 y la consolidación documental están integrados; no deben repetirse.

## Gate inmediato — ASTRA-DOC-002

Cerrar la reconciliación post-deploy en `chore/ASTRA-DOC-002-post-deploy-plan`:

- actualizar estado, handoff, verificación, matriz e índice de evidencia al merge/despliegue `a0c9178`;
- registrar la integración de PR #8, backup y cobertura pendiente;
- regenerar la auditoría documental desde la rama actual;
- corregir whitespace detectado por la revisión integral;
- aclarar que `deployment-failure.json` es evidencia del último fallo histórico, no el release activo.

Aceptación: enlaces locales válidos, inventario sin artefactos no clasificados, extracción histórica 35/35, `git diff --check` limpio y diff limitado a documentación/whitespace. No requiere redeploy porque no cambia comportamiento ni artefactos construidos.

## Siguiente incremento de desarrollo — ASTRA-010A

Ejecutar la primera etapa de [ASTRA-010 — lector seguro de fuentes por revisión](05-planning/ASTRA-010-secure-source-reader.md):

1. acordar ADR y contrato del endpoint por `revisionId`;
2. modelar amenazas de traversal, escape por enlace/reparse point, hash cambiado, tipo/tamaño y filtración de paths;
3. añadir configuración sin defaults hacia carpetas personales;
4. implementar el resolver puro sobre fixtures temporales;
5. probar casos válidos y rechazos antes de exponer HTTP.

El gate de ASTRA-010A no incluye UI, montaje del corpus real, OCR ni streaming público. La fase HTTP sólo comienza cuando el resolver y el contrato están aceptados.

## Secuencia posterior

- ASTRA-010B: endpoint autenticado, streaming y OpenAPI.
- ASTRA-010C: acción accesible “Abrir fuente” en `/documents`.
- ASTRA-010D: staging con fixture sintética y montaje read-only explícito.
- Después: lote técnico pequeño para decisión humana; recién entonces diseñar aplicación transaccional al catálogo sin efecto de stock.

La revisión física de drag & drop desktop permanece como aceptación separada y no bloquea esta secuencia.

## Límites

Corpus, stock y producción no reciben cambios automáticos. Todo PN desconocido permanece `A_CONFIRMAR`. No se publican rutas privadas ni originales en Git. `PLAN-STATUS.md` conserva el inventario extenso; sus filas no equivalen a Issues publicadas.
