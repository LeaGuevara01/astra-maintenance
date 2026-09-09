# ASTRA Definition of Done — multi-agent work

A task is not done merely because code was generated or a local happy path worked.

## Scope
- [ ] Work matches an identified ASTRA task/Issue and acceptance criteria.
- [ ] Diff stays inside assigned ownership or exceptions are documented and approved by the integrator.
- [ ] No unrelated agent work was overwritten.

## Domain and data
- [ ] No unsupported OEM/technical value was invented; unknowns remain `A_CONFIRMAR`.
- [ ] Authorization and business invariants remain enforced server-side where applicable.
- [ ] Historical closed records/snapshots remain immutable.
- [ ] Stock/order writes preserve transactional and retry-safe behavior where applicable.
- [ ] Migrations are reviewed for compatibility, data preservation and isolated test execution.

## Quality
- [ ] Relevant tests were added/updated for changed behavior.
- [ ] Typecheck/lint/build/tests required by the modified paths pass, or failures are recorded exactly.
- [ ] Secrets, `.runtime`, credentials, private source originals and generated local evidence are not committed.

## Integration
- [ ] Shared API/domain changes are reflected in canonical contracts.
- [ ] `current HEAD`, `last verified SHA` and `staging SHA` are not conflated in evidence.
- [ ] Handoff contains exact commands/results, unresolved risks and next steps.
- [ ] PR is reviewable and describes behavior, verification and data/recovery impact.

## Human boundary
- [ ] No merge to `main` and no production deployment occurred without explicit human approval.
