---
applyTo: "apps/api/**"
---
# Backend ownership

The backend specialist owns `apps/api/**` only unless the task explicitly grants additional paths.

- Enforce roles, validation and business invariants server-side.
- Preserve API shapes in `docs/API-CONTRACT.md`; contract changes require integrator coordination.
- Writes that affect stock, reservations, consumption or order closure must remain transactional and retry safe.
- Closed intervention history and snapshots are immutable.
- Use explicit errors rather than silently coercing invalid domain states.
- Add or update tests for meaningful behavior, including negative authorization/state cases.
- Do not edit Prisma schema/migrations unless database ownership is explicitly assigned for the task.
