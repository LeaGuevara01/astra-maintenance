# Verificación de ASTRA Maintenance

Actualizado: 2026-09-16. Este archivo conserva el estado verificable actual y enlaza la evidencia histórica por incremento. [CURRENT-STATUS.md](CURRENT-STATUS.md) distingue checkout, SHA probado y SHA desplegado.

## Estado verificable actual

- Base local: `c8e2efb3854caeca92e09a6a46912827775234b9`.
- Árbol equivalente previo al commit funcional: `scripts/Verify.ps1 -SkipInstall` PASS, cinco migraciones sin pendientes, typecheck API/web, 54/54 pruebas y build API/web.
- OpenAPI: commit `7cb84e8`; 35 operaciones cubiertas y prueba dirigida posterior al commit 2/2 PASS. No desplegado.
- Staging observado: health ready y API version `c8e2efb`; footer no reverificado.
- Revisión visual de paginaciones y drag desktop: omitida por decisión del usuario, no ejecutada.

## Índice de evidencia

Consultar [07-evidence/verification-index.md](07-evidence/verification-index.md) para el resumen por fecha/SHA y [07-evidence/releases/README.md](07-evidence/releases/README.md) para los bloques literales extraídos.

## Pendientes de verificación

- Las pruebas dirigidas de los cuatro defectos ya fueron completadas según la sección anterior.
- CI remoto del nuevo commit, si el repositorio lo ejecuta, es evidencia separada de las comprobaciones locales.
- Backup programado y acceso LAN/TLS solo si se decide habilitar operación persistente o LAN.

## Criterios de lectura

- “PASS” aplica únicamente al comando y árbol/SHA indicado.
- “Desplegado históricamente” no describe el runtime actual.
- Una comprobación API no equivale a aceptación visual.
- Datos sintéticos o corpus documental no validan equivalencias OEM, stock ni producción.
