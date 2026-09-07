# Operaciones del piloto — estado del checkpoint

Los scripts de despliegue están escritos. Antes de operar datos reales debe completarse su verificación: este checkpoint no constituye una release de producción.

| Script | Función | Verificación actual |
|---|---|---|
| Prepare.ps1 | npm ci, credenciales locales, PostgreSQL por entorno, migración y seed | Reasigna puertos dev/test ocupados, persiste la elección y serializa por lock; falta ciclo dev completo |
| Start-Dev.ps1 | API y frontend nativos con puertos propios | Revalida puertos dev antes de arrancar y usa lock del entorno; falta ensayo de circuito completo |
| Verify.ps1 | base de test aislada, migraciones, typecheck, tests, build | Ejecutado; pasó |
| Deploy-Staging.ps1 | lock, commit limpio, build, migración, seed opcional, health/version | Escrito; no ejecutado |
| Backup.ps1 | pg_dump binario, SHA256, retención | Escrito; no ejecutado |
| Restore-Check.ps1 | restauración de ensayo | Ya usa proyecto Compose y volumen independientes; falta ensayo con backup real |
| Rollback-Staging.ps1 | imagen anterior con digest y datos preservados | Escrito; requiere dos releases de staging para ensayo |
| New-Worktree.ps1 | rama y directorio independientes | Crea además contextos dev/test aislados con puertos persistidos; validado con worktree temporal |
| Enable-LanStaging.ps1 | HTTPS con CA interna y cookie Secure | Escrito; no ejecutado |
| Register-Backup.ps1 | tarea diaria a las 02:00 | No registrada todavía |

## Inicio de la próxima sesión
Usar el directorio del repositorio piloto, comprobar git status y leer HANDOFF.md. Ejecutar Verify.ps1 para generar evidencia asociada al commit limpio antes del despliegue.

New-Worktree.ps1 ahora deja preparados los contextos locales dev/test del nuevo worktree. Prepare.ps1, Verify.ps1 y Start-Dev.ps1 revalidan puertos mutables antes de escribir .runtime para evitar colisiones al reutilizar un entorno ya preparado.

## Secretos
Get-AstraContext genera secretos distintos por entorno y los guarda en .runtime/<entorno>/config.json y .env. El seed exige contraseñas de 12 o más caracteres y preserva usuarios/datos existentes.
ADMIN: admin@astra.local; TECHNICIAN: tecnico@astra.local; VIEWER: consulta@astra.local. La contraseña debe leerse de la configuración del entorno correspondiente, nunca hardcodearse.

## Límites
El contenedor de test puede detenerse después de probar; no borrar volúmenes sin intención explícita de descartar datos.
No ejecutar Docker prune global ni tocar SPARE.
GitHub no pudo activar protecciones de main en repositorios privados con el plan actual. La aprobación humana sigue siendo un límite del workflow.
