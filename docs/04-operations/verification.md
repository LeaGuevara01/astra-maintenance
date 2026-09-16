# Runbook de verificación

## Propósito

Ejecutar migraciones, typecheck, tests y builds sobre PostgreSQL sintético aislado.

## Comando estándar

```powershell
./scripts/Verify.ps1
```

Si `npm ci` ya fue ejecutado y las dependencias no cambiaron:

```powershell
./scripts/Verify.ps1 -SkipInstall
```

## Secuencia real

1. Guarda variables de proceso relevantes.
2. Crea/carga `.runtime/test` y toma su lock.
3. Reasigna puertos ocupados.
4. Configura `TEST_DATABASE_URL` sobre una base `astra_test` aislada.
5. Ejecuta instalación opcional, Prisma generate y PostgreSQL test.
6. Aplica todas las migraciones versionadas.
7. Ejecuta typecheck, suite API y builds API/web.
8. Escribe `.runtime/test/verification.json` con hora, `HEAD`, dirty flag, checks y entorno.
9. Restaura variables de proceso.

## Interpretación

- El wrapper sólo es PASS si termina completo con código cero.
- Un fallo antes de tests no prueba comportamiento.
- `dirty=true` identifica un árbol probado, pero no un SHA limpio desplegable.
- `verification.json` no debe editarse para simular otro commit.
- Un puerto reasignado no es fallo si el contexto se actualiza correctamente.

## Checks proporcionales

Para una prueba dirigida antes del wrapper completo:

```powershell
npx vitest run apps/api/test/<archivo>.test.ts --maxWorkers=1
npm run typecheck
npm run build
```

El despliegue exige igualmente un registro integrado asociado al commit limpio, salvo que el procedimiento autorizado establezca otra evidencia explícita.

## Bloqueos

- Docker pipe ausente: iniciar/recuperar Docker y repetir desde cero.
- Base no aislada: detenerse; los tests deben rechazar nombres distintos de `astra_test` o `test_*`.
- `spawn EPERM` o DLL bloqueada: identificar el proceso local conflictivo; no atribuirlo automáticamente al producto.
- Migración fallida: conservar salida exacta y no usar `db push` como atajo.
