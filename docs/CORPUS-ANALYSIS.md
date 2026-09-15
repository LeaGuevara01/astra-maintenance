# Análisis del corpus técnico — 2026-09-15

Método: lectura automatizada de todos los textos asociados al índice, búsqueda temática y SHA-256 de originales accesibles. No es lectura semántica humana de todos los manuales ni OCR nuevo. No se modifican originales ni se cargan candidatos reales.

## Cobertura comprobada

- references: 1110
- textRead: 738
- textMissing: 372
- characters: 15595372
- originalMissing: 0
- originalChanged: 2

## Temas presentes en texto

Un documento puede aparecer en varios grupos. Coincidencia léxica, no clasificación técnica validada.

- comercial: 386 fuentes
- tractores: 122 fuentes
- filtros: 131 fuentes
- hidraulica: 76 fuentes
- cosecha: 59 fuentes
- lubricacion: 166 fuentes
- mantenimiento: 75 fuentes
- electrico: 106 fuentes
- herramientas: 58 fuentes

## Interpretación

El corpus mezcla evidencia técnica, material de taller e historial comercial. Los textos sirven para localizar fuentes por equipo/componente, pero no demuestran aplicabilidad OEM ni stock. Los cambios de hash exigen nueva revisión; ausencia de texto exige lectura visual/OCR. Revisar primero fuentes de la unidad elegida y preservar página, serie, variante y sustituciones. ECT-HER requiere separar taxonomía interna de conformidad normativa. Facturas se analizan como historial, con moneda/fecha/cantidad literales.

El detalle por referencia queda en .runtime/corpus-analysis/analysis.json (local, fuera de Git). Las salidas anteriores de normalización no se sobrescribieron. Próximo paso: elegir un lote acotado, revisar originales y registrar sus candidatos mediante el flujo persistente; no importar todo automáticamente.

Los dos originales cambiados son SRC-9a301d3bad6a (SPARE_P0_USER_STORIES.md) y SRC-bdcea086b8e1 (SPARE_JIRA_BOARD.md): planificación de SPARE. No se detectaron originales faltantes. Sus textos asociados no deben considerarse la revisión actual hasta reextraerlos.

## Lectura dirigida de contenido

Además del barrido completo de textos, se inspeccionaron fragmentos de mantenimiento de cinco fuentes: Husqvarna MZ54 (SRC-75ae3459d44f), Richiger EA910 (SRC-794401ee5f96), Pierobon Turboplanter (SRC-40d869296d33), Stihl TS420 (SRC-448a1c8f2d72) y ECT-HER (SRC-e5842fb21733).

- Husqvarna y Richiger contienen esquemas de lubricación; requieren preservar tablas, puntos y condiciones de uso, no reducirlos a un único intervalo.
- Pierobon separa mantenimiento seguro, lubricación y calibración del sistema de dosificación: calibración de trabajo y mantenimiento deben distinguirse.
- Stihl contiene mantenimiento diario y por horas; la extracción lineal de tablas puede perder la relación tarea/frecuencia, por lo que no se importaron intervalos.
- ECT-HER distingue identificación, inspección, inventario y calibración; declara que su taxonomía adaptada no acredita conformidad normativa.

Conclusión: preparar candidatos por tarea, unidad y localizador, conservando las tablas originales para revisión. No se validaron valores OEM ni se aprobó todo el corpus.
