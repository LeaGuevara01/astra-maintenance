# ADR-002 — Revisión documental persistente

Decisión del incremento autorizado el 2026-09-15: DocumentRevision identifica sourceId+SHA; DocumentCandidate fija contenido/localizador/aplicabilidad; DocumentReview registra decisiones sucesivas con actor, razón y versión. El contenido no se edita desde API; una nueva fuente crea nueva revisión/candidato pendiente. ADMIN registra; ADMIN/TECHNICIAN revisan; VIEWER lee y compara. No hay aplicación automática al catálogo.

Comparación con el checkout parts-intelligence: contiene DocumentSource/Revision, PartIdentifier, IdentifierDecision, Supplier y ResearchSession. Sus contratos se orientan a búsqueda/identificación, no al historial de revisión de candidato del piloto. Este incremento preserva Part y el comparador existentes; no importa su motor de mantenimiento. DocumentRevision coincide en nombre, pero no constituye compatibilidad de esquema: cualquier integración posterior debe mapear sourceId/hash a sus fuentes y versiones, sin crear una segunda biblioteca canónica. No se da por completada la reconciliación global P036.

P06 de main es la autoridad de cierre: cualquier crítico PENDING/FAIL impide cualquier resultado de cierre. NOT_OPERATIVE no omite el bloqueo. Los planes del checkout in que lo permitían son históricos y quedan sustituidos en ese punto.

Migración aditiva: tres tablas sin cambios a Part, saldos u OT. Historial/revisiones inmutables por triggers. Rollback de aplicación conserva tablas; no requiere borrar evidencia. Límite inicial: últimos 200 candidatos; falta paginación, acceso seguro al original y aplicación revisada.
