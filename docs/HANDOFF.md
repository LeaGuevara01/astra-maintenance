# Registro de handoff — actualizado 2026-09-16

El estado vigente está en [CURRENT-STATUS.md](CURRENT-STATUS.md) y el trabajo siguiente en [NEXT-TASK.md](NEXT-TASK.md). Este archivo es un índice compatible de continuidad; los bloques cronológicos fueron extraídos con integridad verificada a registros por incremento.

## Identidad de continuidad

- Rama documental: `docs/ASTRA-documentation-baseline`.
- Base de la rama: `c8e2efb3854caeca92e09a6a46912827775234b9`.
- OpenAPI: commit funcional `7cb84e8`, prueba dirigida posterior 2/2; no desplegado.
- Documentación: consolidación validada y separada del commit funcional; consultar Git para su identidad final.
- Staging observado: identidad API `c8e2efb`; los cambios locales no están desplegados.

## Registros por incremento

| ID | Incremento | Identidad declarada | Evidencia |
|---|---|---|---|
| ASTRA-EVIDENCE-20260915-01 | Persistencia de revisión documental y corpus autorizado | `multiple-historical-sha` | [registro](07-evidence/releases/2026-09-15/01-document-review-persistence.md) |
| ASTRA-EVIDENCE-20260915-02 | Paginación e historial documental | `working-tree-on-54beabe` | [registro](07-evidence/releases/2026-09-15/02-document-pagination-and-history.md) |
| ASTRA-EVIDENCE-20260915-03 | Cola de revisión por fuente | `2b6cd68943018c45ec73ac71ad5abe3807ca3e6f` | [registro](07-evidence/releases/2026-09-15/03-source-review-queue.md) |
| ASTRA-EVIDENCE-20260915-04 | Analizador documental dry-run | `A_CONFIRMAR` | [registro](07-evidence/releases/2026-09-15/04-document-analysis-dry-run.md) |
| ASTRA-EVIDENCE-20260916-01 | Hallazgos asistidos persistentes | `working-tree` | [registro](07-evidence/releases/2026-09-16/01-assisted-findings.md) |
| ASTRA-EVIDENCE-20260916-02 | Procedencia y derivación asistida | `working-tree` | [registro](07-evidence/releases/2026-09-16/02-provenance-and-derivation.md) |
| ASTRA-EVIDENCE-20260916-03 | Segmentación por ítem de catálogo | `working-tree` | [registro](07-evidence/releases/2026-09-16/03-catalog-row-segmentation.md) |
| ASTRA-EVIDENCE-20260916-04 | Referencias de equipo y manual | `working-tree` | [registro](07-evidence/releases/2026-09-16/04-equipment-references.md) |
| ASTRA-EVIDENCE-20260916-05 | Vertical slice UI de entidades | `a6cf1a8a38aa6670066fa477dfe1f4c96c199d87` | [registro](07-evidence/releases/2026-09-16/05-ui-entity-slice.md) |
| ASTRA-EVIDENCE-20260916-06 | Base y consolidación documental | `working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9` | [registro](07-evidence/releases/2026-09-16/06-documentation-baseline.md) |
| ASTRA-EVIDENCE-20260916-07 | ASTRA-DOC-001 paridad OpenAPI | `working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9` | [registro](07-evidence/releases/2026-09-16/07-openapi-parity.md) |
| ASTRA-EVIDENCE-20260916-08 | Consolidación y archivo documental | `working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9` | [registro](07-evidence/releases/2026-09-16/08-documentation-archive-lots.md) |

## Lectura segura

- Un registro histórico no prueba el estado del runtime actual.
- Checkout, SHA verificado y SHA desplegado son identidades independientes.
- Ningún registro documental autoriza aplicar catálogo, modificar stock, mergear main o desplegar producción.
- Las cifras técnicas y equivalencias conservan sus límites originales y `A_CONFIRMAR` cuando corresponde.
