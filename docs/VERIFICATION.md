# Verificación de ASTRA Maintenance

Actualizado: 2026-09-15. Este archivo separa evidencia ejecutada de pendientes. El historial detallado anterior permanece en Git.

## Base anterior y staging comprobado

SHA: 3b2223de05f4a514ca4c664cefa81019373c3974.

| Evidencia | Resultado | Alcance |
| --- | --- | --- |
| .runtime/test/verification.json | dirty=false; typecheck, tests y build registrados como completados | SHA exacto de la base funcional; 2026-09-15 00:02:34 UTC (14/09 21:02 Argentina) |
| GET http://localhost:4380/health/ready | HTTP 200, status=ready | Consulta en vivo durante el análisis del 15/09 |
| GET http://localhost:4380/api/v1/version | HTTP 200; staging; commit=3b2223de05f4a514ca4c664cefa81019373c3974 | Identidad del despliegue confirmada |
| docker info | Servidor 29.8.0 | Motor disponible durante el análisis |
| Repositorio antes de consolidar | Limpio en 3b2223d | Sin cambios de usuario pendientes |

El registro de pruebas fue leído, no regenerado en esta consolidación. No se atribuye al nuevo commit documental una ejecución de pruebas inexistente. No se modifica verification.json para sustituir su SHA.

## Evidencia histórica reutilizable

- ASTRA-005, b21b347: circuito de interfaz con ADMIN, TECHNICIAN y VIEWER completado sobre OT-000006, cerrada OPERATIVE. PDF A6/A4 descargados y revisados visualmente.
- En ese checkpoint se comprobaron bloqueos por tareas/checkpoints críticos, inmutabilidad del cierre y replay sin duplicación.
- El flujo operativo del piloto tiene evidencia previa de backup/restauración aislada, rechazo de checksum corrupto, rollback con preservación de datos y aislamiento entre worktrees.
- La normalización ASTRA-006 registró 1.110 fuentes, 1.080 hashes únicos, 142 pendientes OCR y 1.080 pendientes de revisión. Son cifras históricas del corpus, no un recuento nuevo.

Estas evidencias conservan su fecha y alcance. No constituyen una nueva ejecución sobre otro SHA.

## Correcciones documentales — 2026-09-15

- Rechazo humano tiene prioridad; número de pieza conocido se conserva ante valores ausentes o A_CONFIRMAR.
- Todos los candidatos con código repetido (normalizado) quedan bloqueados, sin depender del orden del lote.
- Cobertura sin evidencia por página queda null con COBERTURA_DESCONOCIDA; la cola OCR indica que falta determinar las páginas. Evidencia inválida no produce porcentaje.
- Ejecutado: npx vitest run apps/api/test/candidate-import.test.ts apps/api/test/document-intelligence.test.ts --maxWorkers=1: 20/20 pruebas aprobadas.
- Ejecutado: npm run typecheck: API y web aprobados. git diff --check aprobado.
- Sin escrituras de stock, base de datos ni corpus. No se ejecutaron suite PostgreSQL, build ni redespliegue; verification.json conserva su SHA histórico.

## Consolidación documental anterior

Se unifican HANDOFF.md, VERIFICATION.md y NEXT-TASK.md sin modificar código funcional, dependencias ni datos. La comprobación pertinente es revisar el diff, verificar ausencia de errores de whitespace y confirmar main local/remoto en el mismo SHA tras el push. El resultado final de identidad se informa al cerrar la tarea.

No se requiere repetir la suite, el circuito de roles, PDF ni despliegue por esta actualización documental. Las futuras verificaciones deben centrarse en el comportamiento modificado.

## Pendientes de verificación

- Las pruebas dirigidas de los cuatro defectos ya fueron completadas según la sección anterior.
- CI remoto del nuevo commit, si el repositorio lo ejecuta, es evidencia separada de las comprobaciones locales.
- Backup programado y acceso LAN/TLS solo si se decide habilitar operación persistente o LAN.

## Revisión persistente — 2026-09-15

