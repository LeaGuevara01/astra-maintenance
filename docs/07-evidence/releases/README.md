# Registros de evidencia por incremento

Este índice conserva handoff y verificación por incremento. Cada archivo declara la identidad a la que aplica; un registro histórico no prueba el runtime ni el checkout actual.

## 2026-09-15

- [Persistencia de revisión documental y corpus autorizado](2026-09-15/01-document-review-persistence.md)
- [Paginación e historial documental](2026-09-15/02-document-pagination-and-history.md)
- [Cola de revisión por fuente](2026-09-15/03-source-review-queue.md)
- [Analizador documental dry-run](2026-09-15/04-document-analysis-dry-run.md)

## 2026-09-16

- [Hallazgos asistidos persistentes](2026-09-16/01-assisted-findings.md)
- [Procedencia y derivación asistida](2026-09-16/02-provenance-and-derivation.md)
- [Segmentación por ítem de catálogo](2026-09-16/03-catalog-row-segmentation.md)
- [Referencias de equipo y manual](2026-09-16/04-equipment-references.md)
- [Vertical slice UI de entidades](2026-09-16/05-ui-entity-slice.md)
- [Base y consolidación documental](2026-09-16/06-documentation-baseline.md)
- [ASTRA-DOC-001 paridad OpenAPI](2026-09-16/07-openapi-parity.md)
- [Consolidación y archivo documental](2026-09-16/08-documentation-archive-lots.md)
- [Integración de ASTRA-DOC-001 y staging](2026-09-16/09-main-integration-and-staging.md)

## Integridad

La extracción se ejecutó con `tools/extract-documentation-evidence.mjs`. El manifiesto local `.runtime/documentation-audit/lot-3-manifest.json` verificó 35 bloques en 12 registros antes de compactar los índices fuente.

Los comentarios `source-block` de cada registro conservan heading, origen y SHA-256 normalizado. No deben retirarse sin una migración de evidencia equivalente.
