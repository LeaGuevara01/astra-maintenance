# Conflictos, vigencia y conocimiento implícito

## Registro de conflictos

### CONFLICT-001 — checkpoint principal desactualizado

- Documento: `README.md`.
- Declara: código integrado en `main` en `b21b347` y 21 pruebas.
- Evidencia actual: el checkout está en `c8e2efb`; `origin/main` observado está en `54beabe`; el árbol local tiene suite 54/54 y los registros conservan staging histórico de `a6cf1a8`.
- Clasificación: `Previous version` dentro de un documento todavía útil.
- Estado: resuelto. README enlaza estado, verificación y registros por incremento sin presentar un checkpoint histórico como identidad actual.

### CONFLICT-002 — próximo trabajo ya implementado

- Documento: `NEXT-TASK.md`.
- Declara como futuro: tablas `DocumentAnalysisRun`, `DocumentFinding`, `DocumentFindingReview`, UI de hallazgos y derivación explícita.
- Código actual: las tres entidades existen en Prisma; API/UI, revisión y derivación están implementadas y verificadas.
- Clasificación: `Conflicting version` / plan consumido.
- Estado: resuelto. NEXT-TASK separa trabajo ya ejecutado, siguiente acción documental y pendientes funcionales.

### CONFLICT-003 — operaciones apunta a ASTRA-006 como siguiente foco

- Documento: `OPERATIONS.md`.
- Declara: ASTRA-005 cerrado y ASTRA-006 como siguiente trabajo.
- Evidencia actual: ASTRA-006/007 y múltiples incrementos documentales posteriores ya existen.
- Clasificación: `Previous version` parcial.
- Estado: resuelto. OPERATIONS funciona como índice de runbooks vigentes sin ordenar ASTRA-006 como siguiente tarea.

### CONFLICT-004 — cabeceras de fecha no representan vigencia

- Documentos: `HANDOFF.md` y `VERIFICATION.md`.
- Declaran en el título/cabecera 2026-09-15, pero contienen secciones del 2026-09-16.
- Clasificación: inconsistencia editorial.
- Estado: resuelto. HANDOFF/VERIFICATION son índices y la cronología está en registros con front matter por incremento.

### CONFLICT-005 — OpenAPI público incompleto frente al contrato

- Contrato: `API-CONTRACT.md` incluye revisión documental, paginación, fuentes, hallazgos y derivación.
- Implementación: `apps/api/src/openapi.ts` no constituye una especificación exhaustiva de todos los endpoints y esquemas documentales; `NEXT-TASK.md` también lo reconoce.
- Clasificación: contrato narrativo vigente, representación OpenAPI parcial.
- Estado: resuelto por `ASTRA-DOC-001`. Las diez operaciones documentales y sus schemas se añadieron; `openapi-parity.test.ts` exige igualdad método+ruta y referencias locales válidas. Permanece como mejora la validación semántica independiente OpenAPI 3.1.

### CONFLICT-006 — terminología de intervención y OT

- UI/documentos usan “orden”, “OT”, “intervención”, “orden preventiva” y `WorkOrder`.
- `Intervención planificada` no debe tratarse automáticamente como sinónimo de entidad: puede describir el proceso, no el registro.
- Acción: aplicar el mapeo de `GLOSSARY.md`; no renombrar Prisma ni API en esta fase.

### CONFLICT-007 — estado de activo sin enumeración canónica

- Prisma persiste `Asset.operatingStatus` como `String` con `A_CONFIRMAR`.
- Cierre usa resultados `OPERATIVE`, `OPERATIVE_WITH_NOTES`, `NOT_OPERATIVE` y el backend actualiza estado.
- Contrato describe el comportamiento, pero no define un enum/versionado formal del estado del activo.
- Acción: documentar valores y transición antes de cualquier migración; mantener `A_CONFIRMAR` para desconocidos.

### CONFLICT-008 — métricas históricas de OCR no coinciden con el índice actual

- El registro histórico de persistencia cita 142 pendientes OCR con su definición original.
- Índice actual: 104 `OCR_REQUIRED`; el resumen normalizado anterior sumaba 142 al incluir 38 `PARTIAL`.
- Acción: etiquetar siempre fecha, definición y fuente del conteo. No sustituir una cifra por otra sin explicar la taxonomía.

