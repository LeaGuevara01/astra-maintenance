> Estado vigente: revisión documental persistente implementada el 2026-09-15. Consultar docs/HANDOFF.md, docs/VERIFICATION.md y docs/PLAN-STATUS.md. Los checkpoints que siguen son históricos y no ordenan repetir trabajo.

# ASTRA-006 — Inteligencia documental conservadora

Implementación local sobre el inventario existente. No agrega tablas ni rutas de producción y no copia originales al repositorio.

## Contrato implementado

- `apps/api/src/document-intelligence.ts` normaliza estados de extracción, cobertura por páginas, duplicados por SHA-256 y revisiones por ruta/huella.
- Una fuente con páginas sin texto queda `PARTIAL` aunque otras páginas tengan texto; una fuente sin texto queda `OCR_REQUIRED`.
- `tools/normalize-document-index.ts` genera, bajo `.runtime` ignorado, `normalized-index.json`, `ocr-queue.json`, `review-queue.json` y `summary.json`.
- Cada elemento de revisión conserva candidato, evidencia, localizador, advertencias y decisión `A_CONFIRMAR`. OCR o similitud nunca produce `VALIDADO`.
- Las rutas declaradas fuera de `sourceRoot` se marcan como error y no entran en la cola de revisión.

## Uso local

```powershell
npm run documents:normalize -- --input .runtime/sources/index.json --output .runtime/sources/normalized
```

La ejecución sobre el inventario local produjo 1.110 fuentes, 1.080 huellas únicas, 142 pendientes OCR (104 completas y 38 parciales) y 1.080 fuentes únicas en revisión. El resultado es evidencia de extracción, no validación técnica.

## Límites

La ejecución OCR concreta y la decisión humana permanecen fuera de este slice. ASTRA-007 deberá definir procedencia e importación dry-run; cantidades históricas y candidatos no se convierten en stock.
