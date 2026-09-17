# API v1 contract (shared between worktrees)

All routes below are /api/v1; JSON responses direct objects/arrays. Errors {error:{code,message,details?}} with 4xx/5xx. Auth is HttpOnly same-origin session cookie; modifying requests send X-CSRF-Token returned by login/me; login itself requires origin validation.
POST /auth/login {email,password} -> {user:{id,name,email,role},csrfToken}
GET /auth/me -> same. POST /auth/logout -> 204.
GET /dashboard -> {assets:number,openOrders:number,overdue:number,lowStock:number}
GET /assets -> Asset[]. POST /assets (ADMIN) {code,name,family,meter,planId?} -> Asset.
Asset {id,code,name,family,meter,operatingStatus,planId?,plan?:Plan}
POST /assets/:id/readings {value} -> Asset.
GET /plans -> Plan[]. Plan {id,code,name,revision,status,tasks:PlanTask[]}
PlanTask {id,code,description,frequency,mandatory,blocking,sourceType,sourceReference,partId?,quantity?}
GET /inventory -> Part[]. Part {id,code,name,partNumber,unit,onHand,reserved,available}
POST /inventory/:id/receive (ADMIN) {quantity,reference} -> Part.
GET /orders -> Order[]; GET /orders/:id -> Order (full nested detail).
POST /orders/generate (ADMIN), Idempotency-Key header, {assetId,targetMeter,actualMeter} -> Order
Order {id,code,status,targetMeter,actualMeter,createdAt,closedAt?,asset:Asset,plan:{id,name,revision},tasks:OrderTask[],materials:OrderMaterial[],checkpoints:Checkpoint[],audit?:Audit[],nextServiceMeter?}
OrderTask {id,code,description,frequency,status,mandatory,blocking,sourceType,sourceReference,partId?,quantity?,deferredReason?,deferredUntil?,deferredBy?}
OrderMaterial {id,partId,part:{code,name,partNumber,unit},quantityPlanned,quantityReserved,quantityUsed,shortage}
Checkpoint {id,code,label,critical,result} result PENDING|PASS|FAIL|NA
POST /orders/:id/reserve, Idempotency-Key -> Order (partial reservation allowed; shortage visible)
POST /orders/:id/consume, Idempotency-Key, {materialId,quantity} -> Order (consumes own reservation first; prevents stealing reservations)
PATCH /orders/:id/tasks/:taskId {status:PENDING|DONE|DEFERRED|NA,deferredReason?,deferredUntil?} -> Order
PATCH /orders/:id/checkpoints/:checkpointId {result:PASS|FAIL|NA} -> Order; critical NA invalid.
POST /orders/:id/close, Idempotency-Key, {result:OPERATIVE|OPERATIVE_WITH_NOTES|NOT_OPERATIVE,notes?} -> Order; any result is rejected with CRITICAL_CHECKPOINT while a critical checkpoint is PENDING or FAIL.
GET /orders/:id/card?format=a6|a4 -> printable HTML, same snapshot on all four cards. Backend provides GET /orders/:id/pdf?format=a6|a4 -> PDF if possible; integrator can add PDF service.
GET /audit -> Audit[] {id,createdAt,actorName,action,entityId,details}
GET /version -> {version,commit,environment}
Root GET /health/live and /health/ready.

Seed assets synthetic code AST-001 "Tractor de prueba", meter 600, and AST-002 "Equipo de apoyo", meter 1200. A single demonstrative plan with 300/600/900/1200 tasks, unknown PN A_CONFIRMAR, required materials, critical brake checkpoint. These are synthetic examples, not OEM recommendations.
Accounts admin@astra.local, tecnico@astra.local, consulta@astra.local; passwords via SEED_ADMIN_PASSWORD / SEED_TECH_PASSWORD / SEED_VIEWER_PASSWORD (required to seed).
Cookie can be non-Secure only development on loopback; deployment TLS via reverse proxy.

## Revisión documental persistente

GET /document-candidates: últimos 200 candidatos con revisión de fuente e historial de decisiones, accesible a los tres roles.
POST /document-candidates (ADMIN, Idempotency-Key): sourceId, title, sha256 (64 hex minúsculas), code, name, partNumber (default A_CONFIRMAR), unit, locator, applicability. Crea candidato y revisión de fuente inmutable; un nuevo hash representa otra revisión y no hereda aprobaciones.
POST /document-candidates/:id/reviews (ADMIN/TECHNICIAN, Idempotency-Key): version, decision=A_CONFIRMAR|VALIDADO|RECHAZADO, reason obligatorio. Incremento optimista de versión; 409 REVIEW_STALE exige recargar. Historial append-only, actor y fecha.
POST /document-candidates/dry-run (tres roles, CSRF): ids únicos, 1–200. Compara candidatos persistidos con Part dentro de lectura consistente. Devuelve apply:false y decisiones/razones/procedencia/stockEffect:NONE.
No se sirven rutas físicas, no se suben originales, no se aplica catálogo ni se modifica stock. La pantalla permite registrar, decidir, recargar y comparar; no contiene fixtures.

## Paginación documental

GET /document-candidates/page?limit=25&cursor=<candidateId>: tres roles autenticados. limit entero 1–100; cursor opcional válido. Respuesta {items,nextCursor}; orden createdAt descendente/id ascendente. Cursor delimita mediante fecha/id del candidato; nuevas altas anteriores al cursor no duplican páginas posteriores. Cursor inexistente: 400 INVALID_CURSOR. El GET anterior conserva su respuesta array para compatibilidad. La UI navega páginas de 25 y compara únicamente el lote visible.

