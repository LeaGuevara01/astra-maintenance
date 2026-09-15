# Próximas tareas de ASTRA Maintenance

Actualizado: 2026-09-15. Base funcional integrada: 3b2223d. Estado e identidad en HANDOFF.md; evidencia en VERIFICATION.md.

## Prioridad 1 — Corregir la comparación y cobertura documental

Antes de habilitar aplicación al catálogo:

1. Respetar confidence=RECHAZADO: un candidato rechazado no debe producir ADD/UPDATE.
2. Preservar un número de pieza conocido cuando el candidato carece de ese dato; no proponer reemplazarlo por A_CONFIRMAR.
3. Detectar candidatos duplicados o incompatibles para el mismo código dentro de un lote.
4. Corregir cobertura OCR: ausencia de pagesNeedingOCR no demuestra que todas las páginas tengan texto; representar cobertura desconocida o pendiente de forma explícita.

Rutas: apps/api/src/candidate-import.ts, apps/api/src/document-intelligence.ts y sus pruebas. Aceptación: pruebas dirigidas de estos casos, sin stockEffect distinto de NONE ni aplicación persistente. No requiere repetir el recorrido completo de roles.

## Prioridad 2 — Revisión documental con evidencia

- Continuar la revisión humana descrita en ASTRA-007-REVIEW.md; completar evidencia visual/OCR, variante y sustituciones cuando corresponda.
- Mantener la pantalla sintética identificada como tal y sus decisiones sin persistencia hasta definir el contrato de API/aplicación.
- Diseñar aplicación transaccional e idempotente solo después de resolver los defectos y aprobar las fuentes. No cargar cantidades históricas como stock.

## Posterior, según necesidad operativa

- Programar y ensayar backup diario si el entorno quedará persistente.
- Validar LAN/TLS si se habilita acceso fuera de loopback.
- Revisar CI/controles de GitHub y empaquetado del plugin de ingeniería cuando aporten valor al siguiente trabajo.
- Ampliar planes por unidad/configuración y recursos conforme a contratos y evidencia técnica; no importar indiscriminadamente otras ramas/worktrees.

## Regla de continuidad

Trabajar desde main actualizado. Reutilizar resultados existentes vinculados a su SHA. Ejecutar verificaciones proporcionales al cambio; no convertir recorridos de roles o PDF ya cubiertos en un requisito recurrente. Actualizar estos tres documentos sin acumular secciones contradictorias de estado vigente.
