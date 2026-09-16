# Índice de evidencia verificable

Resumen navegable. El estado verificable actual permanece en [`../VERIFICATION.md`](../VERIFICATION.md) y los bloques detallados están en [`releases/`](releases/README.md). La tabla no convierte evidencia histórica en prueba del HEAD actual.

Para cobertura por función consultar [matriz de capacidades](capability-matrix.md).

| Fecha | SHA/árbol | Alcance | Resultado | Staging |
|---|---|---|---|---|
| 2026-09-16 | `7cb84e8` | [ASTRA-DOC-001, paridad OpenAPI](releases/2026-09-16/07-openapi-parity.md) | 2/2 posterior al commit; suite 54/54 sobre árbol funcional equivalente | No desplegado |
| 2026-09-16 | `c8e2efb` | Identidad API observada | health ready y version coincidente | Sí; footer no reverificado |
| 2026-09-16 | `a6cf1a8` | [Vertical UI de entidades](releases/2026-09-16/05-ui-entity-slice.md) | 52/52, build, roles dirigidos y fallback responsive | Desplegado históricamente y revisado |
| 2026-09-16 | `2b6cd68` | [Cola de fuentes](releases/2026-09-15/03-source-review-queue.md) | 45 pruebas, build y revisión dirigida | Desplegado históricamente |
| 2026-09-15 | `52b1220` | [Revisión documental persistente](releases/2026-09-15/01-document-review-persistence.md) | 42 pruebas, migración, build | Desplegado históricamente |
| 2026-09-15 | `3b2223d` | ASTRA-007 y base documental anterior | Verify registrado; health/version observado | Desplegado históricamente |
| 2026-09-11 | `b21b347` | ASTRA-005 roles y PDF A6/A4 | E2E sintético histórico | Desplegado históricamente |

## Evidencia actual pendiente

- La consolidación documental está separada del commit funcional; consultar Git para su SHA final.
- El commit OpenAPI `7cb84e8` no está desplegado.
- La revisión visual de paginaciones y drag desktop fue omitida por decisión del usuario; no es requisito para continuar documentación.
- La observación actual de staging `c8e2efb` confirmó API, no footer.

## Criterios de lectura

- “PASS” aplica sólo al comando y árbol/SHA indicado.
- “Desplegado históricamente” no describe el runtime actual.
- Un número mayor de pruebas no sustituye revisión del comportamiento modificado.
- Una comprobación API no equivale a aceptación visual.
- Datos sintéticos no autorizan conclusiones OEM ni producción.
