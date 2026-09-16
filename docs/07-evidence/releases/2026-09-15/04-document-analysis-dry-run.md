---
document_id: ASTRA-EVIDENCE-20260915-04
title: "Analizador documental dry-run"
type: evidence
status: historical
owner: integrator
updated_at: 2026-09-16
applies_to: A_CONFIRMAR
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento: analizador documental dry-run"
  - "docs/VERIFICATION.md#Analizador documental dry-run — 2026-09-15"
---

# Analizador documental dry-run

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento: analizador documental dry-run;sha256=f10f820f2607aa3bef534a61e704cc1606bff31007ef1d435ceea46c633d721b -->
## Incremento: analizador documental dry-run

Solicitud del usuario: documentar y empezar implementación de revisión automática con analizadores IA. Agregado plan en docs/DOCUMENT-AI-REVIEW-PLAN.md y primer módulo local sin proveedor externo: apps/api/src/document-analysis.ts. El comando npm run documents:analyze-sample lee .runtime/sources/index.json, analiza textos extraídos de una muestra y escribe analyses.json, findings.json y summary.json bajo .runtime/document-analysis. Los hallazgos nacen A_CONFIRMAR, stockEffect:NONE, con sourceId, sha256, locator, snippet y advertencias. No usa base de datos, no crea candidatos y no modifica stock.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#Analizador documental dry-run — 2026-09-15;sha256=20f2610eb98b5fe02d4d8cbfe86f392a6f0acd29870a06a576fad874bb4302ce -->
## Analizador documental dry-run — 2026-09-15

Implementación inicial sin proveedor externo: `document-analysis.ts` genera hallazgos revisables `A_CONFIRMAR` con `stockEffect:NONE`; `documents:analyze-sample` escribe resultados locales en `.runtime/document-analysis`. Ejecutado sobre `.runtime/sources/index.json` con 12 fuentes piloto: 85 hallazgos, 84 `PART_CANDIDATE` y 1 `OCR_REQUIRED`; familias cubiertas: John Deere, Case IH/Puma, Husqvarna/MZ, STIHL, Siembra/PLA/MXY, Toyota Hilux, Rodamientos/retenes y A clasificar. Salidas: `.runtime/document-analysis/analyses.json`, `findings.json`, `summary.json`.

Verificación ejecutada: `npx vitest run apps/api/test/document-analysis.test.ts apps/api/test/document-intelligence.test.ts --maxWorkers=1` aprobó 12/12; `npm run typecheck --workspaces` aprobó; suite completa con PostgreSQL aislado `astra_test` aprobó 48/48 tras migraciones sin pendientes. No hubo escrituras en staging, stock ni candidatos.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
