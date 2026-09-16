---
document_id: ASTRA-EVIDENCE-20260916-07
title: "ASTRA-DOC-001 paridad OpenAPI"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#ASTRA-DOC-001 — paridad OpenAPI documental"
  - "docs/VERIFICATION.md#2026-09-16 — ASTRA-DOC-001 paridad OpenAPI"
---

# ASTRA-DOC-001 paridad OpenAPI

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#ASTRA-DOC-001 — paridad OpenAPI documental;sha256=63c50fb35d9facee9b80839061b721bc23102019316ec4c5d3f0c49ea488c857 -->
## ASTRA-DOC-001 — paridad OpenAPI documental

En `docs/ASTRA-documentation-baseline` se añadieron a `openapi.ts` las diez operaciones documentales, sus filtros, roles, CSRF, idempotencia y schemas de fuente, candidato, revisión, hallazgo, páginas y dry-run. `apps/api/test/openapi-parity.test.ts` extrae rutas de `app.ts` y `document-review.ts`, normaliza parámetros y compara exactamente las 35 operaciones contra `openapi.paths`; también valida referencias locales de schemas.

Prueba dirigida: `npx vitest run apps/api/test/openapi-parity.test.ts --maxWorkers=1`, 2/2 PASS. El primer `Verify.ps1 -SkipInstall` quedó bloqueado después de `prisma generate` porque no estaba disponible `dockerDesktopLinuxEngine`. Se inició Docker Desktop, se confirmó engine 29.8.0 y la segunda ejecución integrada aprobó: cinco migraciones existentes sin pendientes en `astra_test`, typecheck API/web, 54/54 pruebas y build API/web. El puerto test ocupado se reasignó de 50399 a 50400. No hubo cambios de Prisma, migraciones, datos, stock ni UI; no se desplegó staging y el árbol verificado aún no tiene commit.

Intento de revisión UI posterior: `GET /health/ready` respondió `ready` y `/api/v1/version` reportó staging `c8e2efb3854caeca92e09a6a46912827775234b9`, superando la identidad anterior `a6cf1a8`. La skill de Computer Use se inicializó, pero `cua.getState()` no devolvió browsers y `cua.getBrowser({url})` respondió `No browser is available`. No se abrió UI, no se autenticó, no se ejercitaron paginaciones ni drag & drop y no se verificó footer. No usar este intento como aprobación visual.

Por decisión posterior del usuario, la aceptación visual se omite para continuar documentación. Se añadieron política documental, índice de ADR, índice de evidencia por SHA y política separada del corpus técnico. La omisión no convierte el recorrido bloqueado en PASS y no autoriza merge o producción.

Incremento operativo documental: `OPERATIONS.md` quedó como índice y se crearon cinco runbooks bajo `docs/04-operations/`: desarrollo local, verificación, staging, backup/restore y rollback. Cada runbook refleja parámetros, gates, efectos, evidencia y recuperación de los scripts existentes. No se ejecutaron deploy, backup, restore, rollback, LAN ni registro de tareas durante esta documentación.

Incremento de planificación documental: se agregó `07-evidence/capability-matrix.md` con evidencia automatizada, visual y de staging separada; `archive/README.md` define política y gates; `documentation-audit/ARCHIVE-MIGRATION-PLAN.md` propone tres lotes. No se movieron ni eliminaron archivos. El lote 1 queda pendiente de revisión de enlaces entrantes.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — ASTRA-DOC-001 paridad OpenAPI;sha256=710710993c22f0756bc6dfab40ffe477e07ee3bc2369706bb9c7672ca33b98b7 -->
## 2026-09-16 — ASTRA-DOC-001 paridad OpenAPI

Cambio funcional acotado: diez operaciones documentales y schemas agregados al OpenAPI servido. Prueba nueva de paridad estática entre ambos routers y `openapi.paths`, más resolución de `$ref` locales.

- `npx vitest run apps/api/test/openapi-parity.test.ts --maxWorkers=1`: PASS, 1 archivo y 2/2 pruebas.
- `npm run typecheck --workspace @astra/api`: PASS.
- Prisma, migraciones, datos, stock, UI y staging: sin cambios.
- `scripts/Verify.ps1 -SkipInstall`: BLOCKED después de `prisma generate`; Docker no pudo abrir `npipe:////./pipe/dockerDesktopLinuxEngine` porque el daemon no estaba disponible. No se ejecutaron migraciones ni suite PostgreSQL en ese intento.
- `npm run typecheck`: PASS para API y web.
- `npm run build`: PASS para API y web; Vite transformó 1.848 módulos.
- `git diff --check`: PASS.

Se inició Docker Desktop mediante `docker desktop start`; `docker info` confirmó engine Linux 29.8.0. Segunda ejecución de `scripts/Verify.ps1 -SkipInstall`: PASS. El contexto test reasignó el puerto ocupado 50399 a 50400, aplicó las cinco migraciones existentes sin pendientes sobre `astra_test`, aprobó typecheck API/web, 54/54 pruebas en cinco archivos y build API/web. Vite transformó 1.848 módulos.

El árbol actual completo queda verificado, pero permanece sin commit; no se le atribuye un SHA limpio ni se modifica la identidad de staging.

Intento de revisión de navegador: staging `http://localhost:4380` respondió health ready y API version `c8e2efb3854caeca92e09a6a46912827775234b9`. Computer Use no expuso ningún navegador y devolvió `No browser is available`; por ello no se ejecutaron login, paginaciones, drag & drop ni comprobación visual del footer. Estado: BLOCKED por superficie de navegador, no PASS.

Decisión de alcance: el usuario omitió la verificación visual y aprobación humana para continuar la implementación de documentación. Se validan estructura, enlaces, inventarios y diff; la cobertura visual permanece explícitamente no ejecutada.

Incremento de runbooks: documentación derivada por lectura de `Prepare.ps1`, `Start-Dev.ps1`, `Verify.ps1`, `Deploy-Staging.ps1`, `Backup.ps1`, `Restore-Check.ps1`, `Rollback-Staging.ps1`, `Enable-LanStaging.ps1`, `Register-Backup.ps1` y `New-Worktree.ps1`. No se ejecutaron esos flujos; la validación aplicable es inventario, enlaces locales y `git diff --check`.

Incremento de planificación: matriz de capacidades y plan de archivo agregados sin movimientos. Las referencias de evidencia se contrastaron con este archivo; validación aplicable: inventario, enlaces y diff.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)

## Commit funcional posterior

ASTRA-DOC-001 se registró en el commit `7cb84e8`. Después del commit se repitió `npx vitest run apps/api/test/openapi-parity.test.ts --maxWorkers=1`: 1 archivo y 2/2 pruebas PASS. `git diff --exit-code HEAD -- apps/api/src/openapi.ts apps/api/test/openapi-parity.test.ts` confirmó que ambos archivos coincidían con HEAD. La documentación aún estaba pendiente y el commit no fue desplegado.
