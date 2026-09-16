# Estado actual de ASTRA

Actualizado: 2026-09-16.

## Identidad

| Concepto | Valor | Alcance |
|---|---|---|
| `main` y `origin/main` observados | `a0c9178d668305bc33bc8bacdad9f0ec529e4653` | Merge de PR #8; integra ASTRA-DOC-001 y la consolidación documental |
| Último SHA verificado | `a0c9178d668305bc33bc8bacdad9f0ec529e4653` | Árbol limpio; typecheck, 54/54 pruebas, cinco migraciones sin pendientes y build API/web |
| SHA actualmente reportado por staging | `a0c9178d668305bc33bc8bacdad9f0ec529e4653` | Health, version y footer coincidentes el 2026-09-16 |
| Release anterior conservado | `c8e2efb3854caeca92e09a6a46912827775234b9` | Identidad de rollback de aplicación registrada por staging |
| Trabajo documental siguiente | `chore/ASTRA-DOC-002-post-deploy-plan` sobre `a0c9178` | Reconciliación post-deploy y plan ASTRA-010; aún no desplegado |

El runtime sintético y `main` coinciden en `a0c9178`. Los cambios posteriores de planificación/documentación no alteran esa identidad y no se consideran desplegados.

## Capacidades vigentes

- Piloto preventivo con roles ADMIN, TECHNICIAN y VIEWER.
- Activos, lecturas, planes versionados, generación idempotente de OT, reserva/consumo, checkpoints y cierre inmutable.
- Tarjetas A6 y A4 derivadas del snapshot de la intervención.
- Revisión documental persistente con candidatos, historial paginado y comparación dry-run sin efecto de stock.
- Cola de fuentes y hallazgos asistidos con procedencia, decisiones humanas append-only y estados conservadores.
- Derivación explícita `DocumentFinding → DocumentCandidate` sólo para ADMIN y `PART_CANDIDATE`, sin aplicación al catálogo.
- Primitivas UI de entidad, badges, inspector y alternativa accesible por click/teclado.

## Límites vigentes

- No existe aplicación transaccional de candidatos al catálogo.
- El corpus no valida automáticamente PN, equivalencia OEM, aplicabilidad, stock, precio ni verdad contable.
- Los originales no se sirven desde la aplicación.
- La línea documental fue integrada a `main`; no hubo despliegue de producción.
- El gesto físico de drag & drop en viewport desktop no tiene evidencia de navegador; la alternativa por click sí.
- OpenAPI cubre las 35 operaciones implementadas; la paridad método+ruta y las referencias locales tienen prueba automática. Falta validación independiente OpenAPI 3.1 y ejemplos completos.

## Próximos incrementos

- Integración documental: cerrar ASTRA-DOC-002 con identidades post-deploy, auditoría regenerada y evidencia enlazada.
- Desarrollo: ejecutar [ASTRA-010](05-planning/ASTRA-010-secure-source-reader.md) por etapas, comenzando por contrato, threat model y resolver sobre fixtures aislados.
- Aceptación separada: la revisión física de drag & drop desktop sigue omitida por decisión del usuario y no bloquea ASTRA-010.

## Evidencia y antecedentes

- Estado verificable y checks pendientes: `VERIFICATION.md`.
- Continuidad e índice de incrementos: `HANDOFF.md`.
- Registro cronológico por incremento/SHA: `07-evidence/releases/README.md`.
- Inventario y conflictos documentales: `documentation-audit/README.md` y `documentation-audit/CONFLICTS-AND-GAPS.md`.
- Estado de la planificación extensa: `PLAN-STATUS.md`; no equivale a Issues publicadas.
