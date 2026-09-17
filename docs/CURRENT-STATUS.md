# Estado actual de ASTRA

Reconciliado: 2026-09-17, tarea [ASTRA-RF-000](05-planning/ASTRA-RF-000-reconciliation.md).

## Identidad

| Concepto | Valor | Evidencia |
|---|---|---|
| Main remoto observado tras fetch | a68150ef566b718b490798dacf6228fbfc125b9d | Conserva el árbol funcional de `abc77f6`; añade diez commits transitorios sin diff de árbol |
| Base de esta reconciliación | a68150ef566b718b490798dacf6228fbfc125b9d | Rama chore/ASTRA-RF-000-reconciliation; SHA final en Git |
| Última verificación funcional completa encontrada | 68ee6315f1e4ccaa2399bde6d83138663b5135cf | Registro de aislamiento: 54 API, 5 web, migraciones, typecheck/build; no reejecutado aquí |
| Último staging documentado | a0c9178d668305bc33bc8bacdad9f0ec529e4653 | Health/version/footer históricos del 16/09; runtime no consultado hoy |

## Capacidades integradas
Piloto preventivo con sesión/RBAC, activos, planes, OT, reserva/consumo, checkpoints e historia inmutable. Tarjetas A6/A4. Revisión documental persistente, cola de fuentes/hallazgos, derivación explícita y dry-run sin stock. Primitivas UI e inspector. OpenAPI con 35 operaciones y prueba de paridad. Transporte frontend con aislamiento de sesión y cinco pruebas; control de invocación más reciente en carga global. Templates y agents:check integrados.

## Trabajo no integrado
Familias fd402ec tiene evidencia local, pero no aceptación sobre esta rama. ASTRA-REF-001 contiene lector, referencias, trazabilidad y migraciones en un worktree sucio. No declarar esos endpoints o esquema disponibles en main. Ver [reconciliación de contratos](05-planning/ASTRA-RF-000-contract-reconciliation.md).

## Límites
No se aplica catálogo ni se modifica stock por documentos. A_CONFIRMAR y procedencia permanecen. Main no sirve originales. Pruebas de componentes, drag desktop y aceptación de QR/móvil/impresión no quedan cubiertas por la evidencia de transporte. No hubo deploy ni merge main en esta reconciliación.

Continuidad: [NEXT-TASK](NEXT-TASK.md), [VERIFICATION](VERIFICATION.md), [HANDOFF](HANDOFF.md), [PLAN-STATUS](PLAN-STATUS.md).
