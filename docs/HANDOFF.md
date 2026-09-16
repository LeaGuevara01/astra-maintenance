# Handoff vigente — 2026-09-15

## Incremento: cola de revisión por fuente

Rama feat/document-review-history. Agregada cola de fuentes previa a candidatos en /documents: endpoint GET /document-candidates/sources/page y UI con filtros por extractionStatus, familia/equipo y prioridad. La cola lee DocumentRevision y metadatos de auditoría DOCUMENT_SOURCE_IMPORTED; no requiere migración, no crea candidatos, no decide revisiones y no modifica stock. La prioridad es operativa y conservadora: OCR_REQUIRED/VISUAL_REVIEW_REQUIRED y familias reconocidas suben revisión; duplicados o fuentes ya derivadas bajan prioridad.

La derivación posterior conserva el límite técnico: partNumber desconocido A_CONFIRMAR, locator de página/hoja, sha256 de revisión y aplicabilidad declarada. La familia se infiere del título para organizar revisión, no como validación OEM.

## Carga autorizada del corpus técnico — 2026-09-15 Argentina

Solicitud del usuario: poblar la base con documentos del corpus técnico. Cargadas 695 revisiones en DocumentRevision de staging local (runtime 54beabe7f8d25f306c9ab38c781df3c972a033d8; checkout 6d2c7c89f7cd218b2bd8fa2a83bea6b558edf39a). Selección: 706 referencias MANUAL_OR_CATALOG/TECHNICAL_REFERENCE, nueve repeticiones consolidadas y dos excluidas por hash cambiado: SRC-9a301d3bad6a y SRC-bdcea086b8e1. Hashes de originales verificados antes de cargar; originales conservados.

Se persistieron ID de fuente, título y SHA-256; auditoría DOCUMENT_SOURCE_IMPORTED por revisión con clasificación, estado de extracción, páginas declaradas y A_CONFIRMAR. No se cargaron binarios ni texto completo en la base; rutas locales y manifiesto permanecen en .runtime/corpus-import. No se generaron candidatos a repuestos. La UI actual lista candidatos, no revisiones independientes: falta biblioteca navegable para estas fuentes.

Respaldo previo: .runtime/backups/staging/20260916-011250-614.dump. Importación transaccional y lectura posterior de las 695 revisiones verificadas. Catálogo/stock íntegros antes/después; se conservaron nueve órdenes y 17 movimientos. Script local y resultados: .runtime/corpus-import/import.mjs, manifest.json y result-*.json. Esta carga de datos no modifica código de producto ni despliega otro SHA. Pendiente: revisar contenido por unidad/variante antes de derivar candidatos o planes.

Base de trabajo main@6196941; incremento actual: revisión documental persistente conectada al catálogo, ADR-002. Tres tablas nuevas, sin cambios de stock ni cierre. UI registra candidatos, guarda decisiones con razón, recarga historial y compara catálogo. No hay aplicación al catálogo ni originales servidos.

Ver API-CONTRACT, ADR-002-document-review, VERIFICATION, PLAN-STATUS y CORPUS-ANALYSIS. Contrato P06 reconciliado: ningún cierre omite críticos pendientes/fallidos. Los checkpoints anteriores permanecen en Git.

Staging publicado y comprobado: 52b1220fd2d304d097d05673780461db2b014784 en http://localhost:4380, health ready y versión coincidente. Verify limpio del mismo SHA aprobado. El commit posterior de cierre sólo actualiza documentación. IDE y Git se identifican por git rev-parse HEAD. Pruebas proporcionales al cambio; no repetir recorridos completos como trámite.

## Incremento autónomo — paginación

Autorización y secuencia en AUTONOMOUS-DEVELOPMENT.md. Endpoint aditivo /document-candidates/page y navegación anterior/siguiente de 25 candidatos. Sin migración ni cambios de stock. GET anterior permanece compatible. Test de continuación con fechas iguales, alta concurrente, cursor inválido y límite de página. Los tests ahora reinicializan también las tablas documentales dentro de astra_test para evitar contaminación entre casos.

## Incremento: historial de revisión

Rama feat/document-review-history, base 54beabe (coincidente con origin/main al iniciar). API de historial paginado por versión y UI de 25 decisiones por página; selección/versionado reinicia la navegación y descarta respuestas del historial anterior. Nombre actual del revisor resuelto por ID; ausencias explícitas, sin exponer datos de cuenta. actorId e historial append-only conservados. Listado paginado de candidatos sólo incluye la última decisión; endpoint legado compatible. Sin migraciones ni cambios de stock.

Prueba nueva: historial vacío, autenticación, lectura VIEWER, nombres/IDs, límites/cursor, candidato ausente, continuación frente a decisión concurrente, último estado y compatibilidad. Dos revisores concurrentes producen una sola decisión nueva y un 409 REVIEW_STALE.
