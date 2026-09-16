---
document_id: ASTRA-EVIDENCE-20260916-02
title: "Procedencia y derivación asistida"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento: procedencia y derivación asistida — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — procedencia y derivación asistida"
---

# Procedencia y derivación asistida

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento: procedencia y derivación asistida — 2026-09-16;sha256=db77727c623d5e08932544d1c736e51a00344d297921f665e288a4b8a67d406e -->
## Incremento: procedencia y derivación asistida — 2026-09-16

El analizador agrega a cada evidencia una categoría inicial, relevancia, tipo de procedencia y título de fuente. Son ayudas de muestreo y priorización, no confirmaciones OEM. La cola de hallazgos permite filtrarlas y las muestra junto con aplicabilidad, locator y hash.

ADMIN puede derivar un PART_CANDIDATE con una sola acción. El backend copia los campos extraídos a DocumentCandidate, conserva `A_CONFIRMAR` cuando el PN no fue validado, registra revisión/auditoría e impide derivar referencias de equipo u OCR. El flujo no aplica catálogo ni genera movimientos de stock.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — procedencia y derivación asistida;sha256=6787c24307fe357e48b2f34d1bfd9fcc83baaa5b6d09c5b310daf4aa41eea98b -->
## 2026-09-16 — procedencia y derivación asistida

Ejecutado `scripts/Verify.ps1 -SkipInstall`. Resultado: PASS. Prisma generate y migrations OK; typecheck API/web OK; tests API 50/50 OK; build API/web OK. Puerto aislado de prueba reasignado 50391->50392 por ocupación local.

Cobertura agregada: filtros JSON por categoría, relevancia y procedencia; clasificación conservadora del analizador; derivación restringida a ADMIN y PART_CANDIDATE; rechazo de OCR_REQUIRED; copia de fuente/hash/locator/aplicabilidad; idempotencia; una sola revisión CREATE_CANDIDATE y cero movimientos de stock.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
