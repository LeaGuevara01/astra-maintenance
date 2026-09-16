# Paridad OpenAPI

Estado: reconciliado en `ASTRA-DOC-001` sobre la rama documental derivada de `c8e2efb`.

## Resultado

El documento OpenAPI cubre las 25 operaciones públicas/de mantenimiento definidas directamente en `app.ts` y las diez operaciones de `documentReviewRouter`: 35 de 35.

La auditoría inicial encontró estas diez ausencias, corregidas en `openapi.ts`:

| Método y ruta | Estado actual | Referencia narrativa |
|---|---|---|
| `GET /document-candidates` | Cubierto | `API-CONTRACT.md` |
| `GET /document-candidates/page` | Cubierto | Paginación documental |
| `GET /document-candidates/:id/reviews` | Cubierto | Historial paginado |
| `GET /document-candidates/sources/page` | Cubierto | Cola por fuente |
| `GET /document-candidates/findings/page` | Cubierto | Hallazgos asistidos |
| `POST /document-candidates` | Cubierto | Alta de candidato |
| `POST /document-candidates/:id/reviews` | Cubierto | Decisión de candidato |
| `POST /document-candidates/dry-run` | Cubierto | Comparación sin aplicación |
| `POST /document-candidates/findings/:id/reviews` | Cubierto | Decisión de hallazgo |
| `POST /document-candidates/findings/:id/candidate` | Cubierto | Derivación explícita |

Cobertura de operaciones: 35 de 35. `openapi-parity.test.ts` extrae método+ruta de `app.ts` y `document-review.ts`, normaliza parámetros y exige igualdad exacta con `openapi.paths`. También verifica que todos los `$ref` locales apunten a schemas existentes.

## Componentes incorporados

- `DocumentRevision` y metadata de cola.
- `DocumentCandidate`, última revisión e historial paginado.
- `DocumentReview` con `actorName` nullable.
- `DocumentAnalysisRun`, `DocumentFinding` y `DocumentFindingReview`.
- Envelopes `{items,nextCursor}`.
- Resultado dry-run con `apply:false`, razones, procedencia y `stockEffect:NONE`.
- Filtros y cursores documentales.
- Errores específicos `INVALID_CURSOR`, `REVIEW_STALE`, `FINDING_NOT_PART` y relacionados.

## Reglas de mantenimiento

1. Tratar `API-CONTRACT.md` y comportamiento probado como entrada; no inventar campos.
2. Mantener las 35 operaciones sincronizadas; una nueva ruta requiere actualizar OpenAPI en el mismo cambio.
3. Expresar sesión global, CSRF en POST y roles por operación.
4. Documentar `Idempotency-Key` en todas las mutaciones documentales excepto dry-run.
5. Marcar explícitamente que dry-run y derivación no escriben catálogo ni stock.
6. Conservar la prueba de paridad y referencias locales.
7. Pendiente adicional: validar el documento con un validador OpenAPI 3.1 independiente y agregar ejemplos de respuesta.

## Criterio de cierre

- 35/35 operaciones representadas: cumplido.
- Schemas documentales coinciden con respuestas reales y nulabilidad.
- Matriz de roles/CSRF/idempotencia coincide con `permissions-matrix.md`.
- Una prueba falla cuando aparece una ruta no documentada o una operación obsoleta: cumplido mediante análisis estático de los routers actuales.