## Historial documental paginado

GET /document-candidates/:id/reviews?limit=25&cursor=<version>: disponible para ADMIN, TECHNICIAN y VIEWER autenticados. limit entero 1–100; cursor entero positivo que debe existir en ese candidato. Devuelve {items,nextCursor}, orden version descendente y continuación exclusiva; las decisiones posteriores no desplazan la continuación. Candidato inexistente: 404 CANDIDATE_NOT_FOUND; cursor inexistente: 400 INVALID_CURSOR.

Cada item conserva id, candidateId, version, decision, reason, actorId y createdAt; añade actorName (nombre actual del usuario o null si no está disponible). No es un snapshot del nombre histórico; la auditoría existente conserva actorName al decidir. No se exponen email ni credenciales. nextCursor es la versión del último item cuando quedan resultados, o null.

GET /document-candidates/page incluye únicamente la última decisión por candidato en reviews. El GET legado /document-candidates conserva su historial completo para compatibilidad. La pantalla carga el historial seleccionado en páginas de 25 y vuelve a la primera al cambiar de candidato o versión.

## Cola de revisión por fuente

GET /document-candidates/sources/page?limit=25&cursor=<revisionId>&extractionStatus=<estado>&family=<texto>&priority=ALTA|MEDIA|BAJA: tres roles autenticados. Lista revisiones documentales antes de derivar candidatos. limit entero 1–100; cursor opcional válido de DocumentRevision. Filtros opcionales por extractionStatus, familia/equipo inferido de título y prioridad operativa. Respuesta {items,nextCursor}; cada item incluye sourceId, title, sha256, kind, extractionStatus, pages, pagesNeedingOCR, reviewStatus, family, priority y hasCandidates.

La cola no crea candidatos, no decide revisiones y no modifica stock. Sirve para seleccionar fuentes que luego podrán derivar candidatos con PN desconocido A_CONFIRMAR, locator de página/hoja, hash de revisión y aplicabilidad declarada.

## Hallazgos documentales asistidos

GET /document-candidates/findings/page?limit=25&cursor=<findingId>&decision=A_CONFIRMAR|CREATE_CANDIDATE|REJECTED|OCR_REQUIRED|CONFLICT&kind=<tipo>&sourceId=<fuente>&confidence=ALTA|MEDIA|BAJA&category=<categoria>&relevance=ALTA|MEDIA|BAJA&provenanceKind=<procedencia>: tres roles autenticados. Lista hallazgos persistidos por corridas de analizador, con revisión documental, hash, locator, evidencia, advertencias, estado humano y última revisión. Los filtros de categoría, relevancia y procedencia consultan los atributos conservadores almacenados en evidence. limit entero 1-100; cursor opcional válido de DocumentFinding. Cursor inexistente: 400 INVALID_CURSOR.

POST /document-candidates/findings/:id/reviews (ADMIN/TECHNICIAN, Idempotency-Key): decision=A_CONFIRMAR|CREATE_CANDIDATE|REJECTED|OCR_REQUIRED|CONFLICT, reason obligatorio. Registra decisión append-only, actualiza el estado visible del hallazgo y audita DOCUMENT_FINDING_REVIEWED. No crea candidato, no aplica catálogo y no modifica stock; CREATE_CANDIDATE sólo marca intención de derivación posterior.

POST /document-candidates/findings/:id/candidate (ADMIN, Idempotency-Key): deriva únicamente un hallazgo PART_CANDIDATE con código extraído a DocumentCandidate, reutilizando revisión/fuente, código, descripción, PN, unidad, locator y aplicabilidad para evitar recarga manual. Registra una revisión CREATE_CANDIDATE y auditoría DOCUMENT_FINDING_DERIVED. La operación es idempotente, no valida el PN, no aplica catálogo y no modifica stock. EQUIPMENT_REFERENCE y OCR_REQUIRED devuelven 422 FINDING_NOT_PART.

El comando npm run documents:analyze-sample conserva dry-run por defecto. Con -- --persist escribe corridas y hallazgos sólo para DocumentRevision ya cargadas, usando analyzerId/analyzerVersion. Si esa versión de analizador ya tiene hallazgos, bloquea la reescritura para preservar revisiones humanas.

Los hallazgos pueden incluir kind=EQUIPMENT_REFERENCE para códigos de equipo, modelo o manual detectados en manuales de instrucciones o manuales de repuestos. Estas referencias son útiles para agrupar biblioteca técnica, aplicabilidad y futuras pantallas de equipo/manual; no son candidatos directos a Part y conservan partNumber=A_CONFIRMAR y stockEffect:NONE.

En hallazgos de repuesto, `evidence.snippet` contiene el renglón o ítem reconstruido usado para clasificar y `evidence.contextSnippet` puede conservar el fragmento vecino más amplio. Ambos son evidencia para revisión; la segmentación y categoría siguen siendo propuestas `A_CONFIRMAR`.


## Estado de integración de extensiones

El contrato de este archivo corresponde a la base integrada. ASTRA-010 y el trabajo local ASTRA-REF-001 se contrastan en la [matriz de reconciliación](05-planning/ASTRA-RF-000-contract-reconciliation.md). Las capacidades locales no se anuncian como disponibles en main antes de integrar implementación, contrato y evidencia.
