# Próximo trabajo

Actualizado: 2026-09-16. Las tablas `DocumentAnalysisRun`, `DocumentFinding` y `DocumentFindingReview`, la cola de hallazgos y la derivación explícita a `DocumentCandidate` ya están implementadas. Su evidencia detallada permanece en `07-evidence/releases/`; no son trabajo pendiente.

## Incremento completado — OpenAPI

OpenAPI ya cubre candidatos, paginación, historial, decisiones, dry-run, fuentes, hallazgos y derivación. `openapi-parity.test.ts` compara las 35 operaciones implementadas con el contrato y comprueba referencias locales.

## Siguiente incremento documental

- Runbooks separados de desarrollo, verificación, staging, backup/restore y rollback: completados en `docs/04-operations/` a partir de los scripts actuales.
- Matriz de capacidades con evidencia por SHA: completada en `07-evidence/capability-matrix.md`.
- Plan no destructivo de archivo: completado en `documentation-audit/ARCHIVE-MIGRATION-PLAN.md`; el lote 1 fue ejecutado sin eliminar contenido.
- Lote 1 ejecutado: cuatro documentos históricos se movieron a `docs/archive/tasks/`, con avisos de archivo y sucesores canónicos.
- Lote 2 revisado sin movimientos: los cinco documentos conservan alcance pendiente o gobierno activo; se actualizaron estados internos y sucesores canónicos.
- Diseño del lote 3 completado en `documentation-audit/LOT-3-EXTRACTION-DESIGN.md`: doce registros por incremento, índices compatibles y validación por hash lógico.
- Lote 3 ejecutado: 35 bloques preservados en doce registros; manifiesto íntegro antes de compactar `HANDOFF.md` y `VERIFICATION.md` como índices compatibles.
- Reconciliación narrativa posterior al lote 3: completada; estado, conflictos, arquitectura y conteos apuntan a los índices y registros nuevos.
- Revisión integral del diff: completada. El árbol contiene un grupo funcional ASTRA-DOC-001 y otro de consolidación documental; la separación propuesta está en `documentation-audit/README.md`.
- Siguiente acción, sólo si se solicita: crear primero un commit funcional OpenAPI+prueba y después un commit de consolidación documental. Push, PR, merge y despliegue continúan separados.
- Mantener cualquier aplicación real al catálogo bloqueada hasta revisión técnica, diseño transaccional y autorización independiente.

La revisión visual de paginaciones y drag desktop fue omitida por decisión del usuario para continuar la implementación documental. No se considera ejecutada ni bloquea estos documentos; deberá abrirse como aceptación separada si vuelve a requerirse.

## Límites

Corpus, stock y producción no reciben cambios automáticos. Todo PN desconocido permanece `A_CONFIRMAR`. Consultar `PLAN-STATUS.md` para la planificación extensa; sus 84 filas no equivalen a Issues publicadas. Ejecutar pruebas proporcionales al comportamiento modificado, sin repetir recorridos históricos como trámite.
