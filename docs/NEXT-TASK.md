# ASTRA-006 — Inteligencia documental conservadora

Estado: ASTRA-005 cerrado en staging; ASTRA-006 implementado y desplegado en staging sintético como slice local determinista en `32a5972` de la rama `feat/ASTRA-006-document-intelligence`.

## Objetivo
Normalizar el inventario documental local y registrar extracción parcial, OCR y cola de revisión técnica sin convertir documentos o similitud en equivalencia técnica.

## Alcance
Trabajar primero con índice local y contratos deterministas. Conservar fuente, hash, revisión, estado de extracción, cobertura parcial, advertencias y `A_CONFIRMAR`. Sin cargar cantidades históricas como stock, sin datos reales en staging y sin merge de main ni producción.

## Fuentes y restricciones
Leer AGENTS, PRODUCT, API-CONTRACT, HANDOFF, OPERATIONS y VERIFICATION. Usar exclusivamente staging sintético y credenciales del `.runtime/staging/config.json`. No imprimir secretos ni copiarlos al diff. No tocar datos reales ni SPARE. Si aparece un defecto funcional, corregirlo en el slice mínimo necesario y volver a validar.

## Preparación ya disponible
- Staging local activo en `http://localhost:4380` con commit `2ef666ae0721208501d5664a0ce5e8d7f37d7da0`.
- Verify, backup/restore aislado, rollback con preservación de datos y dos worktrees completos en paralelo ya quedaron ensayados.
- `tools/verify-staging.mjs` existe como helper local no versionado; usarlo sólo si aporta evidencia y sin incorporarlo por defecto al commit.

## Riesgos a resolver
1. Comprobar que ADMIN, TECHNICIAN y VIEWER puedan completar su recorrido previsto sin errores de sesión, CSRF, permisos o estado inconsistente.
2. Confirmar que el circuito visible `activo → plan → OT → reserva/consumo → checkpoints → cierre` se corresponde con la API y deja una OT cerrada utilizable para exportación.
3. Revisar que las tarjetas A6 y A4 de staging no recorten texto, mantengan legibilidad y sigan exponiendo QR/estado correcto.
4. Si aparece una desviación entre UI, API y documento exportado, registrarla con evidencia concreta antes de ampliar dominio.

## Aceptación de ASTRA-005 completada
- ADMIN, TECHNICIAN y VIEWER fueron probados en navegador sobre `b21b347`.
- `OT-000006` quedó cerrada como `OPERATIVE` con tareas, material, controles y auditoría visibles.
- A6 y A4 fueron descargados y revisados visualmente; A4 conserva cuatro tarjetas legibles.

## Aceptación de ASTRA-006
- Índice local reproducible y seguro.
- Extracción parcial y OCR expresan estado, cobertura y advertencias.
- Cola de revisión técnica separa candidato, evidencia y decisión humana.

## Evidencia de salida
Commit o SHA inspeccionado, URL de staging, ID de OT cerrada usada para exportación, notas del recorrido por rol, resultado de la revisión A6/A4 y actualización de HANDOFF/VERIFICATION. Para ASTRA-006 se agrega `docs/ASTRA-006.md` y la evidencia local se genera sólo debajo de `.runtime`.

## Tareas siguientes
ASTRA-007: revisar el dry-run de candidatos y sus fuentes con decisión humana; no aplicar ni cargar cantidades históricas como stock hasta cerrar esa revisión.
ASTRA-008: definir, sólo después de la revisión, la aplicación transaccional/idempotente y la API versionada; mantener `A_CONFIRMAR`.
ASTRA-009: validar cinco skills en una sesión nueva y extraer plugin astra-engineering después de demostrar el piloto.
