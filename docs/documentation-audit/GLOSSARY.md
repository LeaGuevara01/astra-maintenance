# Glosario canónico inicial

Este glosario mapea lenguaje de producto, UI y código. No autoriza renombrar código ni valida hechos técnicos externos.

| Término canónico | Sinónimos/históricos | Definición | Entidad/código | Estado |
|---|---|---|---|---|
| Activo | equipo, máquina | Bien mantenible identificado por código, familia y lectura | `Asset` | Vigente |
| Lectura | lectura de horómetro, meter reading | Valor monotónico registrado para un activo | `Reading`, `meter` | Vigente; unidad aún no modelada |
| Plan de mantenimiento | plan preventivo | Revisión versionada de tareas aplicables | `Plan`, `PlanTask` | Vigente |
| Orden de trabajo | OT, work order, orden preventiva | Registro operativo de una intervención generada para un activo y objetivo | `WorkOrder` | Vigente |
| Intervención | ejecución, servicio | Proceso operativo representado por una OT; no es sinónimo seguro de plan | `WorkOrder` según contexto | Mapeo requerido |
| Tarea de orden | tarea, order task | Snapshot ejecutable de una tarea del plan | `OrderTask` | Vigente |
| Tarea diferida | pendiente trasladado | Tarea no crítica postergada con motivo, fecha y responsable | `OrderTask`, `DeferredLink` | Vigente |
| Material de orden | recurso, repuesto requerido | Demanda y consumo de una parte dentro de una OT | `OrderMaterial` | Vigente; “recurso” es más amplio |
| Parte | repuesto, consumible, artículo | Ítem del catálogo de inventario | `Part` | Vigente |
| Existencia | on hand, stock físico | Cantidad física registrada | `Part.onHand` | Vigente |
| Reservado | reserved | Cantidad asignada a OTs y no disponible para otras | `Part.reserved` | Vigente |
| Disponible | available | Existencia menos reservado | vista derivada | Vigente |
| Movimiento de stock | movimiento de inventario | Evento append-only de ingreso o consumo | `StockMovement` | Vigente |
| Checkpoint | control, control de liberación | Verificación de una OT; un crítico pendiente/fallido bloquea todo cierre | `Checkpoint` | Vigente |
| Resultado de cierre | estado operativo | `OPERATIVE`, `OPERATIVE_WITH_NOTES` o `NOT_OPERATIVE` tras cumplir gates | `WorkOrder.result` | Vigente |
| A_CONFIRMAR | a confirmar, unknown | Valor desconocido que requiere evidencia/revisión humana | múltiples campos | Vigente y obligatorio |
| Fuente documental | fuente, source | Identidad lógica de un documento externo | `sourceId` | Vigente |
| Revisión documental | versión de fuente | Contenido inmutable identificado por fuente y SHA-256 | `DocumentRevision` | Vigente |
| Hallazgo documental | finding, hallazgo asistido | Propuesta extraída por analizador; no es verdad técnica ni catálogo | `DocumentFinding` | Vigente |
| Candidato documental | candidato de catálogo | Propuesta revisable derivada de una revisión/hallazgo | `DocumentCandidate` | Vigente |
| Revisión humana | decisión | Evento append-only con decisión y motivo | `DocumentReview`, `DocumentFindingReview` | Vigente |
| Corpus técnico externo | biblioteca técnica, fuentes reales | Documentos externos usados como evidencia; separado de docs del sistema | `.runtime/sources`, `DocumentRevision` | Vigente; no versionar originales |
| Procedencia | provenance, evidencia | Fuente, hash, locator y contexto que permiten rastrear una afirmación | varios contratos | Vigente |
| Locator | ubicación, página/hoja | Referencia dentro de una revisión documental | `locator` | Vigente |
| Dry-run | comparación, simulación | Evaluación sin aplicación a catálogo ni stock | candidate import | Vigente |
| Staging sintético | staging local | Entorno no productivo con identidad SHA y datos sintéticos | scripts/runtime | Vigente |
| SHA verificado | commit probado | Commit exacto sobre el que corrieron checks registrados | Git/VERIFICATION | Vigente |
| SHA desplegado | staging SHA | Commit reportado por health/version/footer del runtime | `/api/v1/version` | Vigente |
