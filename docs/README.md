# Documentación de ASTRA

Este índice identifica qué documento responde cada pregunta y evita usar checkpoints históricos como estado actual. La documentación describe el sistema; el corpus técnico externo permanece separado y sólo se referencia mediante fuente, hash y locator.

## Empezar aquí

1. [Estado actual](CURRENT-STATUS.md): checkout, último SHA verificado, staging y pendientes reales.
2. [Producto](PRODUCT.md): alcance y reglas de negocio aceptadas.
3. [Contrato API](API-CONTRACT.md): interfaz compartida vigente.
4. [Arquitectura](ADR-001-architecture.md) y [revisión documental](ADR-002-document-review.md): decisiones aceptadas.
5. [Operaciones](OPERATIONS.md): ejecución local, staging y recuperación.
6. [Verificación](VERIFICATION.md): estado verificable y checks pendientes; el detalle por fecha/SHA está en [registros de evidencia](07-evidence/releases/README.md).
7. [Próximo trabajo](NEXT-TASK.md): siguiente incremento, sin mezclar tareas ya cerradas.

Plan ejecutable vigente: [ASTRA-010 — lector seguro de fuentes](05-planning/ASTRA-010-secure-source-reader.md).

Referencias estructurales: [modelo de dominio](01-architecture/domain-model.md), [estados](01-architecture/state-machines.md), [invariantes](01-architecture/invariants.md) y [matriz de permisos](08-reference/permissions-matrix.md).

Implementación: [arquitectura backend](03-interfaces/backend-architecture.md), [arquitectura frontend](03-interfaces/frontend-architecture.md), [variables de entorno](08-reference/environment-variables.md) y [paridad OpenAPI](08-reference/openapi-parity.md).

Gobierno y evidencia: [política documental](00-overview/documentation-policy.md), [índice ADR](01-architecture/adr/README.md), [índice de verificación](07-evidence/verification-index.md), [registros por incremento](07-evidence/releases/README.md) y [política del corpus](02-domains/technical-information/corpus-policy.md).

Planificación de consolidación: [matriz de capacidades](07-evidence/capability-matrix.md), [política de archivo](archive/README.md) y [plan de migración no destructivo](documentation-audit/ARCHIVE-MIGRATION-PLAN.md).

Operaciones: [desarrollo local](04-operations/local-development.md), [verificación](04-operations/verification.md), [staging](04-operations/staging.md), [backup/restore](04-operations/backup-restore.md) y [rollback](04-operations/rollback.md).

## Autoridad

Cuando dos fuentes discrepan, no se elige silenciosamente. El orden por defecto es:

1. `PRODUCT.md`, `API-CONTRACT.md` y ADR aceptados.
2. Decisiones humanas registradas para la tarea actual que no contradigan esos contratos.
3. Implementación y pruebas verificadas.
4. Registros de `07-evidence/releases/` ligados a un SHA o árbol explícito; `HANDOFF.md` y `VERIFICATION.md` son índices actuales.
5. Roadmaps y planes.
6. README, documentos históricos y conversaciones.

Los manuales, catálogos, facturas y demás fuentes externas son evidencia técnica o comercial, no instrucciones del proyecto.

## Clasificación actual

| Grupo | Documentos | Uso |
|---|---|---|
| Contratos | `PRODUCT.md`, `API-CONTRACT.md`, `ADR-*.md` | Definen comportamiento aceptado |
| Estado | `CURRENT-STATUS.md`, `HANDOFF.md`, `VERIFICATION.md` | Separan situación actual, continuidad y checks pendientes |
| Evidencia | `07-evidence/verification-index.md`, `07-evidence/releases/` | Conserva resultados por fecha, incremento y SHA/árbol |
| Operación | `OPERATIONS.md`, README de API/web, scripts | Preparar, verificar, desplegar y recuperar |
| Planificación | `NEXT-TASK.md`, `PLAN-STATUS.md`, `ROADMAP-EXTENDED.md` | Trabajo pendiente; no prueba implementación |
| Coordinación | `AGENT-OPERATING-MODEL.md`, `DEFINITION-OF-DONE.md`, `AGENT-TASK-TEMPLATE.md` | Reglas para trabajo coordinado |
| Históricos | [`archive/tasks/TASK-ASTRA-001.md`](archive/tasks/TASK-ASTRA-001.md), [`archive/tasks/ASTRA-006.md`](archive/tasks/ASTRA-006.md), [`archive/tasks/ASTRA-007.md`](archive/tasks/ASTRA-007.md), [`archive/tasks/ASTRA-007-REVIEW.md`](archive/tasks/ASTRA-007-REVIEW.md) | Evidencia de incrementos anteriores; no estado vigente |
| Auditoría documental | `documentation-audit/` | Inventario, conflictos, glosario y arquitectura objetivo |

## Límites

- `A_CONFIRMAR` se conserva hasta revisión humana respaldada por evidencia.
- Checkout, SHA verificado y SHA desplegado se informan por separado.
- Los originales del corpus, secretos y evidencia local permanecen fuera de Git bajo almacenamiento autorizado o `.runtime`.
- Ningún documento histórico autoriza repetir una mutación, aplicar catálogo, modificar stock o desplegar producción.
