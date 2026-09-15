> Estado vigente: revisión documental persistente implementada el 2026-09-15. Consultar docs/HANDOFF.md, docs/VERIFICATION.md y docs/PLAN-STATUS.md. Los checkpoints que siguen son históricos y no ordenan repetir trabajo.

## Flujo documental actual

Inteligencia documental permite registrar candidatos (ADMIN), guardar decisiones con motivo (ADMIN/TECHNICIAN), consultar historial y comparar contra el catálogo (incluido VIEWER). Las decisiones sobreviven a recarga. Fuente+SHA identifica la revisión; un cambio requiere nueva evidencia. No se aplica catálogo ni stock. No hay datos hardcodeados de revisión.

## Antecedentes históricos


# ASTRA Maintenance

Piloto preventivo de mantenimiento para Windows y red local. React/Vite, Express/TypeScript, Prisma/PostgreSQL.

## Checkpoint
Código API y web implementado e integrado en `main` (`b21b347`). Pasan 21 tests PostgreSQL, typecheck y build en la verificación registrada. Staging sintético local, backup/restore aislado, rollback, E2E de tres roles y revisión visual PDF A6/A4 ya quedaron ejecutados sobre datos sintéticos.

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
