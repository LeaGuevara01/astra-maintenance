# ASTRA Platform Reform — AI Native Development

## Goal

AI is both a development multiplier and a product capability. These are separate concerns and require different boundaries.

## AI for building ASTRA

Human/Product Owner
→ Integrator Agent
→ bounded specialists

Specialist roles:

- Architecture
- Backend/Domain
- Database
- Frontend/UX
- AI/Knowledge
- QA/Security
- Documentation/Evidence

Only the integrator owns cross-cutting contracts, root configuration, shared schemas, lockfile reconciliation and final integration review. At most two implementation specialists should edit concurrently unless file ownership is demonstrably independent.

Every delegated unit records:

- task ID
- objective
- base SHA
- integration branch
- specialist branch/worktree
- owned paths
- forbidden paths
- dependencies
- acceptance criteria
- verification
- stop conditions

Chat context is never project state.

## AI inside ASTRA

ASTRA Copilot is a governed interface to domain capabilities.

```text
User
→ Copilot / Intent Router
→ Context Builder
→ Evidence Retriever
→ Typed Tool Registry
→ Policy Engine
→ Query / Draft / Domain Command
→ Audit + Domain Event
```

### Capability levels

- L0 READ: search/query only.
- L1 ANALYZE: summarize, compare, diagnose, recommend with evidence.
- L2 DRAFT: create a non-executed proposal/requisition/plan/change set.
- L3 APPROVAL_REQUIRED: validated action requiring explicit authorized approval.
- L4 EXECUTE_CONTROLLED: approved, bounded domain command with idempotency/audit.

Initial production rollout should focus on L0/L1 and selected L2 workflows.

## Initial AI tools

Read tools:

- resolve_entity
- get_asset_context
- get_work_order
- list_due_maintenance
- search_parts
- get_part_stock
- get_part_equivalents
- search_technical_sources
- get_supplier_history
- get_procurement_status
- get_operational_alerts

Draft tools:

- draft_requisition
- draft_work_order
- draft_maintenance_plan_change
- draft_part_equivalence_review

Later controlled tools:

- reserve_stock
- approve_requisition
- transition_work_order
- record_intervention

Controlled tools must not bypass the same application/domain services used by the normal UI/API.

## Evidence policy

Technical answers must distinguish:

- validated internal data
- reviewed technical evidence
- unreviewed finding
- external/supplier observation
- inference
- unknown (`A_CONFIRMAR`)

No AI-generated equivalence, applicability, torque, fluid specification, interval or safety fact becomes canonical without the domain's evidence/review rules.

## Prompt-injection and document safety

Treat all source documents, OCR, emails, supplier text and imported metadata as untrusted data. Instructions embedded in sources are not agent instructions. Tools operate on structured allowlisted arguments and authenticated context.

## Evaluation

Before enabling an AI tool for production actions, maintain evaluation cases covering:

- authorization
- hallucinated entity IDs
- stale state
- duplicate/retry execution
- conflicting evidence
- prompt injection
- partial provider failure
- insufficient stock
- human rejection
- tool timeout/retry

Every AgentRun and ToolInvocation should be reconstructable from persisted metadata without storing secrets.
