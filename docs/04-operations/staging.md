# Runbook de staging sintético

## Propósito

Construir y activar imágenes locales identificadas por SHA, con verificación y recuperación de la release anterior. No es producción.

## Gates previos

- Árbol Git limpio.
- `HEAD` es el commit que se pretende desplegar.
- Docker Linux responde.
- Verificación integrada del mismo SHA con `dirty=false`.
- Secretos y configuración en `.runtime/staging`, nunca en Git.
- Aprobación humana sólo es obligatoria para merge a `main` o producción; staging sintético puede ejecutarse dentro del flujo autorizado.

## Desplegar

```powershell
./scripts/Deploy-Staging.ps1
```

`-SkipVerify` sólo reutiliza una verificación existente que debe coincidir exactamente con el commit limpio. `-Seed` ejecuta seed sintético y debe usarse deliberadamente; el seed preserva datos existentes, pero no reemplaza una decisión sobre el dataset.

## Secuencia

1. Obtiene commit limpio y, salvo `-SkipVerify`, ejecuta Verify.
2. Rechaza `verification.json` de otro SHA o dirty.
3. Comprueba imágenes fijadas y release anterior.
4. Construye API y web etiquetadas con el SHA.
5. Si existe release anterior, crea backup antes de activar.
6. Persiste digests y commit candidatos.
7. Inicia base, aplica migraciones y seed opcional.
8. Activa API/web y exige health/version mediante `Set-AstraRelease`.
9. Guarda `release.json` y rota `previous-release.json`.

## Verificar identidad

```text
/health/ready       → ready
/api/v1/version     → commit esperado, environment=staging
footer              → mismo SHA, sólo cuando se requiere aceptación visual
```

API y health bastan para evidencia técnica del runtime; no sustituyen revisión visual.

## Fallo y recuperación

`deployment-failure.json` registra fase, commit y resultado de recuperación. Si ya se activó el candidato:

- con release anterior: intenta restaurar imágenes anteriores y preserva datos;
- primer despliegue: detiene API/web y preserva base;
- fallo de migración: marca revisión obligatoria.

No borrar volúmenes ni backups durante recuperación.

## LAN

`Enable-LanStaging.ps1` cambia staging a HTTPS, bind `0.0.0.0`, cookie Secure y exporta una CA local. Cada cliente debe confiarla explícitamente y el firewall debe revisarse en red privada. Ejecutarlo es una decisión separada; loopback es el default.
