# Próximo trabajo

Prioridad inmediata: calibrar `documents:analyze-sample` sobre el lote piloto documentado en `docs/DOCUMENT-AI-REVIEW-PLAN.md`, revisar `findings.json` y separar falsos positivos por tipo de documento. Si la salida es útil, implementar tablas `DocumentAnalysisRun`, `DocumentFinding` y `DocumentFindingReview`, más una pestaña de hallazgos asistidos en `/documents`. Mantener la conversión a `DocumentCandidate` como acción explícita con motivo y `A_CONFIRMAR`.

Continuar según AUTONOMOUS-DEVELOPMENT.md. Historial de decisiones paginado y responsable por nombre actual implementados; actorId y auditoría conservados. La concurrencia de dos revisores sobre la misma versión tiene prueba de regresión.

Siguiente incremento: completar OpenAPI del módulo documental (incluidos candidatos, páginas, historial, decisiones y dry-run) y realizar revisión dirigida de navegador para las dos paginaciones. Luego preparar lector de fuentes por ID con fixtures seguros antes de conectar originales.

Para aplicación real de catálogo sigue pendiente revisión técnica del lote. Corpus, stock y producción no reciben cambios automáticos. Consultar PLAN-STATUS para estado de las 84 tareas. Pruebas proporcionales al cambio, sin repetir recorridos completos de roles.

## Siguiente paso sugerido — revisión documental asistida

Persistir una muestra real en staging después de desplegar la migración: ejecutar el analizador con -- --persist usando analyzerVersion nueva, abrir /documents y revisar varios hallazgos A_CONFIRMAR. Registrar qué patrones generan falsos positivos, qué fuentes requieren OCR y cuáles merecen CREATE_CANDIDATE. La derivación a DocumentCandidate debe implementarse como acción explícita posterior que copie locator, sha256, sourceId, PN A_CONFIRMAR y aplicabilidad sin tocar stock.
