# ASTRA Platform Reform — Domain Map

## Organization and spatial context

- Organization
- BusinessUnit
- Site
- Area
- Field
- Plant
- Workshop
- Warehouse
- Zone
- StorageLocation
- Container

## Asset Registry

- Asset
- AssetModel
- AssetVariant
- AssetSystem
- Component
- Meter
- InstalledPart
- AssetLocationHistory

Hierarchy is semantic, not only geographic:

```text
Organization
→ Business Unit
→ Site
→ Area
→ Asset
→ System
→ Component
→ Installed Part
```

## Maintenance

- MaintenancePlan
- PlanRevision
- PlanTask
- WorkOrder
- WorkOrderTask
- Intervention
- Failure
- Symptom
- Diagnosis
- Inspection
- Checkpoint
- ResourceRequirement
- Assignment
- LaborEntry

The current preventive pilot becomes one slice of this domain; its proven generation/idempotency/snapshot rules must be preserved while generalized.

## Inventory / WMS

- ItemDefinition
- ManufacturerPartNumber
- StockBalance
- StockReservation
- StockMovement
- SerialNumber
- Batch
- ReceiptLot
- Transfer
- InventoryAdjustment

Core equation remains explicit:

`available = onHand - reserved`

but balances become location-aware.

## Resources and Safety

- Resource
- Tool
- Instrument
- Structure
- PPE
- SafetyProfile
- Risk
- Control
- Permit
- PPERequirement
- SafetyInspection

Resources may be required by a WorkOrder without becoming inventory parts.

## Technical Knowledge / Parts Intelligence

- SourceDocument
- SourceRevision
- SourceLocator
- TechnicalFinding
- TechnicalClaim
- Evidence
- Applicability
- PartEquivalent
- Alias
- ReviewDecision

Critical equivalence/applicability is evidence-backed and versioned. AI/OCR output is never sufficient on its own.

## Procurement

- Supplier
- SupplierPartObservation
- Requisition
- RequisitionLine
- RFQ
- Quote
- QuoteLine
- PurchaseOrder
- PurchaseOrderLine
- Receipt
- ReceiptLine

A shortage arising from a WorkOrder must be traceable through requisition, purchasing, receipt and reservation back to the originating need.

## Integrations

- Connector
- ConnectorCredentialReference
- ExternalReference
- SyncRun
- ProviderHealth
- WebhookReceipt

Credentials are not stored as model-visible text. Provider failure is isolated from platform-wide health.

## Operations and observability

- DomainEvent
- Alert
- SavedView
- Notification
- OperationalMetric

## AI platform

- AgentRun
- ToolDefinition
- ToolInvocation
- AIProposal
- PolicyDecision
- Approval
- EvaluationCase
- EvaluationRun

AI artifacts preserve actor, tool, input hash, evidence references, resulting command/query and outcome.

## Relationship examples

```text
Asset --contains--> AssetSystem
AssetSystem --contains--> Component
Component --has_installed--> InstalledPart
InstalledPart --references--> ItemDefinition
ItemDefinition --has_number--> ManufacturerPartNumber
ItemDefinition --equivalent_to--> ItemDefinition
WorkOrder --affects--> Asset/Component
WorkOrder --requires--> ResourceRequirement
ResourceRequirement --fulfilled_by--> Part/Tool/PPE
Failure --affects--> Component
Requisition --originates_from--> WorkOrder/Requirement
PurchaseOrder --ordered_from--> Supplier
Receipt --fulfills--> PurchaseOrder
TechnicalClaim --supported_by--> Evidence
AIProposal --proposes--> DomainCommand
```

## Migration principle

Do not rename/remove existing pilot tables immediately. Introduce additive domain structures, adapters and migration/backfill slices. Retire legacy fields only after consumers and historical behavior are proven equivalent.
