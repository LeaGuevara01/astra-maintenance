# ASTRA Maintenance

Piloto preventivo de mantenimiento para Windows y red local. React/Vite, Express/TypeScript, Prisma/PostgreSQL.

## Estado

La línea funcional más reciente de este checkout incluye revisión documental persistente, hallazgos asistidos y el primer flujo contextual `DocumentFinding → DocumentCandidate`. No aplica candidatos al catálogo ni modifica stock automáticamente.

El estado actual, el último SHA verificado y el SHA desplegado se mantienen separados en [docs/CURRENT-STATUS.md](docs/CURRENT-STATUS.md). La documentación completa comienza en [docs/README.md](docs/README.md).

Los checkpoints `b21b347`, `3b2223d`, `52b1220`, `2b6cd68` y `a6cf1a8` conservan evidencia histórica con distinto alcance. Ninguno debe presentarse como identidad actual sin consultar [verificación](docs/VERIFICATION.md) y los [registros por incremento](docs/07-evidence/releases/README.md).

## Verificar
```powershell
./scripts/Verify.ps1
```

El script crea un proyecto Compose de test propio y una base astra_test. Es destructivo únicamente sobre los datos sintéticos de esa base aislada.

## Producto
Activos/lecturas, plan versionado, OT preventiva idempotente, stock transaccional, checkpoints, cierre/auditoría inmutables, pendientes y tarjetas A6/A4. Acceso individual ADMIN, TECHNICIAN y VIEWER.

Los ejemplos son sintéticos. Ningún intervalo o PN del seed es una recomendación OEM. Las fuentes reales se indexan localmente y conservan revisión pendiente hasta validar su aplicabilidad.

Merge de main y producción requieren aprobación humana. [Limitación de protecciones GitHub](docs/GITHUB-CONTROLS.md).
