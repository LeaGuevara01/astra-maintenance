---
document_id: ASTRA-EVIDENCE-20260916-04
title: "Referencias de equipo y manual"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Ajuste: referencias de equipo/manual — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — referencias de equipo/manual"
---

# Referencias de equipo y manual

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Ajuste: referencias de equipo/manual — 2026-09-16;sha256=33bf5d8c3af51a16532e496045c691fd1d78d798db482280bc5a20085f22be2d -->
## Ajuste: referencias de equipo/manual — 2026-09-16

A pedido del usuario, los códigos de equipo o modelo dejan de tratarse como falsos positivos descartables. El analizador ahora puede emitir kind EQUIPMENT_REFERENCE cuando el código aparece en contexto de manual, instrucciones, modelo, catálogo de repuestos o equipo. Ejemplo protegido por test: EA-350 en un manual Richiger queda como referencia de equipo/manual, mientras EX-18070C en la tabla de repuestos sigue como PART_CANDIDATE. Ambos conservan A_CONFIRMAR y stockEffect NONE; ninguna referencia crea activos, candidatos ni stock automáticamente.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — referencias de equipo/manual;sha256=bf3c8e5f838b881177fc8072f188ae19b40e3cc55f6123cb94d0502a48248b94 -->
## 2026-09-16 — referencias de equipo/manual

Comandos: npm run typecheck --workspaces; npx vitest run apps/api/test/document-analysis.test.ts --maxWorkers=1.
Resultado: PASS. Cobertura agregada: EA-350 se clasifica como EQUIPMENT_REFERENCE con advertencia REFERENCIA_EQUIPO_MANUAL; EX-18070C permanece PART_CANDIDATE en contexto de tabla de repuestos.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
