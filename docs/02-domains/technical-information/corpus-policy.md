# Política del corpus técnico externo

Estado: vigente. Esta política gobierna fuentes externas; no las convierte en documentación del sistema.

## Separación

La documentación del sistema vive en Git bajo `docs/`, README, contratos, configuración y código relacionado. El corpus contiene manuales, catálogos, fichas, normas, imágenes, listas, facturas y referencias de terceros.

Los originales permanecen fuera de Git. ASTRA puede conservar:

- `sourceId` estable;
- SHA-256 de una revisión;
- título sanitizado;
- tipo provisional;
- estado de extracción;
- páginas y cobertura OCR;
- locator y fragmentos mínimos para revisión;
- decisiones humanas y auditoría.

No debe conservar rutas locales en contratos públicos ni copiar binarios al repositorio.

## Flujo

```text
original externo
  → inventario y SHA-256
  → revisión documental inmutable
  → extracción/OCR con cobertura explícita
  → hallazgo A_CONFIRMAR
  → revisión humana append-only
  → candidato explícito
  → dry-run contra catálogo
  → aplicación futura separada y autorizada
```

La implementación actual termina en dry-run. No existe aplicación transaccional al catálogo.

## Clasificación

| Clase | Uso permitido | Advertencia |
|---|---|---|
| `MANUAL_OR_CATALOG` | Evidencia técnica localizable | Requiere unidad, variante y locator |
| `TECHNICAL_REFERENCE` | Búsqueda y contraste | No implica equivalencia OEM |
| `COMMERCIAL_HISTORY` | Fecha, proveedor, precio/cantidad históricos literales | No es stock ni valor vigente |
| `INTERNAL_WORKFLOW` | Debe reclasificarse fuera del corpus o justificarse | Puede ser documentación del sistema |

## Estados de extracción

- `TEXT_EXTRACTED`: texto disponible; no significa comprendido ni validado.
- `OCR_REQUIRED`: falta OCR antes de concluir.
- `VISUAL_REVIEW_REQUIRED`: tablas, imágenes o estructura requieren revisión visual.
- `PARTIAL`: cobertura incompleta.
- `DUPLICATE`: mismo contenido por hash; no borrar automáticamente.
- `A_CONFIRMAR`: metadata insuficiente.

Los conteos deben citar fecha y taxonomía. `OCR_REQUIRED` solo y “OCR pendiente incluyendo PARTIAL” son métricas diferentes.

## Reglas técnicas

- Un nombre de archivo no demuestra aplicabilidad.
- Coincidencia léxica no demuestra equivalencia.
- PN desconocido permanece `A_CONFIRMAR`.
- Una revisión nueva por hash no hereda aprobación.
- Preservar página/hoja, modelo, serie, variante, condiciones y advertencias.
- Las tablas se revisan como estructura; el OCR lineal puede mezclar filas/columnas.
- Cantidades históricas no modifican inventario.
- `CREATE_CANDIDATE` no significa `VALIDADO` ni aplica catálogo.
- Toda conclusión técnica requiere procedencia y confianza visibles.

## Integridad y privacidad

- Conservar originales y comprobar SHA-256 antes de importar metadata.
- Deduplicar por hash sin destruir versiones ni nombres necesarios para trazabilidad.
- Mantener manifiestos detallados en `.runtime` o almacenamiento autorizado.
- No registrar secretos, rutas privadas innecesarias ni texto completo cuando basta locator/snippet.
- Backups de base no reemplazan backups de originales.

## Estado observado

El índice local registra 1.110 fuentes seleccionadas y 1.080 hashes únicos. Las cifras son inventario, no aprobación técnica. Diez entradas `INTERNAL_WORKFLOW` requieren reclasificación; 394 `COMMERCIAL_HISTORY` deben mantenerse separadas de afirmaciones OEM y contables actuales.
