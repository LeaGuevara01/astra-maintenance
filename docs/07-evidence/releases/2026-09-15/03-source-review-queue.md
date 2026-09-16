---
document_id: ASTRA-EVIDENCE-20260915-03
title: "Cola de revisión por fuente"
type: evidence
status: historical
owner: integrator
updated_at: 2026-09-16
applies_to: 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f
staging: historical
source_sections:
  - "docs/HANDOFF.md#Incremento: cola de revisión por fuente"
  - "docs/VERIFICATION.md#Cola de revisión por fuente — 2026-09-15"
---

# Cola de revisión por fuente

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento: cola de revisión por fuente;sha256=0f52f1090cc7d2d10eca0cc722914ddb6ef87c158b16b38787dd0f452bb82b69 -->
## Incremento: cola de revisión por fuente

Rama feat/document-review-history. Agregada cola de fuentes previa a candidatos en /documents: endpoint GET /document-candidates/sources/page y UI con filtros por extractionStatus, familia/equipo y prioridad. La cola lee DocumentRevision y metadatos de auditoría DOCUMENT_SOURCE_IMPORTED; no requiere migración, no crea candidatos, no decide revisiones y no modifica stock. La prioridad es operativa y conservadora: OCR_REQUIRED/VISUAL_REVIEW_REQUIRED y familias reconocidas suben revisión; duplicados o fuentes ya derivadas bajan prioridad.

La derivación posterior conserva el límite técnico: partNumber desconocido A_CONFIRMAR, locator de página/hoja, sha256 de revisión y aplicabilidad declarada. La familia se infiere del título para organizar revisión, no como validación OEM.

Verificación y redeploy: commit funcional 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f pasó Verify.ps1 -SkipInstall (45 pruebas, typecheck y build) y fue desplegado en staging con backup previo .runtime/backups/staging/20260916-014526-173.dump. Health ready y /api/v1/version coincidieron. Revisión visual dirigida en Edge aprobó /documents con cola real, filtros OCR_REQUIRED + John Deere + ALTA, footer 2b6cd689, candidatos 0 y comparación deshabilitada. Evidencia local: .runtime/visual-review/documents-source-queue-desktop.png.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#Cola de revisión por fuente — 2026-09-15;sha256=be002a273c921a3c4e7d19d9fd5342efa0f51221700e19bb0662919cd9af0b0d -->
## Cola de revisión por fuente — 2026-09-15

Commit funcional 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f. Verify.ps1 -SkipInstall aprobado sobre commit limpio: Prisma generate, migración astra_test sin pendientes, typecheck API/web, 45 pruebas y build API/web. Deploy-Staging.ps1 -SkipVerify finalizó con backup previo .runtime/backups/staging/20260916-014526-173.dump, migración staging sin pendientes, health ready y /api/v1/version en 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f.

Revisión visual dirigida en Edge sobre http://localhost:4380/documents: login ADMIN existente, footer v0.1.0 · 2b6cd689, 695 DocumentRevision, 0 DocumentCandidate y 695 auditorías DOCUMENT_SOURCE_IMPORTED. La cola muestra fuentes reales, filtros por extractionStatus/familia/prioridad y detalle con SHA, páginas/OCR y "Sin derivar". Filtro probado: OCR_REQUIRED + John Deere + ALTA, con resultados John Deere y detalle de páginas OCR. Captura local: .runtime/visual-review/documents-source-queue-desktop.png. No se crearon candidatos ni movimientos de stock.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
