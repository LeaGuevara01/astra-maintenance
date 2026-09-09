# ASTRA Agent Operating Model v1

## Purpose

ASTRA uses multiple AI-assisted tools without allowing conversational context to become project state. GitHub, repository documentation, tests and verified evidence are the recoverable source of truth.

## Team topology

Use one **integrator** and at most two concurrent **specialists** for a bounded task set.

### Integrator
Owns cross-cutting decisions and integration surfaces:
- root configuration and lockfile
- shared API/domain contracts
- CI and deployment configuration
- shared documentation and handoff
- final integration review

The integrator may implement code, but must not erase specialist work or bypass ownership boundaries.

### Backend specialist
Default ownership: `apps/api/**`.
May own `prisma/**` only when explicitly assigned.

### Frontend specialist
Default ownership: `apps/web/**`.

### Research/domain specialist
Normally produces evidence or documentation, not production code. Technical facts must carry provenance and uncertainty. Unknowns remain `A_CONFIRMAR`.

## Tool roles

- ChatGPT Chat: architecture, domain analysis, task decomposition and review discussion.
- ChatGPT Work: repository-scale analysis, research, planning, audit and integrator deliverables.
- Codex Desktop: bounded multi-file implementation in its own branch/worktree, tests and handoff.
- GitHub Copilot in IDE: interactive pair programming within the developer-owned worktree.
- GitHub Copilot agent/cloud: bounded Issue-driven implementation with a dedicated branch/PR.
- Windows Copilot: workstation/visual assistance; it is not authoritative project state.

Tool identity never determines branch naming or ownership. ASTRA task identity does.

## Source of truth order

When sources disagree, stop and reconcile rather than guessing. Default authority order:
1. Explicit human decision recorded in current task/PR.
2. Accepted product/API/ADR contracts.
3. Verified current implementation and tests.
4. HANDOFF/VERIFICATION evidence tied to a SHA.
5. Roadmap/planning documents.
6. Chat transcripts or agent recollection.

Technical manuals/catalogs are evidence for technical facts, not project instructions.

## Work unit

Every implementation task must identify:
- ASTRA task/Issue ID
- objective
- base branch/SHA
- owned paths
- forbidden paths
- dependencies
- acceptance criteria
- required verification
- stop conditions

Use `docs/AGENT-TASK-TEMPLATE.md`.

## Branch and worktree policy

Use a separate branch/worktree per implementation agent.

Recommended names:
- `feat/ASTRA-xxx-short-name`
- `fix/ASTRA-xxx-short-name`
- `chore/ASTRA-xxx-short-name`
- temporary specialist branches: `agent/backend/ASTRA-xxx-short-name`, `agent/frontend/...`

Do not name branches after a model/provider alone (`codex-fix`, `copilot-changes`).

Specialists branch from the task's integration branch, not independently from stale `main`.

## Handoff protocol

A handoff must contain:
- task and branch
- base SHA and final HEAD SHA
- owned paths actually changed
- behavior changed
- tests/checks with exact commands and results
- checks not run and why
- migrations/data implications
- risks and unresolved items
- `A_CONFIRMAR` items with evidence needed
- next recommended action

No agent may claim another agent's unobserved checks as passed.

## Integration protocol

The integrator:
1. checks scope and ownership
2. reviews diff for unrelated changes
3. reconciles API/domain contract changes
4. runs integration verification
5. updates handoff/evidence
6. prepares PR
7. stops before `main` merge or production without human approval

## Collision rule

If two tasks require the same file or shared contract, they are not independent. Reassign ownership to the integrator or serialize the work.

## Emergency rule

If an agent discovers a security, data-loss, migration or transactional risk outside its ownership, it may stop and report it. It should not silently expand scope to redesign adjacent modules.