Prisma generate, migración de upgrade en astra_test, 42 pruebas PostgreSQL/documentales, typecheck API/web y build API/web aprobados. Caso nuevo: roles, creación/revisión idempotente, persistencia tras GET, rechazo stale, comparación real, stock intacto y trigger de historial.

Verify.ps1 se detuvo al reasignar puertos (No free port available); se reutilizó el contexto astra_test ya operativo en 50379 mediante Common.ps1 y se ejecutaron db:migrate, test y build directamente. No se falsificó verification.json ni se ejecutó contra staging. Estos pendientes quedaron completados según el cierre siguiente.

Browser dirigido aprobado en Edge sobre http://localhost:4392/documents y base astra_test: login ADMIN, candidato existente, decisión A_CONFIRMAR con motivo, recarga completa, historial conservado y comparación UNCHANGED/stock NONE. Preview nativo de esta implementación, no staging ni certificación de los tres roles.

Migración desde base vacía aprobada: test_document_review_fresh_20260915, cuatro migraciones aplicadas. Base aislada conservada. El conflicto de puertos del wrapper se corrigió seleccionando puertos libres en el contexto local de test, sin modificar scripts ni staging.

## Cierre del incremento persistente

Verify.ps1 -SkipInstall pasó sobre el commit limpio 52b1220fd2d304d097d05673780461db2b014784: migración, 42 pruebas, typecheck y build. Deploy-Staging.ps1 finalizó con backup previo, migración aditiva y despliegue de ese SHA. Release registrada 2026-09-15T12:57:28Z. Health ready y /api/v1/version comprobados en vivo. El bloqueo EPERM inicial de Prisma se resolvió cerrando el proceso nativo de prueba que mantenía la DLL abierta; no se modificó la dependencia.

La prueba dirigida de navegador se hizo sobre el mismo código funcional en el entorno aislado antes del despliegue. No se repitió el circuito completo de roles. El commit posterior sólo cierra documentación; verification.json conserva el SHA efectivamente ejecutado.

Fuera de este repositorio se actualizaron cabeceras de planes/checkpoints de outputs y la cláusula P06 de PRODUCT/API y el plan abierto en el checkout in. Se preservaron sus demás cambios locales; no se incluyó ese árbol en el push del main principal.

## Paginación documental — 2026-09-15
43 pruebas aprobadas sobre astra_test, typecheck API/web y build aprobados. Cobertura nueva: páginas con timestamp igual, alta posterior sin duplicación de continuación, límites/cursor inválidos y compatibilidad del endpoint anterior. Sin migraciones. La prueba browser de paginación no se ejecutó en este incremento.

## Historial documental — 2026-09-15

Verify.ps1 -SkipInstall aprobado sobre el árbol de trabajo de feat/document-review-history (base 54beabe, dirty=true): 44/44 pruebas, typecheck API/web y build API/web. PostgreSQL aislado astra_test; cuatro migraciones existentes, ninguna pendiente. La prueba añadida cubre paginación por versión, nombres e identidad, autenticación, entradas inválidas, compatibilidad y dos revisores concurrentes (200/409, una sola decisión persistida). git diff --check aprobado.

No se ejecutó navegador ni despliegue de este incremento. verification.json identifica el árbol sucio y no habilita despliegue: se requiere Verify sobre el commit limpio antes de desplegar. No se atribuye esta ejecución a un SHA limpio ni se altera el registro. Próximos checks: navegación dirigida de páginas/historial y despliegue sintético cuando corresponda.

## Cola de revisión por fuente — 2026-09-15

Commit funcional 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f. Verify.ps1 -SkipInstall aprobado sobre commit limpio: Prisma generate, migración astra_test sin pendientes, typecheck API/web, 45 pruebas y build API/web. Deploy-Staging.ps1 -SkipVerify finalizó con backup previo .runtime/backups/staging/20260916-014526-173.dump, migración staging sin pendientes, health ready y /api/v1/version en 2b6cd68943018c45ec73ac71ad5abe3807ca3e6f.

