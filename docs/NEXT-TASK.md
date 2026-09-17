# Próximo trabajo

Reconciliado 2026-09-17 sobre main remoto a68150ef566b718b490798dacf6228fbfc125b9d, cuyo árbol coincide con `abc77f6`.
DOC-002, coordinación y aislamiento de sesiones están integrados. No repetir sus implementaciones.

## Gate inmediato
Cerrar [ASTRA-RF-000](05-planning/ASTRA-RF-000-reconciliation.md) con checks documentales y commit revisable. Resolver el [mapa de contratos](05-planning/ASTRA-RF-000-contract-reconciliation.md) antes de incorporar cambios funcionales.

## Integración funcional siguiente
Obtener handoff reproducible de ASTRA-REF-001 y fijar commit del responsable; revisar familias fd402ec sobre la misma base. No reutilizar ni limpiar sus worktrees. Backend y frontend pueden revisar simultáneamente; sólo el integrador modifica contratos compartidos e integra por dependencia.

El plan [ASTRA-010](05-planning/ASTRA-010-secure-source-reader.md) conserva criterios de seguridad; contrastarlo con la implementación local REF-001 antes de encargar otro lector. Resolver ruta/códigos, PDF/imágenes, permisos comerciales y migraciones explícitamente. No adoptar automáticamente ambos contratos.

Primera entrega funcional: la menor unidad coherente del trabajo existente que supere revisión de contratos y pruebas aisladas; lector/referencias y familias son candidatos, no entregas aceptadas. El trabajo de QR y familias colisiona en App/Views; serializar integración. No implementar WMS por inferirlo de contenedores.

## Verificación y límites
Pruebas proporcionales al diff funcional y sobre árbol integrado; no heredar PASS de otro SHA. No repetir PDF preventivo o circuito completo si no cambian esos flujos. Runtime no consultado; staging histórico a0c9178. Merge main y producción requieren aprobación humana.
