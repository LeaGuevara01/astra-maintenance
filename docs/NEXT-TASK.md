# Próximas tareas de ASTRA Maintenance

Actualizado: 2026-09-15. Base funcional: main, con correcciones documentales del 15/09. Estado e identidad en HANDOFF.md; evidencia en VERIFICATION.md.

## Correcciones completadas — 2026-09-15

Resueltos rechazo humano, conservación de número de pieza, colisiones de código en lote y cobertura OCR desconocida. Ver VERIFICATION.md: 20 pruebas dirigidas y typecheck API/web aprobados. La comparación sigue sin aplicar cambios ni afectar stock.

## Prioridad 1 — Revisión documental con evidencia

- Continuar la revisión humana descrita en ASTRA-007-REVIEW.md; completar evidencia visual/OCR, variante y sustituciones cuando corresponda.
- Mantener la pantalla sintética identificada como tal y sus decisiones sin persistencia hasta definir el contrato de API/aplicación.
- Diseñar aplicación transaccional e idempotente solo después de aprobar las fuentes. No cargar cantidades históricas como stock.

## Posterior, según necesidad operativa

- Programar y ensayar backup diario si el entorno quedará persistente.
- Validar LAN/TLS si se habilita acceso fuera de loopback.
- Revisar CI/controles de GitHub y empaquetado del plugin de ingeniería cuando aporten valor al siguiente trabajo.
- Ampliar planes por unidad/configuración y recursos conforme a contratos y evidencia técnica; no importar indiscriminadamente otras ramas/worktrees.

## Regla de continuidad

Trabajar desde main actualizado. Reutilizar resultados existentes vinculados a su SHA. Ejecutar verificaciones proporcionales al cambio; no convertir recorridos de roles o PDF ya cubiertos en un requisito recurrente. Actualizar estos tres documentos sin acumular secciones contradictorias de estado vigente.
