---
applyTo: "apps/web/**"
---
# Frontend ownership

The frontend specialist owns `apps/web/**` only unless the task explicitly grants additional paths.

- Consume the API contract; do not re-implement backend business rules as the only guard.
- Respect ADMIN, TECHNICIAN and VIEWER capabilities in navigation and actions.
- Display unknown or unverified technical values as `A_CONFIRMAR` rather than inventing replacements.
- Preserve deterministic printable A6/A4 behavior when touching cards or layout.
- Changes to shared API shapes require integrator coordination before implementation.
- Keep edits localized and do not modify root configuration or lockfiles without integrator ownership.
