---
applyTo: "prisma/**"
---
# Database ownership

Database/Prisma changes require explicit task ownership and integrator awareness.

- Prefer additive, reviewable migrations over destructive changes.
- Preserve historical snapshots and auditability.
- Never reinterpret historical quantities as current stock.
- Do not encode unverified OEM/technical facts as authoritative seed data.
- New domain entities must be justified against existing `PRODUCT`, `API-CONTRACT`, roadmap and ADRs to avoid duplicate concepts.
- Migration work must include a clean-database apply check and compatibility/rollback notes.
- Test databases must remain isolated (`astra_test` or `test_*`); never weaken the safety barrier toward real data.
