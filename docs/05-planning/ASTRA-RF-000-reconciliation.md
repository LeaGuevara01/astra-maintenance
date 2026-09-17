# ASTRA-RF-000 — Integración reconciliadora

Fecha: 2026-09-17. Estado: HANDOFF_READY. Integrador: Codex.
Base de integración: a68150ef566b718b490798dacf6228fbfc125b9d. Su árbol coincide con `abc77f63dd62daf2eafbd30f73948bec1865d221`; los diez commits intermedios no aportan diff de árbol.
Rama: chore/ASTRA-RF-000-reconciliation. Worktree: ../../work/astra-rf-000 desde el checkout original.

## Objetivo y ownership
Reconciliar estado y contratos documentados con main y distinguir trabajo local no integrado. Sólo docs/**. Prohibidos apps/**, prisma/**, configuración, lockfile y worktrees ajenos. Sin cambios de comportamiento, DB, stock, snapshots ni despliegue.
Fuentes: AGENTS.md, PRODUCT.md, API-CONTRACT.md, HANDOFF.md, AGENT-OPERATING-MODEL.md, DEFINITION-OF-DONE.md y AGENT-TASK-TEMPLATE.md.

## Revisiones simultáneas
Dos especialistas de sólo lectura: baseline_contract_review (backend/contratos) y baseline_frontend_review (frontend/colisiones). No son implementadores ni tienen ownership de escritura. El integrador conserva todos los cambios y registra informes. Main está fijado por SHA; QR se inspecciona como árbol sucio, por lo que sus conclusiones son preliminares y no constituyen aceptación reproducible.

## Inventario y dependencias
- Checkout original: fix/frontend-session-isolation en 17e7eaa6f152bd855fbd5ca6c263ddc8fa70163c, con cambios preexistentes documentales y UI. Preservado.
- Familias: feat/asset-family-relations en fd402ec; no integrado. Toca App, Views, entity, main y nuevos archivos de familias.
- QR: feat/technical-references-qr sobre 17e7eaa, cambios sin commit en API, web, Prisma, contratos, Compose y lockfile. ASTRA-REF-001 registra su alcance local. Requiere handoff de su responsable antes de integración funcional.
- DOC-002, coordinación y aislamiento de sesiones ya están integrados por merges #9, #10 y #11. No repetirlos. El avance posterior de main hasta `a68150e` no cambió el árbol.

## Aceptación
Identidades separadas; P008/P010 reflejan evidencia real sin cerrar componentes pendientes; contratos de main no anuncian endpoints QR ausentes; diferencias ASTRA-010/REF-001 registradas; siguiente gate concreto. Verificación documental: agents:check, diff --check y enlaces locales afectados. No se requiere Verify completo para este cambio documental.

## Stop conditions
No integrar trabajo ajeno sin snapshot; no extender producto por inferencia; no editar contratos funcionales para anunciar código ausente. Si el árbol QR cambia, la revisión permanece preliminar. Merge main y producción requieren aprobación humana.

## Handoff
Final SHA: consultar commit de esta rama. Revisiones de lectura completadas: [backend](reviews/RF-000A-BE.md), [frontend](reviews/RF-000A-FE.md). Cambios integrados por un único escritor en esta rama. agents:check PASS (4 templates, 2 instrucciones). diff --check y enlaces se verifican antes del commit. Sin tests funcionales por ser documentación; sin aceptación del código QR/familias. Staging: NOT_DEPLOYED; runtime no consultado.
