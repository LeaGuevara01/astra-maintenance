# ASTRA-XXX — Agent task

## Identity

- Task/Issue: `ASTRA-XXX` / `<URL or versioned task path>`
- State: `PROPOSED | ASSIGNED | IN_PROGRESS | HANDOFF_READY | INTEGRATED | CLOSED | BLOCKED`
- Integrator: `<name or handle>`
- Specialist role: `backend | frontend | database | research | none`

## Objective
Describe one bounded observable outcome.

## Context to read
- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/API-CONTRACT.md`
- `docs/HANDOFF.md`
- task-specific ADR/roadmap/reference documents

## Base and workspace

- Integration branch: `<branch>`
- Integration base SHA: `<full SHA>`
- Agent branch: `<branch>`
- Agent worktree: `<absolute or repository-relative path>`

Before editing, record `git status --short --branch` and confirm the worktree is not occupied by another task.

## Ownership
Allowed paths:
- `<path>`

Forbidden unless reassigned by integrator:
- `<path>`

## Dependencies and collision check

- Depends on: `<task/SHA or none>`
- Blocks: `<task or none>`
- Shared files/contracts touched: `<path or none>`
- Collision review: `<result and integrator decision>`

## Contract and data impact

- Product/API/ADR change: `<yes/no; document>`
- Prisma/migration ownership: `<assigned/not assigned/not applicable>`
- Data, stock or historical-record impact: `<description or none>`
- Technical evidence / `A_CONFIRMAR`: `<sources and unresolved facts or none>`

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

## Specialist handoff

- State: `HANDOFF_READY | BLOCKED`
- Integration base SHA:
- Final specialist HEAD SHA:
- Branch/worktree:
- Owned paths actually changed:
- Behavior changed:
- Contract/data/migration impact:
- Checks executed, with exact commands and results:
- Checks not executed and why:
- Risks and unresolved `A_CONFIRMAR` items:
- Next recommended action:

## Integrator acceptance

- Scope/ownership review:
- Dependency order and collision review:
- Integration method and resulting SHA:
- Integration checks executed and results:
- Current HEAD:
- Last verified SHA/tree:
- Staging SHA or `NOT_DEPLOYED`:
- Checks not executed and why:
- Final state: `INTEGRATED | CLOSED | BLOCKED`
