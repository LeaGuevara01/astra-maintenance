# Verificación de ASTRA Maintenance

Actualizado: 2026-09-16. Este archivo conserva el estado verificable actual y enlaza la evidencia histórica por incremento. [CURRENT-STATUS.md](CURRENT-STATUS.md) distingue checkout, SHA probado y SHA desplegado.

## Estado verificable actual

- `main`/`origin/main` integrados: `a0c9178d668305bc33bc8bacdad9f0ec529e4653`.
- `./scripts/Verify.ps1 -SkipInstall`: PASS sobre ese SHA limpio; cinco migraciones sin pendientes, typecheck API/web, 54/54 pruebas y build API/web.
- OpenAPI: 32 paths y 35 operaciones; paridad método+ruta incluida en la suite.
- Staging observado: health ready, API version y footer coinciden con `a0c9178`; entorno `staging`, versión `0.1.0`.
- Backup previo creado y hasheado; no se ejecutó restore-check específico sobre ese dump.
- Revisión visual de paginaciones y drag desktop: omitida por decisión del usuario, no ejecutada.

## Índice de evidencia

Consultar [07-evidence/verification-index.md](07-evidence/verification-index.md) para el resumen por fecha/SHA y [07-evidence/releases/README.md](07-evidence/releases/README.md) para los bloques literales extraídos.

## Pendientes de verificación

- ASTRA-DOC-002 modifica documentación y whitespace únicamente; requiere auditoría, enlaces y `git diff --check`, no una repetición funcional completa.
- ASTRA-010 aún es plan: sus checks se ejecutarán por incremento cuando exista implementación.
- Backup programado y acceso LAN/TLS solo si se decide habilitar operación persistente o LAN.

## Criterios de lectura

- “PASS” aplica únicamente al comando y árbol/SHA indicado.
- “Desplegado históricamente” no describe el runtime actual.
- Una comprobación API no equivale a aceptación visual.
- Datos sintéticos o corpus documental no validan equivalencias OEM, stock ni producción.