Revisión visual dirigida en Edge sobre http://localhost:4380/documents: login ADMIN existente, footer v0.1.0 · 2b6cd689, 695 DocumentRevision, 0 DocumentCandidate y 695 auditorías DOCUMENT_SOURCE_IMPORTED. La cola muestra fuentes reales, filtros por extractionStatus/familia/prioridad y detalle con SHA, páginas/OCR y "Sin derivar". Filtro probado: OCR_REQUIRED + John Deere + ALTA, con resultados John Deere y detalle de páginas OCR. Captura local: .runtime/visual-review/documents-source-queue-desktop.png. No se crearon candidatos ni movimientos de stock.

## Analizador documental dry-run — 2026-09-15

Implementación inicial sin proveedor externo: `document-analysis.ts` genera hallazgos revisables `A_CONFIRMAR` con `stockEffect:NONE`; `documents:analyze-sample` escribe resultados locales en `.runtime/document-analysis`. Ejecutado sobre `.runtime/sources/index.json` con 12 fuentes piloto: 85 hallazgos, 84 `PART_CANDIDATE` y 1 `OCR_REQUIRED`; familias cubiertas: John Deere, Case IH/Puma, Husqvarna/MZ, STIHL, Siembra/PLA/MXY, Toyota Hilux, Rodamientos/retenes y A clasificar. Salidas: `.runtime/document-analysis/analyses.json`, `findings.json`, `summary.json`.

Verificación ejecutada: `npx vitest run apps/api/test/document-analysis.test.ts apps/api/test/document-intelligence.test.ts --maxWorkers=1` aprobó 12/12; `npm run typecheck --workspaces` aprobó; suite completa con PostgreSQL aislado `astra_test` aprobó 48/48 tras migraciones sin pendientes. No hubo escrituras en staging, stock ni candidatos.

## 2026-09-16 — hallazgos asistidos persistentes

Comando: scripts/Verify.ps1 -SkipInstall.
Resultado: PASS. Migración 20260916021000_document_analysis_findings aplicada en astra_test. Prisma generate OK, typecheck API/web OK, tests API 49/49 OK, build API/web OK. Aviso operativo: puerto db test reasignado 50387->50388 por ocupación local.

Cobertura agregada: cola GET /document-candidates/findings/page autenticada y paginada, cursor inválido, VIEWER bloqueado en POST, motivo obligatorio, dos revisiones append-only, filtro por estado humano, inmutabilidad de DocumentFindingReview, y conteos de DocumentCandidate/StockMovement en cero.

## 2026-09-16 — procedencia y derivación asistida

Ejecutado `scripts/Verify.ps1 -SkipInstall`. Resultado: PASS. Prisma generate y migrations OK; typecheck API/web OK; tests API 50/50 OK; build API/web OK. Puerto aislado de prueba reasignado 50391->50392 por ocupación local.

Cobertura agregada: filtros JSON por categoría, relevancia y procedencia; clasificación conservadora del analizador; derivación restringida a ADMIN y PART_CANDIDATE; rechazo de OCR_REQUIRED; copia de fuente/hash/locator/aplicabilidad; idempotencia; una sola revisión CREATE_CANDIDATE y cero movimientos de stock.

## 2026-09-16 — segmentación por ítem de catálogo

Ejecutado `scripts/Verify.ps1 -SkipInstall`. Resultado: PASS. Prisma generate y migrations OK; typecheck API/web OK; tests API 52/52 OK; build API/web OK. Puerto aislado de prueba reasignado 50393->50394.

Muestreo real adicional sobre 12 fuentes y 85 hallazgos: las filas verticales del manual Richiger EA350 se reconstruyen por ítem. EX-18070C queda como protector/estructura-transmisión y MP0124 como rodamiento, ambos con procedencia TABLA_REPUESTOS; el contexto vecino se conserva separado para inspección humana.

## 2026-09-16 — referencias de equipo/manual

Comandos: npm run typecheck --workspaces; npx vitest run apps/api/test/document-analysis.test.ts --maxWorkers=1.
Resultado: PASS. Cobertura agregada: EA-350 se clasifica como EQUIPMENT_REFERENCE con advertencia REFERENCIA_EQUIPO_MANUAL; EX-18070C permanece PART_CANDIDATE en contexto de tabla de repuestos.
