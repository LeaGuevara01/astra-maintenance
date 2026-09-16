# ASTRA-007 — Revisión humana priorizada del corpus

> Estado: archivado el 2026-09-16. Origen: `docs/ASTRA-007-REVIEW.md`.
> Evidencia histórica acotada; no valida equivalencias OEM ni representa una revisión integral del corpus.
> Consultar [`../../02-domains/technical-information/corpus-policy.md`](../../02-domains/technical-information/corpus-policy.md) y [`../../07-evidence/verification-index.md`](../../07-evidence/verification-index.md).

Fecha: 2026-09-11. Esta revisión no modifica originales ni datos de staging.

## Resultado ejecutivo

No se autoriza todavía la aplicación transaccional de candidatos. El corpus contiene evidencia útil para proponer candidatos, pero la revisión no demuestra equivalencia técnica ni aplicabilidad completa a un activo/variante. Las cantidades de facturas siguen siendo historial documental y no stock.

## Fuentes revisadas

Se revisó manualmente el texto extraído y la metadata de tres referencias técnicas priorizadas. El índice las marca `TEXT_EXTRACTED`, con cobertura completa y sin páginas OCR pendientes.

| source_id | fuente | evidencia observada | conclusión |
|---|---|---|---|
| `SRC-f9c865ddd27b` | John Deere 6615, tapa TDF ST350944 | Catálogo de piezas para tractores 6415/6615 edición sudamericana; declara AL77322, L59900 y 30M5581. AL77322 figura como sustituido. | Candidatos documentales con aplicabilidad declarada; no equivalencia validada. La sustitución requiere revisión humana.
| `SRC-0acbc6f3c28f` | John Deere 6615, filtro de aire ST350811 | Catálogo de piezas para 6415/6615; declara AL156263, L158246 y L151661; L151661 figura como sustituido y aparece una longitud de 730 mm. | Candidatos con modelo y observación dimensional; la unidad, variante y sustitución deben confirmarse antes de importar.
| `SRC-ca131581c154` | John Deere 640FD, caja de mando de cuchillas ST830957 | Catálogo para plataforma 640FD, edición Argentina y rango de serie; declara DE21086, 19M7815, DE19311 y CE19565, entre otros. | Evidencia acotada a la plataforma/rango indicado; no debe extrapolarse a otro modelo o serie.

## Límites de la revisión

- La cola contiene 1.080 fuentes únicas: esta es una revisión priorizada de tres fuentes, no una aprobación integral del corpus.
- No se ejecutó OCR ni se convirtió extracción en validación técnica.
- La revisión visual de los PDF originales quedó pendiente: `pdftoppm` no está instalado, PyMuPDF no está disponible en el runtime local y no se pudo abrir un PDF local en navegador desde las superficies disponibles.
- Los P/N anteriores se conservan como afirmaciones de la fuente, no como valores OEM validados de ASTRA; cualquier candidato debe mantener `A_CONFIRMAR`, procedencia y localizador.

## Decisión sobre aplicación transaccional

Recomendación: **NO AUTORIZAR todavía**.

Condiciones mínimas para autorizar en una etapa posterior:

1. Completar revisión visual/OCR de las fuentes que entren al lote.
2. Confirmar modelo, variante, rango de serie, unidad y sustituciones por fuente.
3. Revisar el informe `dry-run` y resolver conflictos por un responsable técnico.
4. Aplicar únicamente en una migración/API transaccional, idempotente y con procedencia obligatoria; nunca importar cantidades históricas como stock.
