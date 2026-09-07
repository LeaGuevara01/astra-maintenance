# Operaciones del piloto — estado del checkpoint

Los scripts de despliegue están escritos. Antes de operar datos reales debe completarse su verificación: este checkpoint no constituye una release de producción.

| Script | Función | Verificación actual |
|---|---|---|
| Prepare.ps1 | npm ci, credenciales locales, PostgreSQL por entorno, migración y seed | Pendiente de ciclo dev completo |
| Start-Dev.ps1 | API y frontend nativos con puertos propios | Pendiente |
| Verify.ps1 | base de test aislada, migraciones, typecheck, tests, build | Ejecutado; pasó |
| Deploy-Staging.ps1 | lock, commit limpio, build, migración, seed opcional, health/version | Escrito; no ejecutado |
| Backup.ps1 | pg_dump binario, SHA256, retención | Escrito; no ejecutado |
| Restore-Check.ps1 | restauración de ensayo | Cambiar a volumen separado antes de validar |
| Rollback-Staging.ps1 | imagen anterior con digest y datos preservados | Escrito; requiere dos releases de staging para ensayo |
| New-Worktree.ps1 | rama y directorio independientes | Sintaxis validada; falta ensayo completo de entorno |
| Enable-LanStaging.ps1 | HTTPS con CA interna y cookie Secure | Escrito; no ejecutado |
| Register-Backup.ps1 | tarea diaria a las 02:00 | No registrada todavía |

## Inicio de la próxima sesión
Usar el directorio del repositorio piloto, comprobar git status y leer HANDOFF.md. Ejecutar Verify.ps1 para generar evidencia asociada al commit limpio antes del despliegue.

## Secretos
Get-AstraContext genera secretos distintos por entorno y los guarda en .runtime/<entorno>/config.json y .env. El seed exige contraseñas de 12 o más caracteres y preserva usuarios/datos existentes.
ADMIN: admin@astra.local; TECHNICIAN: tecnico@astra.local; VIEWER: consulta@astra.local. La contraseña debe leerse de la configuración del entorno correspondiente, nunca hardcodearse.

## Límites
El contenedor de test puede detenerse después de probar; no borrar volúmenes sin intención explícita de descartar datos.
No ejecutar Docker prune global ni tocar SPARE.
GitHub no pudo activar protecciones de main en repositorios privados con el plan actual. La aprobación humana sigue siendo un límite del workflow.
