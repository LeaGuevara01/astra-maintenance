---
document_id: ASTRA-EVIDENCE-20260916-03
title: "Segmentación por ítem de catálogo"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento: segmentación por ítem de catálogo — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — segmentación por ítem de catálogo"
---

# Segmentación por ítem de catálogo

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento: segmentación por ítem de catálogo — 2026-09-16;sha256=71826fe5ae30503305e3bd4b06482dba84f192193df959990906bfd731ca3ff9 -->
## Incremento: segmentación por ítem de catálogo — 2026-09-16

La categorización ya no usa indiscriminadamente todo el fragmento vecino. El analizador reconstruye filas horizontales y tablas PDF extraídas verticalmente como `ítem + descripción + código + cantidad`, clasifica ese bloque y conserva el contexto amplio por separado. La UI presenta “Renglón identificado” y permite desplegar “Ver contexto vecino”. Esto reduce categorías heredadas de la pieza siguiente y mantiene el texto original disponible para revisión.

Verificación: scripts/Verify.ps1 -SkipInstall aplicó la migración en astra_test, ejecutó db:generate, typecheck API/web, 49 tests y build API/web correctamente. Durante test se reasignó el puerto de base test de 50387 a 50388 por ocupación local.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — segmentación por ítem de catálogo;sha256=e4842897930c06023a9826b5a4cc0a9572f6093c9067becb72f314271a743deb -->
## 2026-09-16 — segmentación por ítem de catálogo

Ejecutado `scripts/Verify.ps1 -SkipInstall`. Resultado: PASS. Prisma generate y migrations OK; typecheck API/web OK; tests API 52/52 OK; build API/web OK. Puerto aislado de prueba reasignado 50393->50394.

Muestreo real adicional sobre 12 fuentes y 85 hallazgos: las filas verticales del manual Richiger EA350 se reconstruyen por ítem. EX-18070C queda como protector/estructura-transmisión y MP0124 como rodamiento, ambos con procedencia TABLA_REPUESTOS; el contexto vecino se conserva separado para inspección humana.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
