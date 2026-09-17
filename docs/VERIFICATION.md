# Verificación de ASTRA Maintenance

Actualizado: 2026-09-16. Este archivo conserva el estado verificable actual y enlaza la evidencia histórica por incremento. [CURRENT-STATUS.md](CURRENT-STATUS.md) distingue checkout, SHA probado y SHA desplegado.

## Estado verificable actual

- Main remoto: a68150ef566b718b490798dacf6228fbfc125b9d; árbol igual a `abc77f6`, sin atribuirle un nuevo Verify completo.
- Última verificación funcional encontrada: 68ee6315f1e4ccaa2399bde6d83138663b5135cf; 54 API + 5 web, migraciones, typecheck y build según [registro](07-evidence/releases/2026-09-16/10-frontend-session-isolation.md).
- Reconciliación actual: sólo documentación; checks en [tarea](05-planning/ASTRA-RF-000-reconciliation.md).
- Staging a0c9178 es observación histórica. Runtime no consultado ni desplegado aquí.
- OpenAPI integrado: 35 operaciones. La extensión QR local no forma parte de ese contrato.

## Índice de evidencia

Consultar [07-evidence/verification-index.md](07-evidence/verification-index.md) para el resumen por fecha/SHA y [07-evidence/releases/README.md](07-evidence/releases/README.md) para los bloques literales extraídos.

## Pendientes de verificación

- DOC-002 ya integrado; no repetir su ejecución.
- ASTRA-010 conserva criterios; REF-001 tiene implementación local no integrada. Exigir snapshot y evidencia antes de certificarla.
- Backup programado y acceso LAN/TLS solo si se decide habilitar operación persistente o LAN.

## Criterios de lectura

- “PASS” aplica únicamente al comando y árbol/SHA indicado.
- “Desplegado históricamente” no describe el runtime actual.
- Una comprobación API no equivale a aceptación visual.
- Datos sintéticos o corpus documental no validan equivalencias OEM, stock ni producción.
