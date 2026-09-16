# Arquitectura documental objetivo

## Principios

- Separar contrato vigente, guía operativa, planificación y evidencia histórica.
- Una fuente canónica por concepto; los documentos derivados enlazan, no copian.
- Todo documento canónico declara propietario, estado, versión, última revisión y relaciones.
- El corpus externo permanece fuera de `/docs`; se referencia por `sourceId`, SHA-256 y locator.
- Ningún movimiento es automático durante esta auditoría.

## Estructura propuesta

```text
docs/
  README.md
  00-overview/
    system-overview.md
    scope.md
    glossary.md
    documentation-policy.md
  01-architecture/
    architecture-overview.md
    domain-model.md
    data-model.md
    state-machines.md
    invariants.md
    adr/
  02-domains/
    assets/
    maintenance/
    inventory/
    document-intelligence/
    security-and-access/
  03-interfaces/
    api/
    frontend/
    print-and-pdf/
  04-operations/
    configuration.md
    local-development.md
    staging.md
    backup-restore.md
    rollback.md
    monitoring.md
  05-development/
    contribution.md
    testing.md
    agent-operating-model.md
    definition-of-done.md
  06-planning/
    current-status.md
    roadmap.md
    next-task.md
  07-evidence/
    verification-index.md
    releases/
    task-handoffs/
  08-reference/
    api-contract.md
    environment-variables.md
    permissions-matrix.md
  archive/
    tasks/
    superseded/
```

El corpus se mantiene en una raíz lógica independiente, no necesariamente versionada:

```text
technical-corpus/
  indexes/
  manufacturers/
  machines/
  components/
  spare-parts/
  lubricants/
  standards/
  suppliers/
  commercial-history/
  quarantine/
```

Los originales pueden seguir fuera del repositorio. `technical-corpus/indexes` debe contener sólo manifiestos sanitizados; rutas locales y documentos privados permanecen en `.runtime` o almacenamiento autorizado.

## Mapa de migración propuesto

| Origen actual | Destino | Tratamiento |
|---|---|---|
| `PRODUCT.md` | `00-overview/scope.md` + dominios | Fusionar sin cambiar reglas |
| `API-CONTRACT.md` | `08-reference/api-contract.md` | Mantener canónico; verificar OpenAPI |
| `ADR-*.md` | `01-architecture/adr/` | Mover con redirects/enlaces |
| `AGENT-*`, `DEFINITION-OF-DONE` | `05-development/` | Consolidar referencias, no duplicar |
| `OPERATIONS.md` | `04-operations/*` | Dividir por runbook; retirar planificación vencida |
| `HANDOFF.md` | Índice compatible + `07-evidence/releases/` | Estado vivo separado de cronología; ejecutado en lote 3 |
| `VERIFICATION.md` | Estado actual + `07-evidence/verification-index.md` + releases | Evidencia partida por incremento/SHA; ejecutado en lote 3 |
| `NEXT-TASK.md`, `PLAN-STATUS.md`, `ROADMAP-EXTENDED.md` | `06-planning/` | Normalizar estados y evitar tareas consumidas |
| `ASTRA-006/007*`, `TASK-ASTRA-001` | `archive/tasks/` | Histórico enlazado desde módulos vigentes |
| `CORPUS-ANALYSIS`, `TECHNICAL-REFERENCE` | dominio documental + evidencia | Separar política del corpus de resultados fechados |
| README raíz/API/web | overview + guías por app | Mantener tres entradas, eliminar checkpoints duplicados |

## Front matter mínimo propuesto

```yaml
document_id: ASTRA-DOC-0001
title: ...
type: contract|guide|runbook|evidence|plan|archive
status: draft|current|partial|superseded|archived
owner: ...
version: ...
updated_at: YYYY-MM-DD
applies_to: commit-or-release
supersedes: []
related_code: []
technical_corpus_references: []
```

## Secuencia segura

1. Aprobar autoridad, glosario y destinos.
2. Crear índices y política editorial sin mover originales.
3. Extraer estado vivo de handoff/verificación y enlazar evidencia por SHA.
4. Reconciliar contratos contra implementación y tests.
5. Mover históricos con enlaces de compatibilidad.
6. Añadir ownership y chequeos automáticos de metadatos/enlaces.
7. Sólo después considerar eliminación; preservar Git y registrar `superseded_by`.

## Criterio de finalización de la migración

- Cada concepto tiene una fuente canónica identificable.
- Ningún documento vigente apunta a un “próximo paso” ya implementado.
- API, permisos, entidades, estados e invariantes tienen cobertura documental verificable.
- Evidencia indica checkout SHA, SHA verificado y SHA desplegado por separado.
- El inventario del sistema no contiene originales del corpus.
- Cada referencia técnica usa `sourceId` + hash + locator y conserva `A_CONFIRMAR` hasta revisión humana.
