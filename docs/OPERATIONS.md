# Operaciones del piloto — estado del checkpoint

Los scripts de despliegue están escritos. Antes de operar datos reales debe completarse su verificación: este checkpoint no constituye una release de producción.

| Script | Función | Verificación actual |
|---|---|---|
| Prepare.ps1 | npm ci, credenciales locales, PostgreSQL por entorno, migración y seed | Ejecutado en dos worktrees temporales; reasignó puertos ocupados y persistió contextos aislados |
| Start-Dev.ps1 | API y frontend nativos con puertos propios | Ejecutado en dos worktrees temporales en paralelo; ambos expusieron web y API sobre puertos distintos |
| Verify.ps1 | base de test aislada, migraciones, typecheck, tests, build | Ejecutado; pasó sobre el commit limpio `2ef666a` |
| Deploy-Staging.ps1 | lock, commit limpio, build, migración, seed opcional, health/version | Ejecutado; staging sintético activo en `http://localhost:4380` con commit `2ef666a` |
| Backup.ps1 | pg_dump binario, SHA256, retención | Ejecutado; dump SHA-256 verificado y retención local conservada |
| Restore-Check.ps1 | restauración de ensayo | Ejecutado con backup real; restauró en proyecto Compose y volumen independientes y rechazó un dump corrupto por checksum |
| Rollback-Staging.ps1 | imagen anterior con digest y datos preservados | Ejecutado entre `32ba952` y `2ef666a`; preservó el asset sonda `ASTRA-RB-031857` |
| New-Worktree.ps1 | rama y directorio independientes | Crea además contextos dev/test aislados con puertos persistidos; validado con dos worktrees completos en paralelo |
| Enable-LanStaging.ps1 | HTTPS con CA interna y cookie Secure | Escrito; no ejecutado |
| Register-Backup.ps1 | tarea diaria a las 02:00 | No registrada todavía |

## Inicio de la próxima sesión
Usar el directorio del repositorio piloto, comprobar git status y leer HANDOFF.md. Si no hay nuevos cambios, el siguiente foco natural es ASTRA-005: E2E real de tres roles y revisión visual de PDF A6/A4.

New-Worktree.ps1 ahora deja preparados los contextos locales dev/test del nuevo worktree. Prepare.ps1, Verify.ps1 y Start-Dev.ps1 revalidan puertos mutables antes de escribir .runtime para evitar colisiones al reutilizar un entorno ya preparado.
El ensayo paralelo de worktrees dejó dos señales útiles: el puerto `db` de `dev` puede reasignarse si el preferido ya fue ocupado por otro entorno del mismo checkout, y esa reasignación queda persistida en `.runtime/dev/config.json` para el siguiente arranque.

## Secretos
Get-AstraContext genera secretos distintos por entorno y los guarda en .runtime/<entorno>/config.json y .env. El seed exige contraseñas de 12 o más caracteres y preserva usuarios/datos existentes.
ADMIN: admin@astra.local; TECHNICIAN: tecnico@astra.local; VIEWER: consulta@astra.local. La contraseña debe leerse de la configuración del entorno correspondiente, nunca hardcodearse.

## Límites
El contenedor de test puede detenerse después de probar; no borrar volúmenes sin intención explícita de descartar datos.
No ejecutar Docker prune global ni tocar SPARE.
GitHub no pudo activar protecciones de main en repositorios privados con el plan actual. La aprobación humana sigue siendo un límite del workflow.
