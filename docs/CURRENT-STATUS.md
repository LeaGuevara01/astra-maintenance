# Estado actual de ASTRA

Actualizado: 2026-09-16.

## Identidad

| Concepto | Valor | Alcance |
|---|---|---|
| Base funcional de esta rama documental | `c8e2efb3854caeca92e09a6a46912827775234b9` | `feat/document-review-history` antes de los cambios documentales actuales |
| Rama de consolidación | `docs/ASTRA-documentation-baseline` | ASTRA-DOC-001 y documentación se empaquetan en commits separados |
| `origin/main` observado | `54beabe7f8d25f306c9ab38c781df3c972a033d8` | Referencia remota local; no contiene los nueve commits funcionales posteriores de la rama base |
| Último SHA funcional verificado | `a6cf1a8a38aa6670066fa477dfe1f4c96c199d87` | 52/52 pruebas, migraciones existentes, typecheck y build API/web |
| Commit funcional ASTRA-DOC-001 | `7cb84e8` | Prueba de paridad 2/2 repetida después del commit; archivos funcionales coinciden con HEAD |
| SHA actualmente reportado por staging | `c8e2efb3854caeca92e09a6a46912827775234b9` | `/health/ready` respondió ready y `/api/v1/version` coincidió el 2026-09-16; footer no reverificado en este recorrido |
| Consolidación documental | Commit separado del funcional | Validada por inventario, enlaces, hashes de extracción y `git diff --check`; consultar Git para su SHA |

No debe inferirse que los commits de esta rama están desplegados. Staging reporta la base `c8e2efb`; ASTRA-DOC-001 quedó en `7cb84e8` y no fue desplegado.

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
- No hubo merge de esta línea de trabajo a `main` ni despliegue de producción.
- El gesto físico de drag & drop en viewport desktop no tiene evidencia de navegador; la alternativa por click sí.
- OpenAPI cubre las 35 operaciones implementadas; la paridad método+ruta y las referencias locales tienen prueba automática. Falta validación independiente OpenAPI 3.1 y ejemplos completos.

## Próximos incrementos

- Documentación: consolidación separada del commit funcional; consultar `NEXT-TASK.md` y Git para el siguiente gate.
- Producto: la revisión dirigida de paginaciones y drag & drop desktop sigue sin ejecutarse por decisión del usuario; después corresponde diseñar el lector seguro por `sourceId`.

## Evidencia y antecedentes

- Estado verificable y checks pendientes: `VERIFICATION.md`.
- Continuidad e índice de incrementos: `HANDOFF.md`.
- Registro cronológico por incremento/SHA: `07-evidence/releases/README.md`.
- Inventario y conflictos documentales: `documentation-audit/README.md` y `documentation-audit/CONFLICTS-AND-GAPS.md`.
- Estado de la planificación extensa: `PLAN-STATUS.md`; no equivale a Issues publicadas.
