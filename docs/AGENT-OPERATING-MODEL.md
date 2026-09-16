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
1. Accepted product/API/ADR contracts. A new human decision supersedes them only after the integrator records it in the applicable canonical contract.
2. Explicit human decisions recorded in the current task/PR that do not conflict with accepted contracts.
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

## Assignment gate

No implementation specialist starts until the integrator has recorded the work unit in a GitHub Issue or an equivalent versioned task file. The assignment must include the exact integration branch and base SHA, the specialist branch/worktree, owned and forbidden paths, dependencies, acceptance criteria, required verification and stop conditions.

Before assignment, the integrator checks `git status`, `git worktree list` and the active task/PR set. A dirty or occupied worktree is not reused, cleaned or reassigned without its owner. If two proposed tasks touch the same file or shared contract, they are serialized or returned to the integrator.

Allowed task states are:

1. `PROPOSED`: scope exists but no agent owns implementation.
2. `ASSIGNED`: branch, base SHA, ownership and dependencies are recorded.
3. `IN_PROGRESS`: the assigned agent is editing only its owned scope.
4. `HANDOFF_READY`: final SHA and complete verification evidence are available.
5. `INTEGRATED`: the integrator accepted the diff into the integration branch and recorded the resulting SHA.
6. `CLOSED` or `BLOCKED`: acceptance is complete, or an explicit stop condition prevents progress.

Chat status alone never advances this state machine.

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

The handoff must also state the task state, integration base SHA, dependencies, whether any shared contract changed, and the specialist branch/worktree. A branch name, a working directory and a final commit are different identities and must not be conflated.

No agent may claim another agent's unobserved checks as passed.

## Integration protocol

The integrator:
1. confirms the handoff is `HANDOFF_READY` and the final specialist SHA descends from the assigned base
2. checks scope and ownership, including dirty/untracked files in every affected worktree
3. reviews the specialist diff against the recorded base for unrelated changes
4. integrates one dependency-ordered change at a time and records the resulting integration SHA
5. reconciles API/domain contract changes before accepting dependent frontend or data work
6. runs verification on the integrated tree; specialist checks are evidence, not a substitute for integration checks
7. records current HEAD, last verified SHA and staging SHA independently
8. updates handoff/evidence and prepares the PR
9. stops before `main` merge or production without human approval

The integrator records checks not run and why. A later documentation-only commit does not inherit a previous clean-SHA verification implicitly; evidence must name the exact SHA or explicit working tree to which it applies.

## Automated coordination gate

`npm run agents:check` validates that the canonical task, Issue and PR templates retain the fields required by this model and that repository instructions still link to the canonical coordination documents. CI runs this check so coordination contracts cannot silently lose required identity, ownership, dependency or verification fields.

## Collision rule

If two tasks require the same file or shared contract, they are not independent. Reassign ownership to the integrator or serialize the work.

## Emergency rule

If an agent discovers a security, data-loss, migration or transactional risk outside its ownership, it may stop and report it. It should not silently expand scope to redesign adjacent modules.
