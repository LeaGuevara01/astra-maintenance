# GitHub: delivery controls

Verified 2026-09-07: LeaGuevara01/astra-foundation and LeaGuevara01/astra-maintenance are private. Git Credential Manager is connected. Squash merge enabled; merge/rebase merge disabled; branch cleanup enabled.

Both main protection API requests returned HTTP 403: the account requires GitHub Pro (or a public repository) for this feature. The repositories remain private. No purchase or plan change was made. CI still reports results, but GitHub cannot enforce these branch gates under the current account plan.

Until server-enforced protection is available, main merges and production remain manual approval boundaries. Agents prepare commits, PR and staging, then stop before these operations. Because the owner also authors the PR, requiring another approving GitHub review would additionally need a separate reviewer account; the pilot records human authorization in the task workflow.
