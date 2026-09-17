# RF-000A-BE — Revisión de contratos

Estado: HANDOFF_READY. Revisor baseline_contract_review, sólo lectura. Integrador registra informe; el especialista no modificó archivos. Snapshot funcional revisado: `abc77f6`; main avanzó después a `a68150e` sin cambiar el árbol. QR observado sobre 17e7eaa6f152bd855fbd5ca6c263ddc8fa70163c, dirty/untracked; revisión preliminar no reproducible por commit. Sin tests ni DB.

1. Contrato QR declara 422 INVALID_PAGE; technical-references.ts:38 valida cero/no entero con Zod y app.ts:133 lo convierte en 400 VALIDATION_ERROR. Prueba de helper no certifica endpoint.
2. technical-references.ts:22-28 registra revisiones COMMERCIAL en DocumentRevision. document-review.ts:50-95 enumera revisiones para los tres roles y devuelve título/sourceId/hash. Decidir confidencialidad de metadatos y probar recorrido cruzado antes de integrar.
3. Creación exige TECHNICAL, pero lista/detalle/vínculos retornan extractos sin consultar clasificación actual. Falta política y prueba para cambio TECHNICAL a COMMERCIAL. Escenario pendiente, no explotación demostrada.
4. Lector, referencias, trazabilidad, migraciones y ampliación de contratos están NO INTEGRADOS. No convertir dirty tree en capacidad de main.

Los paths/líneas anteriores corresponden al worktree QR observado. Siguiente paso: handoff estable del responsable y correcciones contractuales probadas. No hubo cambio de contrato funcional ni datos.
