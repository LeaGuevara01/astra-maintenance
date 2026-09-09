---
applyTo: "docs/**,.github/**,AGENTS.md,README.md"
---
# Documentation and coordination ownership

The integrator normally owns shared documentation, repository instructions, CI/configuration and cross-agent contracts.

- Keep product truth, API contract, task scope, operational evidence and future plans separate.
- Do not claim a SHA is verified unless the recorded checks actually ran against that SHA.
- When recording state, distinguish `current HEAD`, `last fully verified SHA` and `staging SHA`.
- Update handoff documents when a task changes operational state, verification evidence or next steps.
- Avoid duplicating rules across `AGENTS.md`, Copilot instructions and domain docs; link to the canonical source instead.
