---
document_id: ASTRA-EVIDENCE-20260915-01
title: "Persistencia de revisión documental y corpus autorizado"
type: evidence
status: historical
owner: integrator
updated_at: 2026-09-16
applies_to: multiple-historical-sha
staging: historical
source_sections:
  - "docs/HANDOFF.md#Carga autorizada del corpus técnico — 2026-09-15 Argentina"
  - "docs/VERIFICATION.md#Base anterior y staging comprobado"
  - "docs/VERIFICATION.md#Evidencia histórica reutilizable"
  - "docs/VERIFICATION.md#Revisión persistente — 2026-09-15"
  - "docs/VERIFICATION.md#Cierre del incremento persistente"
---

# Persistencia de revisión documental y corpus autorizado

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Carga autorizada del corpus técnico — 2026-09-15 Argentina;sha256=148a399d041fa7f8ec9484548f013c2f8f9ffa9524af70e0e68b6e16ca2d79ba -->
## Carga autorizada del corpus técnico — 2026-09-15 Argentina

Solicitud del usuario: poblar la base con documentos del corpus técnico. Cargadas 695 revisiones en DocumentRevision de staging local (runtime 54beabe7f8d25f306c9ab38c781df3c972a033d8; checkout 6d2c7c89f7cd218b2bd8fa2a83bea6b558edf39a). Selección: 706 referencias MANUAL_OR_CATALOG/TECHNICAL_REFERENCE, nueve repeticiones consolidadas y dos excluidas por hash cambiado: SRC-9a301d3bad6a y SRC-bdcea086b8e1. Hashes de originales verificados antes de cargar; originales conservados.

Se persistieron ID de fuente, título y SHA-256; auditoría DOCUMENT_SOURCE_IMPORTED por revisión con clasificación, estado de extracción, páginas declaradas y A_CONFIRMAR. No se cargaron binarios ni texto completo en la base; rutas locales y manifiesto permanecen en .runtime/corpus-import. No se generaron candidatos a repuestos. La UI actual lista candidatos, no revisiones independientes: falta biblioteca navegable para estas fuentes.

Respaldo previo: .runtime/backups/staging/20260916-011250-614.dump. Importación transaccional y lectura posterior de las 695 revisiones verificadas. Catálogo/stock íntegros antes/después; se conservaron nueve órdenes y 17 movimientos. Script local y resultados: .runtime/corpus-import/import.mjs, manifest.json y result-*.json. Esta carga de datos no modifica código de producto ni despliega otro SHA. Pendiente: revisar contenido por unidad/variante antes de derivar candidatos o planes.

Base de trabajo main@6196941; incremento actual: revisión documental persistente conectada al catálogo, ADR-002. Tres tablas nuevas, sin cambios de stock ni cierre. UI registra candidatos, guarda decisiones con razón, recarga historial y compara catálogo. No hay aplicación al catálogo ni originales servidos.

Ver API-CONTRACT, ADR-002-document-review, VERIFICATION, PLAN-STATUS y CORPUS-ANALYSIS. Contrato P06 reconciliado: ningún cierre omite críticos pendientes/fallidos. Los checkpoints anteriores permanecen en Git.

Staging publicado y comprobado: 52b1220fd2d304d097d05673780461db2b014784 en http://localhost:4380, health ready y versión coincidente. Verify limpio del mismo SHA aprobado. El commit posterior de cierre sólo actualiza documentación. IDE y Git se identifican por git rev-parse HEAD. Pruebas proporcionales al cambio; no repetir recorridos completos como trámite.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#Base anterior y staging comprobado;sha256=469eba0c57aa78d3b286de550e2a8ce93aded3e0e2f3bc5cdae1a4b1ea2d414f -->
## Base anterior y staging comprobado

SHA: 3b2223de05f4a514ca4c664cefa81019373c3974.

| Evidencia | Resultado | Alcance |
| --- | --- | --- |
| .runtime/test/verification.json | dirty=false; typecheck, tests y build registrados como completados | SHA exacto de la base funcional; 2026-09-15 00:02:34 UTC (14/09 21:02 Argentina) |
| GET http://localhost:4380/health/ready | HTTP 200, status=ready | Consulta en vivo durante el análisis del 15/09 |
| GET http://localhost:4380/api/v1/version | HTTP 200; staging; commit=3b2223de05f4a514ca4c664cefa81019373c3974 | Identidad del despliegue confirmada |
| docker info | Servidor 29.8.0 | Motor disponible durante el análisis |
| Repositorio antes de consolidar | Limpio en 3b2223d | Sin cambios de usuario pendientes |

