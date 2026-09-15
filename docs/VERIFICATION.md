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
