# Operaciones del piloto

Índice operativo. Los scripts trabajan con contextos aislados bajo `.runtime`; este documento no constituye autorización para producción ni para datos reales.

## Runbooks

- [Desarrollo local](04-operations/local-development.md)
- [Verificación](04-operations/verification.md)
- [Staging sintético](04-operations/staging.md)
- [Backup y prueba de restauración](04-operations/backup-restore.md)
- [Rollback de staging](04-operations/rollback.md)

## Inicio de sesión de trabajo

1. Confirmar directorio, rama, `git status` y `git rev-parse HEAD`.
2. Leer `docs/README.md` y `CURRENT-STATUS.md`.
3. Elegir el runbook del objetivo; no mezclar contextos dev/test/staging.
4. Confirmar Docker mediante respuesta del servidor, no sólo por la ventana de Desktop.
5. Mantener secretos, dumps, evidencia local y originales en `.runtime` o almacenamiento autorizado.

## Identidad y seguridad

- Checkout HEAD, SHA verificado y SHA desplegado se informan por separado.
- Usar sólo migraciones versionadas; nunca `db push` sobre datos operativos.
- Test sólo opera bases `astra_test` o `test_*`.
- No ejecutar Docker prune global ni borrar volúmenes como parte de recuperación rutinaria.
- Merge a `main` y producción requieren aprobación humana.

## Secretos
`Get-AstraContext` genera secretos distintos por entorno. El seed exige contraseñas de 12 o más caracteres y preserva usuarios/datos existentes. Las identidades sintéticas están documentadas en el contrato API; las contraseñas se leen del contexto correspondiente y nunca se hardcodean.

## Límites
ASTRA-006 y ASTRA-007 son antecedentes históricos, no próximos pasos. La protección de `main` puede depender del plan de GitHub; la aprobación humana sigue siendo un límite del workflow aunque la plataforma no la fuerce.
