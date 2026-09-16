# Runbook de backup y prueba de restauración

## Backup

```powershell
./scripts/Backup.ps1 -Environment staging
```

Entornos admitidos: `dev`, `staging`, `prod`. El script toma el lock del contexto y crea un dump binario con metadata, SHA-256 y fingerprint estable cuando es posible. La ubicación y retención se administran bajo `.runtime/backups`.

## Programación

```powershell
./scripts/Register-Backup.ps1
```

Registra una tarea diaria a las 02:00 para staging, con usuario interactivo y privilegios limitados. El host debe estar encendido y Docker operativo. La tarea no estaba registrada en la última evidencia disponible; comprobar su existencia antes de depender de ella.

## Probar restauración

```powershell
./scripts/Restore-Check.ps1 -Backup <ruta.dump> -Environment staging
```

El procedimiento no restaura sobre la fuente. Verifica:

1. SHA-256 del dump contra metadata;
2. pertenencia al mismo entorno/proyecto;
3. fingerprint estable y nombre de base válido;
4. fingerprint de la fuente antes del ensayo;
5. proyecto Compose, red interna, contenedor y volumen independientes;
6. restauración con `pg_restore --exit-on-error --no-owner`;
7. igualdad de filas/fingerprint;
8. fuente sin cambios durante el ensayo.

La evidencia queda en `.runtime/restore/<id>/evidence.json` y `.runtime/<entorno>/restore-evidence.json`.

## Resultado y limpieza

El contenedor de restauración se detiene, pero su volumen aislado se preserva para evidencia. No eliminarlo automáticamente. Una limpieza posterior requiere identificar exactamente proyecto/volumen y una decisión explícita.

## Reglas

- Un backup sin restauración probada no demuestra recuperabilidad.
- Backup de PostgreSQL no respalda originales del corpus técnico.
- Checksum correcto no sustituye fingerprint de contenido.
- Si la fuente cambia durante el ensayo, repetir cuando staging sintético esté inactivo.
- Nunca seleccionar producción por conveniencia para una prueba.
