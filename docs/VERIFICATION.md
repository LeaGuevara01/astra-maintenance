# Evidencia local del checkpoint

## ASTRA-005 — verificación vigente, target `b21b347b80a5eeac3df13ebaf69a394f05621f41`

## ASTRA-006 — verificación local de inteligencia documental

- Target verificado: `bce8d6ae2a14429e45e671cd3e24788330a89cc8` en `feat/ASTRA-006-document-intelligence`. `main` no fue mergeada ni desplegada.
- Pasaron `npm.cmd run typecheck` (API y web), `npx vitest run apps/api/test/document-intelligence.test.ts --pool=threads --maxWorkers=1 --reporter=verbose` (3/3), `npm.cmd run build`, `npm.cmd audit --audit-level=high` (0 vulnerabilidades) y `npm.cmd run documents:normalize -- --input .runtime/sources/index.json --output .runtime/sources/normalized`.
- La normalización local produjo 1.110 fuentes, 1.080 hashes únicos, 142 pendientes OCR y 1.080 pendientes de revisión. Conserva evidencia/advertencias y `A_CONFIRMAR`; no modifica originales, ejecuta OCR ni afirma equivalencia técnica.
- `Verify.ps1` se intentó contra la base aislada `astra_test`, pero Docker Compose rechazó el montaje de Caddy con `invalid spec: :/etc/caddy/Caddyfile:ro: empty section between colons` antes de migraciones y suite PostgreSQL. Por ello esos checks no están aprobados para este SHA.
- Staging responde `ready`, pero `/api/v1/version` sigue en `b21b347b80a5eeac3df13ebaf69a394f05621f41`; es evidencia histórica de ASTRA-005, no despliegue de este target.

Fecha de ejecución: 2026-09-11 UTC. Rama local: `main`, limpia y alineada con `origin/main`.

- Verify histórico vigente: `npm ci`/`-SkipInstall`, Prisma generate/migrate sobre `astra_test`, typecheck API/web, 21/21 tests de aceptación y build API/web. El código funcional entre `48f362a` y `b21b347` no cambió; el merge actualizó documentación y dejó `main` limpio.
- Staging sintético: `http://localhost:4380`; `/health/ready` respondió `ready` y `/api/v1/version` publica el SHA exacto `b21b347b80a5eeac3df13ebaf69a394f05621f41`.
- E2E API sanitizado vigente: run `QA005-20260911025727`, OT `OT-000005`, ID `cmtwd8ise0006po0k5vj2yni8`. ADMIN/TECHNICIAN/VIEWER autenticaron; ADMIN creó activo y generó 600/645; TECHNICIAN repuso, reservó y consumió 1, completó 2 tareas y cerró `OPERATIVE`; VIEWER leyó la OT cerrada y no pudo escribir (`403 FORBIDDEN`).
- E2E de interfaz vigente: URL `http://localhost:4380`, SHA `b21b347`, OT `OT-000006` / `cmtwe2cvl0001o70j3y37jkut`. ADMIN generó la OT; TECHNICIAN completó 2 tareas, ingresó 1 unidad, reservó y consumió 1 unidad, verificó el checkpoint crítico y cerró `OPERATIVE`; VIEWER abrió la OT cerrada y no mostró controles de escritura.
- PDF visual vigente: A6 y A4 de `OT-000006` se descargaron desde la interfaz. La inspección mostró A6 sin recortes ni solapamientos, QR legible, y A4 con cuatro tarjetas alineadas y legibles.
- Negativos: cierre prematuro `TASKS_PENDING`; crítico pendiente `CRITICAL_CHECKPOINT`; crítico `NA` `CRITICAL_NA`; `NOT_OPERATIVE` con crítico `FAIL` `CRITICAL_CHECKPOINT`; nueva clave postcierre `ORDER_CLOSED`; replay de cierre `200` sin duplicar efecto.
- Documentos cerrados: A6/A4 HTTP 200. A6 una página 105×148 mm; A4 una página 210×297 mm con cuatro tarjetas. Texto, QR, snapshots, `A_CONFIRMAR` y límites visuales verificados con PyMuPDF. Hashes vigentes en `.runtime/qa-20260911/pdf-checks-ot000005.json`.
- Persistencia validada: `CLOSED/OPERATIVE`, tareas `DONE`, checkpoints `PASS`, material usado 1, reservado 0, faltante 0 y auditoría `ORDER_CLOSED`.
- UI: login y recorrido autenticado completo aprobados en Edge con las tres identidades sintéticas; no se transmitieron datos fuera de staging local.

### Corrida anterior conservada

La corrida `QA005-20260911022232` / `OT-000004` sobre `a3c2349` permanece como evidencia histórica; no representa el runtime vigente.

Fecha: 2026-09-07 UTC.
- Backend worktree: tres migraciones aplicadas; 21 tests PostgreSQL pasaron.
- Repositorio integrado: scripts/Verify.ps1 -SkipInstall pasó migraciones en base nueva, typecheck de API/web, 21 tests y build sobre el commit limpio `2ef666a`.
- Build adicional con NODE_ENV=production pasó y generó frontend de aproximadamente 251 kB JS sin comprimir.
- npm audit --audit-level=high: 0 vulnerabilidades.
- Cinco skills genéricas: quick_validate.py aprobado para cada una. Validate-Foundation.ps1 aprobado.
- Scripts PowerShell: comprobación sintáctica aprobada.
- Scripts operativos Common/Prepare/Start-Dev/Verify: revalidación de puertos mutables y locks de entorno agregados; Verify volvió a pasar después del cambio.
- New-Worktree.ps1: validado con un worktree temporal; el nuevo checkout recibió contextos dev/test aislados y el entorno temporal se limpió al finalizar.
- Deploy-Staging.ps1: ejecutado con seed; `http://localhost:4380/health/ready` respondió `ready` y `/api/v1/version` publicó `2ef666ae0721208501d5664a0ce5e8d7f37d7da0` en `staging`.
- Backup.ps1 y Restore-Check.ps1: backup binario generado con SHA-256 `9D09D08159F28E83950D20BB169136047DF02278BCCAF303320CFE5E2D4A4074`; restauración aprobada en proyecto `astra-restore-8f852ff408cb` con volumen `astra-restore-8f852ff408cb_database`; un dump alterado falló con `Backup checksum mismatch` antes de restaurar.
- Rollback-Staging.ps1: revirtió staging desde `2ef666a` a `32ba952`, preservó el asset sonda `ASTRA-RB-031857` y luego staging se redeployó al commit actual `2ef666a`.
- Dos worktrees completos en paralelo: dos checkouts temporales prepararon `dev`, levantaron DB+API+Vite al mismo tiempo, expusieron `http://localhost:46268` y `http://localhost:46648`, y rechazaron credenciales cruzadas entre ambos entornos.
- Frontend standalone: agente verificó login en escritorio y 390 px sin errores JS ni desbordamiento.
- El E2E integrado y la revisión visual final descritos arriba sustituyen este estado histórico; las comprobaciones automatizadas anteriores se conservan como evidencia de regresión.

Se corrigió concurrently a 9.2.4 por advertencias shell-quote y se fijó deepmerge-ts 8.0.0 para el árbol Prisma. Mantener package-lock.json.
La evidencia operativa principal de ASTRA-004 ya existe localmente en `.runtime/test`, `.runtime/staging`, `.runtime/backups/staging` y `.runtime/restore`.