## Duplicación y fusión

No hay duplicados exactos. Los 33 pares de `overlap-candidates.csv` excluyen los releases históricos deliberadamente relacionados y requieren revisión humana. Grupos de fusión recomendados:

| Grupo | Documentos | Decisión propuesta |
|---|---|---|
| Estado vivo | `CURRENT-STATUS.md`, `HANDOFF.md`, `VERIFICATION.md`, `NEXT-TASK.md`, `PLAN-STATUS.md` | Índices actuales separados de la cronología ya extraída a `07-evidence/releases/` |
| Coordinación | `AGENTS.md`, `AGENT-OPERATING-MODEL.md`, `DEFINITION-OF-DONE.md`, instrucciones `.github` | `AGENTS.md` como entrada breve; contrato detallado único y adaptadores por herramienta |
| Inteligencia documental | `archive/tasks/ASTRA-006.md`, `archive/tasks/ASTRA-007.md`, `archive/tasks/ASTRA-007-REVIEW.md`, `CORPUS-ANALYSIS.md`, `DOCUMENT-AI-REVIEW-PLAN.md` | Arquitectura vigente separada de entregas históricas y evidencia de corpus |
| Onboarding | README raíz y README de API/web | Overview raíz; detalles de ejecución permanecen por aplicación |

## Implementado — no documentado o documentado sólo parcialmente

1. RESUELTO EN ESTA BASE: las 21 entidades Prisma y sus relaciones se consolidaron en `docs/01-architecture/domain-model.md`.
2. RESUELTO EN ESTA BASE: las transiciones de `WorkOrder`, tareas, checkpoints, hallazgos y candidatos se documentaron en `docs/01-architecture/state-machines.md`.
3. RESUELTO EN ESTA BASE: triggers, constraints y reglas de servicio se consolidaron en `docs/01-architecture/invariants.md`.
4. `DeferredLink`, `Idempotency`, `Session`, `DocumentAnalysisRun` y `DocumentFindingReview` no tienen fichas de entidad completas.
5. La política de reintentos serializables, locks de orden/partes y consumo de reserva propia vive principalmente en `db.ts`, `maintenance.ts` y tests.
6. RESUELTO EN ESTA BASE: la matriz endpoint × rol × CSRF × idempotencia está en `docs/08-reference/permissions-matrix.md`; la paridad método+ruta OpenAPI tiene prueba automática.
7. PARCIALMENTE RESUELTO: `docs/03-interfaces/frontend-architecture.md` consolida routing, sesión y reintentos; confirma como deuda el descarte general de respuestas tardías y los tests frontend.
8. La cola de fuentes deriva familia/prioridad mediante heurísticas que requieren ficha de algoritmo y límites.
9. La segmentación de tablas PDF, clasificación de referencias de equipo y evidencia `snippet/contextSnippet` está en código/tests y handoff, no en una especificación estable.
10. RESUELTO EN ESTA BASE: backup, restore, rollback, staging y verificación tienen runbooks separados derivados de los scripts actuales.
11. RESUELTO EN ESTA BASE: `docs/08-reference/environment-variables.md` inventaría variables, sensibilidad, defaults y consumidores.
12. PARCIALMENTE RESUELTO: `docs/00-overview/documentation-policy.md` define versionado, ownership, revisión y enlaces; falta incorporar metadata gradualmente y automatizar su control.
13. No hay `CODEOWNERS`; autor Git no define responsable vigente.
14. RESUELTO EN ESTA BASE: la matriz de capacidades y el índice de verificación enlazan evidencia por SHA/árbol.
15. Issues y PR actuales no pudieron auditarse desde este entorno; falta importar/exportar ese conocimiento para cerrar el universo.

## Faltantes prioritarios para la nueva base

- Overview y alcance vigente sin checkpoints históricos incrustados.
- Modelo de dominio y modelo de datos con relaciones y estados.
- Catálogo API derivado/verificado contra rutas reales.
- Matriz de permisos e invariantes transaccionales.
- Arquitectura frontend/backend y límites entre módulos.
- Runbooks de desarrollo, staging, backup, restore y rollback.
- Política del corpus externo: ingreso, hash, OCR, revisión, retención y referencia.
- Índice de ADR y registro de decisiones abiertas.
- Política editorial y ownership.
