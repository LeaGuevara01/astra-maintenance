# Índice de decisiones de arquitectura

Este índice distingue decisiones aceptadas de planes, evidencia e implementación incidental.

| ADR | Estado | Decisión | Alcance | Pendiente relacionado |
|---|---|---|---|---|
| [ADR-001](../../ADR-001-architecture.md) | Aceptado | Monolito modular TypeScript, PostgreSQL, entrega local y staging sintético | Arquitectura base, despliegue y corpus local | Producción requiere decisión independiente |
| [ADR-002](../../ADR-002-document-review.md) | Aceptado | Revisión documental persistente, inmutable y sin aplicación automática | Fuentes, candidatos y decisiones humanas | Reconciliación global con parts-intelligence P036 |

## Decisiones vigentes aún sin ADR propio

Estas reglas están aceptadas por contratos/código, pero conviene convertirlas en ADR si se amplían:

- Sesión servidor, cookie same-origin, origen exacto y CSRF.
- Idempotencia persistida y transacciones serializables.
- Snapshot inmutable de OT cerrada.
- `A_CONFIRMAR` como estado conservador transversal.
- Separación estricta entre documentación del sistema y corpus externo.
- OpenAPI como contrato público con prueba de paridad de rutas.

## Cuándo crear un ADR

Crear un ADR para una decisión difícil de revertir o transversal: nuevo límite de módulo, nueva fuente de verdad, cambio de persistencia, integración externa, política de seguridad, ejecución de IA o aplicación de candidatos. No usar ADR para registrar cada cambio menor o resultado de pruebas.

Formato mínimo:

```text
Título
Estado: propuesto | aceptado | sustituido
Contexto
Decisión
Consecuencias
Alternativas consideradas
Evidencia y fecha
Supersede / superseded_by
```
