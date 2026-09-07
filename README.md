# ASTRA Maintenance

Piloto preventivo de mantenimiento para Windows y red local. React/Vite, Express/TypeScript, Prisma/PostgreSQL.

## Checkpoint
Código API y web implementado e integrado en la rama feat/ASTRA-001-preventive-pilot. Pasan 20 tests PostgreSQL, typecheck y build. npm audit: 0 vulnerabilidades en la verificación local. Staging, E2E completo y PDF visual aún pendientes.

Leer [continuidad](docs/HANDOFF.md), [roadmap ampliado](docs/ROADMAP-EXTENDED.md), [contrato API](docs/API-CONTRACT.md), [operaciones](docs/OPERATIONS.md) y [referencias técnicas](docs/TECHNICAL-REFERENCE.md).

## Verificar
```powershell
./scripts/Verify.ps1
```

El script crea un proyecto Compose de test propio y una base astra_test. Es destructivo únicamente sobre los datos sintéticos de esa base aislada.

## Producto
Activos/lecturas, plan versionado, OT preventiva idempotente, stock transaccional, checkpoints, cierre/auditoría inmutables, pendientes y tarjetas A6/A4. Acceso individual ADMIN, TECHNICIAN y VIEWER.

Los ejemplos son sintéticos. Ningún intervalo o PN del seed es una recomendación OEM. Las fuentes reales se indexan localmente y conservan revisión pendiente hasta validar su aplicabilidad.

Merge de main y producción requieren aprobación humana. [Limitación de protecciones GitHub](docs/GITHUB-CONTROLS.md).
