# Reconciliación de contratos — ASTRA-RF-000

Base aceptada de main: a68150ef566b718b490798dacf6228fbfc125b9d, con árbol igual a `abc77f63dd62daf2eafbd30f73948bec1865d221`. Fecha: 2026-09-17.
Este documento clasifica divergencias; no publica nuevas rutas ni aprueba la implementación sucia de REF-001.

| Tema | Main / ASTRA-010 | REF-001 local observado | Resolución de integración |
|---|---|---|---|
| Originales | Main no los sirve; plan propone document-revisions/:revisionId/content | references/revisions/:id/original y pages/:page | Mantener API de main; escoger ruta canónica con implementación y OpenAPI juntos en PR funcional |
| Formatos | Plan PDF e imágenes, límite configurable | PDF de hasta 32 MiB, página derivada | Registrar recorte PDF y distinguir original de derivado; no prometer imágenes |
| Errores | Plan SOURCE_NOT_AVAILABLE, SOURCE_ACCESS_DENIED, 415 | SOURCE_UNAVAILABLE, SOURCE_FORBIDDEN, 422 para PDF/tipo | Mapear códigos y consumidores antes de aceptar; no describir ambos como intercambiables |
| Permisos | Tres roles técnicos | COMMERCIAL/facturas sólo ADMIN | Preservar mínimo privilegio; revisar todos los caminos indirectos QR, impresión, vínculo y auditoría |
| Datos | Sin nuevas tablas de referencias en main | Dos migraciones de referencias/trazabilidad | Revisión explícita de esquema, backfill e integridad; no migrar para reconciliar docs |
| Objetos físicos | Part con stock global | Contenedor/ejemplar/lote sin cantidades | No equivalen a WMS, reserva ni saldo; mantener stockEffect NONE |
| Producto | Piloto preventivo vigente | Tarea local registra extensión autorizada REF-001 | Reconocer alcance registrado localmente; publicar capacidad sólo tras integración funcional, sin revocar ni ampliar aquella autorización |
| UI familias | Asset.family literal | Agrupación UI en fd402ec | No afirmar jerarquía persistida ni compatibilidad técnica |

## Decisión adoptada en esta rama
PRODUCT y API-CONTRACT mantienen comportamiento de main. Se añade referencia a esta matriz para que la planificación no se confunda con una API disponible. No se copian los contratos funcionales de un árbol sin commit. La siguiente integración debe fijar SHA, actualizar contrato/implementación/pruebas en conjunto y conservar A_CONFIRMAR, stock e historia.

## Colisiones
QR y familias tocan App.tsx y Views.tsx; QR y el checkout original tocan DocumentReview.tsx. Un único integrador debe resolverlas tras handoff. Lockfile, PRODUCT, API-CONTRACT, OpenAPI, Compose y Prisma requieren asignación explícita; no repartirlos entre especialistas simultáneos.



## Hallazgos de la revisión simultánea

[Backend](reviews/RF-000A-BE.md): alinear 400/422 de páginas y decidir/probar acceso a metadatos comerciales y reclasificación de fuentes entre módulos. [Frontend](reviews/RF-000A-FE.md): no cerrar P010 hasta revisar descarga PDF fuera del transporte JSON. Informes estáticos; no certifican el árbol QR.
