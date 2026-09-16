---
document_id: ASTRA-EVIDENCE-20260916-08
title: "Consolidación y archivo documental"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento documental: archivo histórico, lote 1 — 2026-09-16"
  - "docs/HANDOFF.md#Incremento documental: revisión del lote 2 — 2026-09-16"
  - "docs/HANDOFF.md#Incremento documental: diseño del lote 3 — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — archivo histórico, lote 1"
  - "docs/VERIFICATION.md#2026-09-16 — revisión documental del lote 2"
  - "docs/VERIFICATION.md#2026-09-16 — diseño de extracción del lote 3"
---

# Consolidación y archivo documental

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento documental: archivo histórico, lote 1 — 2026-09-16;sha256=43328f024d7be65d4a6a98af9e84a389760dcf0a81e368f94cb4f709dcaecae5 -->
## Incremento documental: archivo histórico, lote 1 — 2026-09-16

Se movieron mediante Git cuatro documentos cerrados desde la raíz de `docs/` a `docs/archive/tasks/`: ASTRA-001, ASTRA-006, ASTRA-007 y la revisión ASTRA-007. Cada archivo conserva su contenido histórico, declara origen y fecha, y enlaza sucesores canónicos. Se retiraron de ASTRA-006/007 encabezados que afirmaban vigencia actual.

El cambio es exclusivamente documental: no modifica aplicación, base de datos, corpus externo, stock ni staging. No se hizo commit, push, merge o despliegue. La revisión visual permanece omitida por instrucción del usuario.
<!-- end-source-block -->

<!-- source-block:docs/HANDOFF.md#Incremento documental: revisión del lote 2 — 2026-09-16;sha256=12bf0ed8a35083761ec3eeb9d216aeec3e95199804fcefbe22c25a5c9c5d48a9 -->
## Incremento documental: revisión del lote 2 — 2026-09-16

Se contrastaron los cinco planes del lote 2 con código y evidencia. No se archivó ninguno: IA documental y arquitectura UI conservan fases pendientes; desarrollo autónomo sigue gobernando la secuencia; roadmap y PLAN-STATUS conservan planificación futura. Se actualizaron los estados del plan IA, el plan UI y el encabezado del roadmap para separar implementación comprobada de alcance pendiente.
<!-- end-source-block -->

<!-- source-block:docs/HANDOFF.md#Incremento documental: diseño del lote 3 — 2026-09-16;sha256=6d069f4a06914e006e749a8d316952a512c9f7284b6f9533d4fd95fbcce6b59c -->
## Incremento documental: diseño del lote 3 — 2026-09-16

Se diseñó la extracción mecánica de este registro y `VERIFICATION.md` hacia doce archivos por incremento bajo `07-evidence/releases/`. Ambos archivos raíz permanecerán como índices compatibles. No se movió ni retiró contenido en esta fase; la ejecución exige hashes lógicos, mapa completo de secciones y cero enlaces rotos.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — archivo histórico, lote 1;sha256=6f11501cf41ba60f4566146943ed531eea6cc42756f83491b1ba58a80898d4e3 -->
## 2026-09-16 — archivo histórico, lote 1

Alcance: movimiento Git de cuatro documentos a `docs/archive/tasks/`, actualización de índices y regeneración del inventario documental. Controles aplicables: resolución de enlaces Markdown locales, consistencia del inventario y `git diff --check`. No corresponde atribuir una nueva ejecución funcional ni modificar la evidencia del SHA previamente verificado. Revisión visual omitida por instrucción del usuario.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — revisión documental del lote 2;sha256=e7581af4b6303fd3acfd81cef97dc9e7d635958115593dfd9f35ebf25ff51316 -->
## 2026-09-16 — revisión documental del lote 2

Contraste read-only contra `apps/api`, `apps/web`, Prisma, scripts y evidencia previa. Resultado: cinco documentos retenidos; cero movimientos y eliminaciones. Se corrigieron exclusivamente estados y referencias documentales. Controles aplicables: inventario, enlaces Markdown y `git diff --check`; no se ejecutó una nueva prueba funcional ni revisión visual.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — diseño de extracción del lote 3;sha256=2f7358d48081890822184f6f3ffdd27c460189028cfa9e975506fb07048441d4 -->
## 2026-09-16 — diseño de extracción del lote 3

Alcance exclusivamente documental: inventario de headings y referencias entrantes, definición de doce destinos, contrato de metadata, preservación literal, hashes lógicos y compatibilidad de enlaces. No se copiaron ni retiraron aún bloques de `HANDOFF.md` o `VERIFICATION.md`; no corresponde atribuir una nueva prueba funcional.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)

## Ejecución posterior del lote 3

El 2026-09-16 la herramienta `tools/extract-documentation-evidence.mjs --copy` generó doce registros y validó 35 bloques mediante SHA-256 normalizado. El manifiesto confirmó cero secciones de handoff sin asignar y retuvo únicamente `Pendientes de verificación` como contenido vigente. Sólo después se ejecutó `--compact` sobre los dos índices.
