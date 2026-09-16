# Handoff vigente — 2026-09-15

## Incremento: analizador documental dry-run

Solicitud del usuario: documentar y empezar implementación de revisión automática con analizadores IA. Agregado plan en docs/DOCUMENT-AI-REVIEW-PLAN.md y primer módulo local sin proveedor externo: apps/api/src/document-analysis.ts. El comando npm run documents:analyze-sample lee .runtime/sources/index.json, analiza textos extraídos de una muestra y escribe analyses.json, findings.json y summary.json bajo .runtime/document-analysis. Los hallazgos nacen A_CONFIRMAR, stockEffect:NONE, con sourceId, sha256, locator, snippet y advertencias. No usa base de datos, no crea candidatos y no modifica stock.

## Incremento: cola de revisión por fuente

Rama feat/document-review-history. Agregada cola de fuentes previa a candidatos en /documents: endpoint GET /document-candidates/sources/page y UI con filtros por extractionStatus, familia/equipo y prioridad. La cola lee DocumentRevision y metadatos de auditoría DOCUMENT_SOURCE_IMPORTED; no requiere migración, no crea candidatos, no decide revisiones y no modifica stock. La prioridad es operativa y conservadora: OCR_REQUIRED/VISUAL_REVIEW_REQUIRED y familias reconocidas suben revisión; duplicados o fuentes ya derivadas bajan prioridad.

La derivación posterior conserva el límite técnico: partNumber desconocido A_CONFIRMAR, locator de página/hoja, sha256 de revisión y aplicabilidad declarada. La familia se infiere del título para organizar revisión, no como validación OEM.

Verificación y redeploy: commit funcional 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f pasó Verify.ps1 -SkipInstall (45 pruebas, typecheck y build) y fue desplegado en staging con backup previo .runtime/backups/staging/20260916-014526-173.dump. Health ready y /api/v1/version coincidieron. Revisión visual dirigida en Edge aprobó /documents con cola real, filtros OCR_REQUIRED + John Deere + ALTA, footer 2b6cd689, candidatos 0 y comparación deshabilitada. Evidencia local: .runtime/visual-review/documents-source-queue-desktop.png.

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

## Incremento: hallazgos asistidos persistentes — 2026-09-16

Continuación del plan automático de revisión documental. Agregadas tablas DocumentAnalysisRun, DocumentFinding y DocumentFindingReview con migración 20260916021000_document_analysis_findings. Los hallazgos nacen A_CONFIRMAR, stockEffect NONE, enlazados a DocumentRevision por sourceId/sha256 existentes. Las revisiones humanas de hallazgos son append-only e inmutables por trigger; el estado visible del hallazgo permite filtrar A_CONFIRMAR, CREATE_CANDIDATE, REJECTED, OCR_REQUIRED y CONFLICT.

API nueva: GET /document-candidates/findings/page para cola filtrable por decisión, tipo, fuente y confianza; POST /document-candidates/findings/:id/reviews para ADMIN/TECHNICIAN con motivo obligatorio e idempotencia. CREATE_CANDIDATE no crea candidato todavía: sólo deja marcada la intención para una derivación explícita posterior con locator, hash y aplicabilidad. VIEWER sólo consulta.

UI /documents ahora suma “Hallazgos asistidos por IA” debajo de la cola de fuentes. Muestra código, PN A_CONFIRMAR, locator, aplicabilidad, hash de revisión, snippet y advertencias. ADMIN/TECHNICIAN pueden decidir con motivo. La pantalla conserva el aviso de sin aplicación al catálogo ni stock.

El comando npm run documents:analyze-sample sigue siendo dry-run por defecto y agrega -- --persist para guardar corridas/hallazgos contra revisiones ya cargadas. Bloquea la reescritura de una misma analyzerVersion si ya existen hallazgos, para no destruir revisión humana. No se cargó texto completo ni binarios en la base.

## Incremento: procedencia y derivación asistida — 2026-09-16

El analizador agrega a cada evidencia una categoría inicial, relevancia, tipo de procedencia y título de fuente. Son ayudas de muestreo y priorización, no confirmaciones OEM. La cola de hallazgos permite filtrarlas y las muestra junto con aplicabilidad, locator y hash.

ADMIN puede derivar un PART_CANDIDATE con una sola acción. El backend copia los campos extraídos a DocumentCandidate, conserva `A_CONFIRMAR` cuando el PN no fue validado, registra revisión/auditoría e impide derivar referencias de equipo u OCR. El flujo no aplica catálogo ni genera movimientos de stock.

## Incremento: segmentación por ítem de catálogo — 2026-09-16

La categorización ya no usa indiscriminadamente todo el fragmento vecino. El analizador reconstruye filas horizontales y tablas PDF extraídas verticalmente como `ítem + descripción + código + cantidad`, clasifica ese bloque y conserva el contexto amplio por separado. La UI presenta “Renglón identificado” y permite desplegar “Ver contexto vecino”. Esto reduce categorías heredadas de la pieza siguiente y mantiene el texto original disponible para revisión.

Verificación: scripts/Verify.ps1 -SkipInstall aplicó la migración en astra_test, ejecutó db:generate, typecheck API/web, 49 tests y build API/web correctamente. Durante test se reasignó el puerto de base test de 50387 a 50388 por ocupación local.

## Ajuste: referencias de equipo/manual — 2026-09-16

A pedido del usuario, los códigos de equipo o modelo dejan de tratarse como falsos positivos descartables. El analizador ahora puede emitir kind EQUIPMENT_REFERENCE cuando el código aparece en contexto de manual, instrucciones, modelo, catálogo de repuestos o equipo. Ejemplo protegido por test: EA-350 en un manual Richiger queda como referencia de equipo/manual, mientras EX-18070C en la tabla de repuestos sigue como PART_CANDIDATE. Ambos conservan A_CONFIRMAR y stockEffect NONE; ninguna referencia crea activos, candidatos ni stock automáticamente.
