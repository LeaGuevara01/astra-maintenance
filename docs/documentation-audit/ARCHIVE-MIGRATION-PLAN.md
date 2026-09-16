# Plan de migración al archivo

Estado: lotes 1 y 3 ejecutados; lote 2 revisado sin movimientos el 2026-09-16. No se eliminó evidencia.

## Lote 1 — tareas cerradas (ejecutado)

| Origen | Destino ejecutado | Clasificación | Sucesor canónico | Resultado |
|---|---|---|---|---|
| `docs/TASK-ASTRA-001.md` | `docs/archive/tasks/TASK-ASTRA-001.md` | Histórico | `PRODUCT.md`, modelo e invariantes | Movido; índice actualizado |
| `docs/ASTRA-006.md` | `docs/archive/tasks/ASTRA-006.md` | Histórico | Política del corpus + arquitectura backend | Movido; instrucciones históricas preservadas |
| `docs/ASTRA-007.md` | `docs/archive/tasks/ASTRA-007.md` | Histórico mixto | ADR, API contract y arquitectura documental | Movido; encabezado vigente retirado |
| `docs/ASTRA-007-REVIEW.md` | `docs/archive/tasks/ASTRA-007-REVIEW.md` | Evidencia histórica | Política del corpus + índice de evidencia | Movido; límites preservados |

## Lote 2 — planes consumidos o parciales (revisado, sin movimientos)

| Origen | Decisión revisada | Motivo |
|---|---|---|
| `DOCUMENT-AI-REVIEW-PLAN.md` | Mantener parcial; estados internos actualizados | Incrementos 1–2 implementados, 3 parcial, 4–5 pendientes |
| `UI-ARCHITECTURE-MIGRATION-PLAN.md` | Mantener parcial; arquitectura vigente enlazada | Primer slice integrado; extensión, taxonomía e IA pendientes |
| `AUTONOMOUS-DEVELOPMENT.md` | Mantener vigente mientras gobierne la secuencia | Es política/plan activo, no evidencia cerrada |
| `ROADMAP-EXTENDED.md` | Mantener en planificación; encabezado corregido | Sigue conteniendo alcance futuro y antecedentes fechados |
| `PLAN-STATUS.md` | Mantener como snapshot fechado; futura ubicación `archive/plans/` al reemplazarlo | No equivale a Issues actuales |

Resultado del lote 2: cero movimientos y cero eliminaciones. Archivar ahora ocultaría trabajo pendiente o políticas todavía activas.

## Lote 3 — registros acumulativos (ejecutado)

Diseño en [`LOT-3-EXTRACTION-DESIGN.md`](LOT-3-EXTRACTION-DESIGN.md). Ejecutado el 2026-09-16: 35 bloques copiados a doce registros bajo [`07-evidence/releases/`](../07-evidence/releases/README.md), con hashes normalizados verificados antes de compactar. `HANDOFF.md` y `VERIFICATION.md` permanecen como índices compatibles; no se eliminó evidencia.

## Documentos que no deben archivarse

- `PRODUCT.md`, `API-CONTRACT.md` y ADR aceptados.
- `CURRENT-STATUS.md`, `NEXT-TASK.md` y `docs/README.md`.
- Modelo de dominio, estados, invariantes, permisos y runbooks vigentes.
- Política documental y política del corpus.

## Riesgos

- Romper enlaces desde README, Issues o commits históricos.
- Perder distinción entre evidencia histórica y comportamiento vigente.
- Duplicar contenido al copiar en vez de mover/enlazar.
- Presentar un plan consumido como contrato actual.

## Criterio de aprobación del movimiento

- Mapa origen→destino revisado.
- Cero enlaces locales rotos.
- Sucesor canónico declarado.
- Diff limitado a movimientos y enlaces, sin cambios funcionales mezclados.
- Inventario regenerado y conteos explicados.
