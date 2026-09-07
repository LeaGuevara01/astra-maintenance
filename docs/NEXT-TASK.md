# ASTRA-005 — E2E de tres roles y revisión visual PDF

Estado: listo para ejecución sobre staging local. Responsable: integrador; apoyo acotado permitido.

## Objetivo
Validar el circuito visible completo del piloto sobre staging sintético: login por rol, navegación crítica, generación/ejecución/cierre de OT y revisión visual real de tarjetas A6/A4.

## Alcance
Staging local en `http://localhost:4380`, navegador real, verificación de rutas clave en UI/API, exportación de tarjeta HTML/PDF desde una OT cerrada y actualización de HANDOFF/VERIFICATION con evidencia. Sin merge de main ni producción.

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

## Aceptación
- ADMIN inicia sesión, navega, genera OT y verifica datos clave de staging.
- TECHNICIAN reserva/consume materiales, completa tareas/checkpoints y deja una OT cerrada.
- VIEWER entra en modo lectura y no puede ejecutar escrituras administrativas u operativas.
- `/api/v1/version` y la UI revisada corresponden al mismo staging local.
- Se exportan y revisan al menos una tarjeta A6 y una A4 desde staging; la A4 conserva cuatro tarjetas legibles.
- La evidencia final registra URL, SHA, OT utilizada, roles ensayados, resultado y defectos abiertos si existieran.

## Evidencia de salida
Commit o SHA inspeccionado, URL de staging, ID de OT cerrada usada para exportación, notas del recorrido por rol, resultado de la revisión A6/A4 y actualización de HANDOFF/VERIFICATION.

## Tareas siguientes
ASTRA-006: normalizar inventario local y estado de extracción parcial, OCR y cola de revisión técnica.
ASTRA-007: contratos de procedencia e importación dry-run de candidatos; no cargar cantidades históricas como stock.
ASTRA-008: validar cinco skills en una sesión nueva y extraer plugin astra-engineering después de demostrar el piloto.
