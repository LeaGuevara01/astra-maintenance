# Evidencia local del checkpoint

## ASTRA-005 — verificación vigente, target `48f362ab86a2b1f9c404c1d337318d119b89c8fe`

Fecha de ejecución: 2026-09-11 UTC. Rama local: `fix/ASTRA-005-e2e-target`, basada en `origin/main@91c1c2a`. No se hizo merge ni push remoto.

- Verify limpio: `npm ci`/`-SkipInstall`, Prisma generate/migrate sobre `astra_test`, typecheck API/web, 21/21 tests de aceptación y build API/web. Registro vigente: `.runtime/test/verification.json`, `dirty=false`, SHA `48f362ab86a2b1f9c404c1d337318d119b89c8fe`.
- Staging sintético: `http://localhost:4380`; `Deploy-Staging.ps1` completó backup, imágenes API/web y readiness. `/api/v1/version` publica el SHA exacto `48f362a`.
- E2E API sanitizado vigente: run `QA005-20260911025727`, OT `OT-000005`, ID `cmtwd8ise0006po0k5vj2yni8`. ADMIN/TECHNICIAN/VIEWER autenticaron; ADMIN creó activo y generó 600/645; TECHNICIAN repuso, reservó y consumió 1, completó 2 tareas y cerró `OPERATIVE`; VIEWER leyó la OT cerrada y no pudo escribir (`403 FORBIDDEN`).
- Negativos: cierre prematuro `TASKS_PENDING`; crítico pendiente `CRITICAL_CHECKPOINT`; crítico `NA` `CRITICAL_NA`; `NOT_OPERATIVE` con crítico `FAIL` `CRITICAL_CHECKPOINT`; nueva clave postcierre `ORDER_CLOSED`; replay de cierre `200` sin duplicar efecto.
- Documentos cerrados: A6/A4 HTTP 200. A6 una página 105×148 mm; A4 una página 210×297 mm con cuatro tarjetas. Texto, QR, snapshots, `A_CONFIRMAR` y límites visuales verificados con PyMuPDF. Hashes vigentes en `.runtime/qa-20260911/pdf-checks-ot000005.json`.
- Persistencia validada: `CLOSED/OPERATIVE`, tareas `DONE`, checkpoints `PASS`, material usado 1, reservado 0, faltante 0 y auditoría `ORDER_CLOSED`.
- UI: login y pantalla de acceso cargaron en Edge; recorrido UI autenticado completo permanece `NOT_RUN` para no imprimir ni transmitir las contraseñas sintéticas.

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
- E2E integrado de navegador y revisión visual final de PDF: no ejecutados todavía.

Se corrigió concurrently a 9.2.4 por advertencias shell-quote y se fijó deepmerge-ts 8.0.0 para el árbol Prisma. Mantener package-lock.json.
La evidencia operativa principal de ASTRA-004 ya existe localmente en `.runtime/test`, `.runtime/staging`, `.runtime/backups/staging` y `.runtime/restore`.
