# Runbook de desarrollo local

## Propósito

Preparar y ejecutar ASTRA en un contexto `dev` aislado por checkout. No usar estas instrucciones contra staging o producción.

## Precondiciones

- Windows PowerShell, Git, Node compatible con `.node-version` y Docker Desktop con engine Linux disponible.
- Checkout correcto confirmado mediante `git status` y `git rev-parse HEAD`.
- No definir manualmente secretos compartidos; los contextos viven bajo `.runtime/dev`.

## Preparar

```powershell
./scripts/Prepare.ps1 -Environment dev
```

El script:

1. crea o carga el contexto dev;
2. toma un lock por entorno;
3. reasigna puertos ocupados y persiste el resultado;
4. exige Docker operativo;
5. ejecuta `npm ci` y Prisma generate;
6. inicia PostgreSQL aislado;
7. aplica migraciones versionadas;
8. ejecuta seed sintético.

La salida indica el archivo local de credenciales. No copiarlo a documentación, Git ni otro entorno.

## Iniciar

```powershell
./scripts/Start-Dev.ps1
```

Arranca PostgreSQL mediante Compose y API/web nativos mediante `npm run dev`. El frontend usa el origen y puertos guardados en `.runtime/dev/config.json`.

## Trabajo en otro worktree

```powershell
./scripts/New-Worktree.ps1 -Branch feat/ASTRA-xxx-descripcion -Destination C:\ruta\nueva
```

El destino debe ser nuevo. La rama debe comenzar con `feat/`, `fix/` o `chore/`. El script crea contextos dev/test propios en el nuevo worktree; después se ejecuta `Prepare.ps1` allí.

## Comprobaciones

- `GET /health/live`: proceso activo.
- `GET /health/ready`: PostgreSQL y esquema disponibles.
- `GET /api/v1/version`: entorno e identidad del artefacto.
- Footer: sólo para aceptación visual cuando corresponda.

## Problemas frecuentes

- Puerto reasignado: usar el nuevo valor persistido, no forzar el anterior.
- Docker visible pero CLI sin servidor: no continuar hasta que `docker info` muestre sección Server.
- Lock ocupado: no iniciar una segunda operación sobre el mismo contexto.
- `A_CONFIRMAR`: no reemplazar con valores técnicos inferidos durante desarrollo.
