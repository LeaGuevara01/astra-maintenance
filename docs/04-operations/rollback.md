# Runbook de rollback de staging

## Propósito

Volver a las imágenes de la release anterior preservando la base de datos. No revierte migraciones ni borra datos.

## Precondiciones

- `release.json` y `previous-release.json` válidos en `.runtime/staging`.
- Ambas imágenes todavía disponibles y coincidentes con sus digests.
- Lock de staging libre.
- Riesgo de compatibilidad de esquema evaluado: la release anterior debe poder operar sobre el esquema actual.

## Ejecutar

```powershell
./scripts/Rollback-Staging.ps1
```

El script:

1. carga release actual y anterior;
2. comprueba imágenes/digests;
3. activa la release anterior mediante health/version;
4. intercambia `release.json` y `previous-release.json`;
5. preserva la base.

Si la activación falla después de cambiar imágenes, intenta restaurar la release que estaba activa. Un warning de “requires intervention” exige detenerse y revisar health, logs y archivos de release; no repetir en bucle.

## Verificación posterior

- `/health/ready` responde ready.
- `/api/v1/version` coincide con el commit restaurado.
- Los datos sintéticos esperados continúan presentes.
- No se ejecutaron migraciones inversas.
- Registrar resultado en `VERIFICATION.md` con SHA y alcance.

## Límites

- Rollback de aplicación no es rollback de base.
- No eliminar tablas/migraciones para hacer compatible una imagen antigua.
- No usar `git reset`, reconstrucción no identificada o tags flotantes como sustituto.
- Producción requiere procedimiento y aprobación independientes.
