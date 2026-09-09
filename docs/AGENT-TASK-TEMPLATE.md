# ASTRA-XXX — Agent task

## Objective
Describe one bounded observable outcome.

## Context to read
- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/API-CONTRACT.md`
- `docs/HANDOFF.md`
- task-specific ADR/roadmap/reference documents

## Base
- Integration branch: `<branch>`
- Base SHA: `<sha>`
- Agent branch/worktree: `<branch/path>`

## Ownership
Allowed paths:
- `<path>`

Forbidden unless reassigned by integrator:
- `<path>`

## Required behavior
1. ...
2. ...

## Out of scope
- ...

## Acceptance criteria
- [ ] ...
- [ ] ...

## Verification
Run and record relevant commands. Examples:
- `npm run typecheck`
- `npm test`
- `npm run build`
- `./scripts/Verify.ps1 -SkipInstall`

Do not claim checks you did not execute.

## Stop conditions
Stop and hand back to the integrator if:
- a shared API/domain contract must change
- another agent owns a required file
- technical evidence conflicts or remains uncertain
- a migration becomes destructive
- real data/secrets would be required

## Handoff output
Provide:
- final HEAD SHA
- files changed
- behavior changed
- tests/checks and results
- unrun checks
- risks/unresolved items
- next step
