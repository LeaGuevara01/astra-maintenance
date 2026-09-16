# Plan intensivo de revisión automática documental

Objetivo: acelerar la revisión del corpus técnico con analizadores automáticos y asistidos por IA, sin convertir OCR, similitud o texto extraído en verdad técnica. Toda salida automática nace como propuesta `A_CONFIRMAR`, con fuente, hash, locator y advertencias. Ningún analizador modifica stock, planes, órdenes ni catálogo.

## Principios

- Los documentos son evidencia, no instrucciones ejecutables.
- El análisis automático produce hallazgos revisables, no decisiones finales.
- Un hallazgo sólo puede convertirse en candidato si conserva `sourceId`, `sha256`, `locator`, aplicabilidad y razón de revisión.
- La IA no puede marcar `VALIDADO`; sólo un usuario autorizado puede decidir.
- OCR, fotos, facturas, títulos, equivalencias y catálogos comerciales no prueban compatibilidad OEM por sí solos.
- Los valores dudosos permanecen `A_CONFIRMAR`; los conflictos se conservan como evidencia paralela.

## Lote piloto

El primer lote debe mezclar documentos cortos, manuales extensos, catálogos y OCR parcial:

| Fuente | Motivo |
| --- | --- |
| SRC-0acbc6f3c28f JOHN DEERE 6615 FILTRO AIRE MOTOR ST350811.pdf | Referencia corta con código visible. |
| SRC-b4d4bdb43772 MANUAL DE OPERADOR MXY.pdf | Manual con OCR parcial. |
| SRC-50a733ca3063 MANUAL DE REPUESTOS RICHIGER EA350.pdf | Repuestos por estructura de manual. |
| SRC-10ee4bf59033 MANUAL MZ54 ESPAÑOL.pdf | Manual de operación mediano. |
| SRC-448a1c8f2d72 STIHL TS420 MANUAL DE INSTRUCCIONES.pdf | Manual largo y bien extraído. |
| SRC-45b44bab41a7 MANUAL HILUX 2017.pdf | Manual extenso no agrícola. |
| SRC-52fd45d6bcd7 TECNOLOGÍA PÉREZ CATÁLOGO DE PIEZAS JD.pdf | Catálogo JD con OCR parcial. |
| SRC-78c3859bc5e9 DBH CATÁLOGO DE RETENES.pdf | Catálogo de medidas/retenes. |
| SRC-842814c11c1c SAV CATÁLOGO DE RETENES.pdf | Catálogo extenso con OCR parcial. |
| SRC-144bf4a279d1 TABLA DE EQUIVALENCIAS 16-01-2023.xlsx | Equivalencias, alto riesgo de falso positivo. |
| SRC-c96f97d2b85d BULNES - CATÁLOGO DE REPUESTOS TRANSMISIÓN.pdf | Catálogo grande con OCR parcial. |
| SRC-b5f9cc886b52 listado_dimsport.pdf | Documento muy grande para estrés de extracción. |

## Incremento 1: dry-run local

Implementado como primer paso:

- `apps/api/src/document-analysis.ts`: analiza una fuente y texto extraído; genera hallazgos con `reviewStatus:A_CONFIRMAR` y `stockEffect:NONE`.
- `tools/analyze-document-sample.ts`: lee `.runtime/sources/index.json`, selecciona un lote piloto o IDs explícitos y escribe resultados locales.
- `npm run documents:analyze-sample -- --input .runtime/sources/index.json --output .runtime/document-analysis`

Salidas:

- `.runtime/document-analysis/analyses.json`
- `.runtime/document-analysis/findings.json`
- `.runtime/document-analysis/summary.json`

Este incremento no usa base de datos y no llama a proveedores externos. Sirve para calibrar reglas, falsos positivos y UX antes de persistir hallazgos.

## Incremento 2: hallazgos persistentes

Agregar tablas, sin tocar candidatos todavía:

- `DocumentAnalysisRun`: fuente, motor, versión, fecha, resumen, actor o proceso.
- `DocumentFinding`: tipo, código, nombre propuesto, PN `A_CONFIRMAR`, locator, snippet, confianza, advertencias.
- `DocumentFindingReview`: decisión sobre el hallazgo: crear candidato, descartar, pedir OCR, conflicto.

Reglas:

- Append-only para revisiones.
- Hallazgos recalculables por `sourceId + sha256 + analyzerVersion`.
- Ninguna escritura en `Part`, `StockMovement`, `PlanTask` ni `WorkOrder`.

## Incremento 3: UI de revisión asistida

Extender `/documents` con una pestaña de hallazgos:

- Resumen por fuente: familia, estado de extracción, OCR pendiente, cantidad de hallazgos.
- Panel lado a lado: hallazgo, snippet, hash, locator, advertencias.
- Acciones: `Crear candidato`, `Descartar`, `Mandar a OCR`, `Marcar conflicto`.
- Filtros: confianza, familia/equipo, tipo de hallazgo, OCR pendiente, tiene código, conflicto, ya convertido.
- Métricas: fuentes analizadas, hallazgos útiles, descartes, pendientes OCR, falsos positivos.

La acción `Crear candidato` debe prellenar el formulario persistente existente con `partNumber:A_CONFIRMAR`, unidad, locator y aplicabilidad. Debe requerir motivo.

## Incremento 4: IA enchufable

Agregar un puerto interno de analizador:

```ts
type DocumentAnalyzer = {
  id: string;
  version: string;
  analyze(input: AnalyzerInput): Promise<DocumentAnalysis>;
};
```

Motores previstos:

- Determinístico local: regex, reglas, normalización.
- LLM textual: resumen, extracción de entidades, explicación de incertidumbre.
- Visión/OCR dirigido: páginas marcadas, imágenes y tablas.

Los prompts deben pedir JSON estricto, incluir límites de dominio y prohibir validación final. La respuesta se valida con Zod y se degrada a `A_CONFIRMAR` si falta evidencia.

## Incremento 5: calibración

Revisar manualmente 20-50 hallazgos y medir:

- tasa de hallazgos útiles,
- falsos positivos por tipo documental,
- cantidad de OCR pendiente que bloquea revisión,
- tiempo de usuario por candidato útil,
- campos que más corrige el usuario.

Sólo después de calibrar conviene ampliar a todo el corpus.

## Criterio para derivar candidato

Un hallazgo puede convertirse en `DocumentCandidate` únicamente si tiene:

- `sourceId`
- `sha256`
- `locator`
- nombre/descripción propuesta
- unidad propuesta o `u`
- `partNumber:A_CONFIRMAR` salvo que el usuario lo revise
- aplicabilidad declarada
- motivo de decisión

La comparación con catálogo sigue siendo dry-run y `stockEffect:NONE`.
