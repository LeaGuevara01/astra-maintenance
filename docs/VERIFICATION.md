# Evidencia local del checkpoint

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
