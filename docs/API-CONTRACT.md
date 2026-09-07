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
POST /orders/:id/close, Idempotency-Key, {result:OPERATIVE|OPERATIVE_WITH_NOTES|NOT_OPERATIVE,notes?} -> Order
GET /orders/:id/card?format=a6|a4 -> printable HTML, same snapshot on all four cards. Backend provides GET /orders/:id/pdf?format=a6|a4 -> PDF if possible; integrator can add PDF service.
GET /audit -> Audit[] {id,createdAt,actorName,action,entityId,details}
GET /version -> {version,commit,environment}
Root GET /health/live and /health/ready.

Seed assets synthetic code AST-001 "Tractor de prueba", meter 600, and AST-002 "Equipo de apoyo", meter 1200. A single demonstrative plan with 300/600/900/1200 tasks, unknown PN A_CONFIRMAR, required materials, critical brake checkpoint. These are synthetic examples, not OEM recommendations.
Accounts admin@astra.local, tecnico@astra.local, consulta@astra.local; passwords via SEED_ADMIN_PASSWORD / SEED_TECH_PASSWORD / SEED_VIEWER_PASSWORD (required to seed).
Cookie can be non-Secure only development on loopback; deployment TLS via reverse proxy.

