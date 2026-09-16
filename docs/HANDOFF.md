# Handoff vigente — 2026-09-15

Base de trabajo main@6196941; incremento actual: revisión documental persistente conectada al catálogo, ADR-002. Tres tablas nuevas, sin cambios de stock ni cierre. UI registra candidatos, guarda decisiones con razón, recarga historial y compara catálogo. No hay aplicación al catálogo ni originales servidos.

Ver API-CONTRACT, ADR-002-document-review, VERIFICATION, PLAN-STATUS y CORPUS-ANALYSIS. Contrato P06 reconciliado: ningún cierre omite críticos pendientes/fallidos. Los checkpoints anteriores permanecen en Git.

Staging publicado y comprobado: 52b1220fd2d304d097d05673780461db2b014784 en http://localhost:4380, health ready y versión coincidente. Verify limpio del mismo SHA aprobado. El commit posterior de cierre sólo actualiza documentación. IDE y Git se identifican por git rev-parse HEAD. Pruebas proporcionales al cambio; no repetir recorridos completos como trámite.

## Incremento autónomo — paginación

Autorización y secuencia en AUTONOMOUS-DEVELOPMENT.md. Endpoint aditivo /document-candidates/page y navegación anterior/siguiente de 25 candidatos. Sin migración ni cambios de stock. GET anterior permanece compatible. Test de continuación con fechas iguales, alta concurrente, cursor inválido y límite de página. Los tests ahora reinicializan también las tablas documentales dentro de astra_test para evitar contaminación entre casos.

## Incremento: historial de revisión

Rama feat/document-review-history, base 54beabe (coincidente con origin/main al iniciar). API de historial paginado por versión y UI de 25 decisiones por página; selección/versionado reinicia la navegación y descarta respuestas del historial anterior. Nombre actual del revisor resuelto por ID; ausencias explícitas, sin exponer datos de cuenta. actorId e historial append-only conservados. Listado paginado de candidatos sólo incluye la última decisión; endpoint legado compatible. Sin migraciones ni cambios de stock.

Prueba nueva: historial vacío, autenticación, lectura VIEWER, nombres/IDs, límites/cursor, candidato ausente, continuación frente a decisión concurrente, último estado y compatibilidad. Dos revisores concurrentes producen una sola decisión nueva y un 409 REVIEW_STALE.
