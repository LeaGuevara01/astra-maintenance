# ASTRA-004 — Operaciones reproducibles y recuperación aislada

Estado: implementación avanzada; ejecución operativa pendiente. Responsable: integrador; revisión independiente acotada permitida.

## Objetivo
Cerrar la brecha entre un piloto que pasa sus pruebas y un staging recuperable, identificado por commit e imágenes.

## Alcance
scripts/Common.ps1, Verify.ps1, Deploy-Staging.ps1, Backup.ps1, Restore-Check.ps1, Rollback-Staging.ps1; compose.yaml y Dockerfile cuando la prueba lo requiera. Mantener API y esquema salvo defecto demostrado. Sin merge de main ni producción.

## Fuentes y restricciones
Leer AGENTS, OPERATIONS, HANDOFF y VERIFICATION. Usar exclusivamente datos sintéticos. Conservar originales, secretos y volúmenes actuales. No debilitar las guardas de base de test ni saltar verificaciones de commit.

## Defectos y riesgos concretos para resolver
1. Confirmar con ensayo que Restore-Check en proyecto Compose y volumen independientes recupera datos sintéticos concretos. No apuntar comandos de restauración al proyecto activo.
2. Deploy-Staging solo intenta rollback en el bloque de verificación HTTP; revisar fallos anteriores de migración, compose up y escritura de configuración. Preservar referencia recuperable y reportar con claridad cuando una migración exige intervención.
3. Verificar que despliegue, backup y recuperación no se pisan. Evitar locks anidados que bloqueen la copia llamada desde un despliegue.
4. Verificar npm ci en imagen limpia, build de producción, health, identificación de commit e imagen y scripts en Windows PowerShell.
5. Verificar en dos worktrees completos que la preasignación y revalidación de puertos persisten una elección libre y no colisionan entre entornos.
6. La instalación reproducible ya tiene lockfile: preservar esa fijación al resolver compatibilidad.

## Aceptación
- Verify aprueba sobre el SHA limpio que se desplegará.
- Staging sirve interfaz y API; /health/ready responde y /api/v1/version coincide con SHA.
- Backup binario tiene hash verificado y retención comprobada.
- Restauración ocurre en volumen nuevo y recupera registros sintéticos concretos, no solamente un conteo de tablas. La base original no cambia.
- Un backup corrupto falla antes de restaurar.
- Dos despliegues simultáneos del mismo entorno no se ejecutan juntos.
- Dos worktrees no comparten PostgreSQL, credenciales ni puertos.
- Rollback vuelve a la imagen registrada y conserva una intervención generada entre ambas versiones.
- Fallo de despliegue conserva evidencia y un procedimiento de recuperación utilizable.
- No hay secretos ni originales en el diff, logs o PR.

## Evidencia de salida
Commit limpio, comandos y resultados, proyectos/volúmenes distintos sin contraseñas, hashes de backup e imágenes, prueba de datos conservados y URL de staging. Actualizar HANDOFF y OPERATIONS con lo ejecutado y lo pendiente.

## Tareas siguientes
ASTRA-005: E2E de tres roles y circuito completo, revisión visual A6/A4.
ASTRA-006: normalizar inventario local y estado de extracción parcial, OCR y cola de revisión técnica.
ASTRA-007: contratos de procedencia e importación dry-run de candidatos; no cargar cantidades históricas como stock.
ASTRA-008: validar cinco skills en una sesión nueva y extraer plugin astra-engineering después de demostrar el piloto.
