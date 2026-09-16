---
document_id: ASTRA-EVIDENCE-20260916-05
title: "Vertical slice UI de entidades"
type: evidence
status: historical
owner: integrator
updated_at: 2026-09-16
applies_to: a6cf1a8a38aa6670066fa477dfe1f4c96c199d87
staging: historical
source_sections:
  - "docs/HANDOFF.md#Vertical slice UI de entidades — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — vertical slice UI de entidades"
---

# Vertical slice UI de entidades

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Vertical slice UI de entidades — 2026-09-16;sha256=e9d602ca21a3544e04596e6630cb7e5defa199d0ceda37f3610a1f0a67a5b276 -->
## Vertical slice UI de entidades — 2026-09-16

Solicitud: ejecutar la arquitectura UI planificada de forma progresiva. Implementado el primer slice `DocumentFinding → DocumentCandidate` en `feat/document-review-history`; sin migración nueva.

El frontend incorpora primitives tipadas de entidad/badge/fila/drop zone, adapta hallazgos documentales, compacta los siete filtros bajo “Filtros avanzados”, limita el scan a cinco badges, separa inspector rápido de evidencia completa y agrega preview de derivación. Drag & drop sólo está disponible para ADMIN y `PART_CANDIDATE`; en móvil se oculta. La acción “Preparar derivación” ofrece el mismo recorrido por click/teclado. Ambos caminos confirman antes de usar el endpoint idempotente existente. No cambió API, Prisma, stock ni reglas de permisos.

Verificación: `scripts/Verify.ps1 -SkipInstall` aprobó migraciones existentes sobre `astra_test`, typecheck API/web, 52/52 pruebas y build API/web. La primera ejecución se detuvo por un error TypeScript en `onDragEnd`; fue corregido y no se atribuye aprobación a ese intento.

Revisión visual inicial: runtime local aislado `http://127.0.0.1:4310`, entorno test y `commit=unknown`, con base sintética separada `astra_ui_slice`. ADMIN abrió `/documents`, comprobó filtros colapsados, cinco badges, inspector, evidencia colapsable y preview por click; confirmó una derivación. Lectura posterior: un `DocumentCandidate`, hallazgo `CREATE_CANDIDATE`, cero `StockMovement`. Esta evidencia inicial no constituye staging.

Commit funcional `a6cf1a8a38aa6670066fa477dfe1f4c96c199d87`: Verify limpio aprobó cinco migraciones existentes, 52/52 pruebas, typecheck y build API/web. Deploy-Staging creó backup `.runtime/backups/staging/20260916-035235-217.dump`, aplicó cero migraciones nuevas y publicó ese SHA. `/health/ready`, `/api/v1/version` y footer coincidieron.

Revisión dirigida sobre staging `http://localhost:4380/documents`: ADMIN comprobó lista compacta, cinco badges, filtros avanzados colapsados, inspector y preview de derivación; canceló antes de persistir. TECHNICIAN conservó lectura y revisión, sin drop target ni acción de derivar. VIEWER mostró sólo lectura, sin textarea ni acciones. La ventana automatizada fue menor a 800 px: validó el fallback responsive y por click, pero no el gesto físico de drag & drop, oculto intencionalmente en ese breakpoint. Se conservaron tres candidatos visibles; no se confirmó ninguna mutación en staging.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — vertical slice UI de entidades;sha256=14d4a13a32782fe66672be768c74609f78747c284239bfafc5ee9325eeceae35 -->
## 2026-09-16 — vertical slice UI de entidades

Comando final: `scripts/Verify.ps1 -SkipInstall`. Resultado: PASS. Prisma generate, cinco migraciones existentes en `astra_test`, typecheck API/web, 52/52 pruebas y build API/web aprobados. El primer intento falló en typecheck porque `EntityRow` no desestructuraba `onDragEnd`; se corrigió antes de la ejecución aprobada.

Revisión dirigida en navegador sobre runtime aislado `http://127.0.0.1:4310`, environment test, commit `unknown`, base sintética separada `astra_ui_slice`: ADMIN visualizó un `PART_CANDIDATE` con cinco badges, inspector rápido, evidencia Nivel 3 colapsable, filtros avanzados colapsados y preview de asociación. La alternativa por click confirmó la derivación. Estado posterior: un candidato, hallazgo `CREATE_CANDIDATE`, cero movimientos de stock. No se ejercitó el gesto físico de drag & drop ni roles TECHNICIAN/VIEWER en navegador. No hubo despliegue ni evidencia de staging.

Commit funcional limpio: `a6cf1a8a38aa6670066fa477dfe1f4c96c199d87`. `Verify.ps1 -SkipInstall` volvió a aprobar 52/52 pruebas, typecheck y build API/web sobre ese SHA. `Deploy-Staging.ps1 -SkipVerify` creó backup `.runtime/backups/staging/20260916-035235-217.dump`, aplicó las migraciones existentes sin pendientes y publicó el commit. Health ready, API version y footer coincidieron en `a6cf1a8`.

Revisión de staging en Edge: ADMIN mostró la capacidad de preparar derivación sólo para `PART_CANDIDATE`, abrió el preview y canceló sin persistir. TECHNICIAN leyó la misma cola y mantuvo acciones de revisión, sin derivación/drop target. VIEWER no mostró motivo ni acciones de revisión. El viewport automatizado fue menor a 800 px, por lo cual el drop target quedó oculto según el CSS responsive y se validó la alternativa por click; el gesto físico de arrastre desktop permanece sin cobertura de navegador. Los tres candidatos visibles se conservaron y no se confirmó ninguna operación de escritura durante este recorrido.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
