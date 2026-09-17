# ASTRA Platform Reform — Baseline

Status: active reform program
Base branch: `main`
Base SHA: `abc77f63dd62daf2eafbd30f73948bec1865d221`
Date: 2026-09-17

## Purpose

This program evolves the verified preventive-maintenance pilot into an integrated operations platform. It preserves proven transactional behavior and replaces pilot-oriented boundaries incrementally.

## Baseline to preserve

- TypeScript monorepo with `apps/api` and `apps/web`.
- React/Vite frontend.
- Express/TypeScript API.
- Prisma/PostgreSQL persistence.
- Session auth, CSRF and RBAC.
- Idempotent maintenance operations.
- Transactional stock reservation/consumption.
- Immutable closed intervention history and snapshots.
- Audit and idempotency primitives.
- Persistent document review, findings and provenance.
- OpenAPI contract/parity checks.
- Staging, backup, rollback and verification procedures.
- Agent coordination with bounded ownership.

## Current limits

- Product contract remains preventive-pilot centric.
- `Asset` is flat; no site/system/component/installed-part hierarchy.
- Inventory is global per `Part`; no WMS locations, bins, containers, serial/batch or per-location balances.
- Procurement/suppliers are not operational domains.
- Corrective/failure/diagnostic/intervention workflows are incomplete.
- Frontend centralizes routing, session and broad global reloads.
- No shared query/cache layer.
- Entity presentation is only partially normalized.
- No persistent domain-event/outbox foundation.
- No integration registry/provider health model.
- AI is concentrated in document analysis instead of being platform-wide.

## Reform invariants

1. No big-bang rewrite.
2. Business authority stays in backend/domain services.
3. UI layouts are projections, not sources of truth.
4. LLMs never write SQL/Prisma directly.
5. Critical AI actions pass typed tools, authorization, validation, policy, transaction, audit and domain-event recording.
6. Technical claims preserve evidence, applicability and human-review state.
7. Closed history remains immutable.
8. Stock writes stay transactional and retry-safe.
9. Unknown technical facts remain `A_CONFIRMAR`.
10. New domains enter through incremental migrations with explicit verification and recovery strategy.
11. God View, graph and timeline project shared entities/events.

## Program IDs

- `ASTRA-RF-000` Baseline and target architecture
- `ASTRA-RF-010` Modular domain foundation
- `ASTRA-RF-020` Agent and skills foundation
- `ASTRA-RF-030` UI platform foundation
- `ASTRA-RF-040` Asset Registry 2.0
- `ASTRA-RF-050` Maintenance Core 2.0
- `ASTRA-RF-060` Inventory/WMS
- `ASTRA-RF-070` Parts Intelligence
- `ASTRA-RF-080` Procurement
- `ASTRA-RF-090` God View 2D
- `ASTRA-RF-100` Integration Hub
- `ASTRA-RF-110` AI Copilot READ/ANALYZE
- `ASTRA-RF-120` Controlled AI Actions
- `ASTRA-RF-130` Analytics and operational timeline
- `ASTRA-RF-140` Digital Twin / 3D
- `ASTRA-RF-150` Production hardening

## Branch policy

Reform work branches from current `main`. Legacy `copilot/*` branches must not be used as implementation bases. Historical feature branches are evidence until compared against `main`; they are never assumed authoritative.
