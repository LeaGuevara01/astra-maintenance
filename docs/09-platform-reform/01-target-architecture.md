# ASTRA Platform Reform — Target Architecture

## Product direction

ASTRA becomes a modular monolith first, with explicit domain boundaries and a shared operational platform. Microservices are not a target by themselves.

```text
ASTRA Platform
├─ Identity & Access
├─ Organization & Sites
├─ Asset Registry
├─ Maintenance
├─ Inventory / WMS
├─ Resources & Safety
├─ Parts Intelligence / Knowledge
├─ Procurement
├─ Integrations
├─ Analytics / Events
└─ AI Platform
```

## Runtime architecture

```text
Browser / Mobile Web
        │
        ▼
ASTRA Web Platform
- App Shell
- Router
- Query/Cache
- Entity Presentation
- Layouts: Table/List/Kanban/Timeline/Tree/Graph/Map
- Global Selection / Inspector
        │
        ▼
ASTRA API
- HTTP adapters
- Auth/RBAC/CSRF
- Application Commands/Queries
- Domain Services
- Policy Engine
- Tool Registry for AI
        │
        ▼
Persistence
- Prisma/PostgreSQL
- Domain tables
- Audit
- Idempotency
- DomainEvent / Outbox
- Projection/read models where justified
```

## Domain-command rule

All state-changing behavior follows:

```text
request
→ authentication
→ authorization
→ validation
→ application command
→ domain service
→ transaction
→ audit
→ domain event/outbox
→ response
```

UI gestures, integrations and AI tools must use the same command boundary.

## Query rule

Read surfaces may use dedicated queries/projections when necessary, but they must not silently become parallel sources of truth.

## Domain events

Introduce a persistent event/outbox foundation without adopting full event sourcing.

Minimum event fields:

- `id`
- `type`
- `aggregateType`
- `aggregateId`
- `occurredAt`
- `actorId`
- `source`
- `correlationId`
- `causationId`
- `metadata`

Example events:

- `AssetRegistered`
- `MeterReadingRecorded`
- `WorkOrderCreated`
- `WorkOrderTransitioned`
- `FailureReported`
- `PartReserved`
- `PartIssued`
- `PartInstalled`
- `PartRemoved`
- `StockTransferred`
- `RequisitionCreated`
- `PurchaseOrderApproved`
- `GoodsReceived`

## AI boundary

```text
LLM
→ typed tool request
→ tool authorization
→ policy evaluation
→ validated Query/Command
→ domain service
→ transaction
→ audit/event
```

Never:

```text
LLM → SQL
LLM → Prisma
LLM → unreviewed inventory or purchasing mutation
```

Tool classes:

- READ
- ANALYZE
- DRAFT
- APPROVAL_REQUIRED
- EXECUTE_CONTROLLED

Initial production AI must stay mainly READ/ANALYZE and selected DRAFT workflows.

## God View principle

God View is a projection over shared entities/events. It does not own asset, stock, work-order or procurement state.

Initial layers:

- Assets
- Work Orders
- Failures
- Warehouses
- Inventory Alerts
- Procurement
- Safety
- Personnel
- Telemetry

Layer health values:

`LIVE`, `STALE`, `PARTIAL`, `DEGRADED`, `UNAVAILABLE`, `OFF`.

## Graph and timeline

Graph View projects relationships from the relational model. No graph database is required initially.

Timeline uses domain events and immutable operational history to support causal investigation and later 4D replay.
