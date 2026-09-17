# ASTRA-REF-001 — Tareas de integración

Estado inicial: ASSIGNED. Fecha: 2026-09-17. Integrador: Codex.

## Base y fuentes fijadas

- Rama de integración: `chore/ASTRA-RF-000-reconciliation`.
- Base de asignación: `45418fa` (`docs: regenerate baseline audit`).
- Snapshot REF-001: `b310c886dc173f98555f110f1cf8c88a9cab9233`.
- Snapshot UI documental: `8cb14578f097c7bce72c38ecb3e2a042fd5b2e95`.
- Familias de activos: `fd402ec`.
- Staging: no forma parte de las tareas especialistas; no desplegado.

## ASTRA-REF-001-BE — Port backend y datos

- Rol: backend/database.
- Rama: `agent/backend/ASTRA-REF-001-integration`.
- Worktree: `../../work/astra-ref-backend`.
- Propiedad: `apps/api/**`, `prisma/**`.
- Prohibidos: `apps/web/**`, `docs/**`, `compose.yaml`, `package-lock.json`, scripts y configuración raíz.
- Dependencias: copiar únicamente los paths propios desde el snapshot REF-001 sobre la base de asignación.
- Prisma/migraciones: propiedad explícitamente asignada para esta tarea.

Comportamiento requerido:

1. Portar lector seguro, referencias, trazabilidad, impresión, rutas API, OpenAPI modular y pruebas desde el snapshot.
2. Corregir y probar la discrepancia `INVALID_PAGE`: página no entera o menor que uno debe responder el código y status documentado de manera coherente en helper y endpoint.
3. Definir mediante código/prueba que revisiones comerciales y sus metadatos no se enumeran para TECHNICIAN/VIEWER por rutas documentales indirectas; conservar originales comerciales sólo ADMIN.
4. Preservar `stockEffect: NONE`, historia cerrada, A_CONFIRMAR y ausencia de escrituras de stock.

Aceptación: migraciones aditivas; pruebas de traversal/hash/tamaño/MIME/permisos; endpoint de página validado; acceso comercial cruzado cubierto; suite API, typecheck y build propios aprobados. Entregar commit y handoff; no modificar contratos canónicos ni lockfile.

Stop conditions: dependencia raíz nueva no expresada en `apps/api/package.json`; contrato público requiere decisión distinta a la matriz RF-000; migración destructiva; necesidad de corpus real.

## ASTRA-REF-001-FE — Port y correcciones frontend

- Rol: frontend.
- Rama: `agent/frontend/ASTRA-REF-001-integration`.
- Worktree: `../../work/astra-ref-frontend`.
- Propiedad: `apps/web/**`, salvo `App.tsx`, `Views.tsx`, `DocumentReview.tsx`, `main.tsx` y `entity.tsx`, que permanecen bajo el integrador por colisión.
- Prohibidos: backend, Prisma, contratos, configuración raíz y los archivos frontend reservados al integrador.
- Dependencias: copiar `References.tsx`, `Traceability.tsx`, `OrderDetail.tsx` y `api.ts` desde REF-001.

Comportamiento requerido:

1. Evitar que QR/PDF de un destino permanezca o llegue tarde bajo otro destino.
2. Evitar que una respuesta de selección de objeto fuera de orden reemplace la última intención.
3. Limpiar links/errores/loading al cambiar referencia para no mostrar asociaciones anteriores.
4. Reproducir y corregir, si se confirma, la pérdida del contenedor vigente cuando todavía no está en las opciones.
5. Preservar descarte entre sesiones en JSON y Blob; agregar pruebas significativas de los flujos corregidos.

Aceptación: regresiones con respuestas diferidas; typecheck, pruebas web y build aprobados. Entregar commit y handoff. La ruta QR global queda para el integrador en `App.tsx`.

Stop conditions: requiere cambiar contrato API; archivos reservados; falta de datos para reproducir contenedor; nueva dependencia frontend.

## Integrador — colisiones y superficies compartidas

Después de aceptar ambos handoffs:

1. Integrar backend y frontend por SHA.
2. Incorporar `package-lock.json`, `compose.yaml`, PRODUCT, API-CONTRACT, operación y planificación desde REF-001, reconciliándolos con RF-000.
3. Corregir el estado completo de ruta QR en `App.tsx` y añadir prueba si la arquitectura actual lo permite sin introducir un router.
4. Integrar familias `fd402ec`: `AssetFamilies.tsx`, CSS, adaptador y callbacks, preservando rutas REF-001.
5. Componer `DocumentReview.tsx` desde UI `8cb1457` y enlaces/IDs de REF-001; conservar estilos locales.
6. Ejecutar verificación integrada limpia, registrar SHA y preparar PR. Merge a main y producción permanecen sujetos a aprobación humana.