El registro de pruebas fue leído, no regenerado en esta consolidación. No se atribuye al nuevo commit documental una ejecución de pruebas inexistente. No se modifica verification.json para sustituir su SHA.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Evidencia histórica reutilizable;sha256=c5df892822b0629aa0a654fa7eae22b081ba95e0bf46b93afb72bb2073d83281 -->
## Evidencia histórica reutilizable

- ASTRA-005, b21b347: circuito de interfaz con ADMIN, TECHNICIAN y VIEWER completado sobre OT-000006, cerrada OPERATIVE. PDF A6/A4 descargados y revisados visualmente.
- En ese checkpoint se comprobaron bloqueos por tareas/checkpoints críticos, inmutabilidad del cierre y replay sin duplicación.
- El flujo operativo del piloto tiene evidencia previa de backup/restauración aislada, rechazo de checksum corrupto, rollback con preservación de datos y aislamiento entre worktrees.
- La normalización ASTRA-006 registró 1.110 fuentes, 1.080 hashes únicos, 142 pendientes OCR y 1.080 pendientes de revisión. Son cifras históricas del corpus, no un recuento nuevo.

Estas evidencias conservan su fecha y alcance. No constituyen una nueva ejecución sobre otro SHA.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Revisión persistente — 2026-09-15;sha256=5821bf26b72e02fd14b314eea557c7d7ccebf48994a5795dd98e6fe22ae40174 -->
## Revisión persistente — 2026-09-15

Prisma generate, migración de upgrade en astra_test, 42 pruebas PostgreSQL/documentales, typecheck API/web y build API/web aprobados. Caso nuevo: roles, creación/revisión idempotente, persistencia tras GET, rechazo stale, comparación real, stock intacto y trigger de historial.

Verify.ps1 se detuvo al reasignar puertos (No free port available); se reutilizó el contexto astra_test ya operativo en 50379 mediante Common.ps1 y se ejecutaron db:migrate, test y build directamente. No se falsificó verification.json ni se ejecutó contra staging. Estos pendientes quedaron completados según el cierre siguiente.

Browser dirigido aprobado en Edge sobre http://localhost:4392/documents y base astra_test: login ADMIN, candidato existente, decisión A_CONFIRMAR con motivo, recarga completa, historial conservado y comparación UNCHANGED/stock NONE. Preview nativo de esta implementación, no staging ni certificación de los tres roles.

Migración desde base vacía aprobada: test_document_review_fresh_20260915, cuatro migraciones aplicadas. Base aislada conservada. El conflicto de puertos del wrapper se corrigió seleccionando puertos libres en el contexto local de test, sin modificar scripts ni staging.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Cierre del incremento persistente;sha256=a3bda75c7d4c5d6613afb0fe58550d472f1282a8ab930382d6ebf2b64c8e1a11 -->
## Cierre del incremento persistente

Verify.ps1 -SkipInstall pasó sobre el commit limpio 52b1220fd2d304d097d05673780461db2b014784: migración, 42 pruebas, typecheck y build. Deploy-Staging.ps1 finalizó con backup previo, migración aditiva y despliegue de ese SHA. Release registrada 2026-09-15T12:57:28Z. Health ready y /api/v1/version comprobados en vivo. El bloqueo EPERM inicial de Prisma se resolvió cerrando el proceso nativo de prueba que mantenía la DLL abierta; no se modificó la dependencia.

La prueba dirigida de navegador se hizo sobre el mismo código funcional en el entorno aislado antes del despliegue. No se repitió el circuito completo de roles. El commit posterior sólo cierra documentación; verification.json conserva el SHA efectivamente ejecutado.

Fuera de este repositorio se actualizaron cabeceras de planes/checkpoints de outputs y la cláusula P06 de PRODUCT/API y el plan abierto en el checkout in. Se preservaron sus demás cambios locales; no se incluyó ese árbol en el push del main principal.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
