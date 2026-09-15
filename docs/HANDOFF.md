# Handoff de ASTRA Maintenance

Actualizado: 2026-09-15. Este documento describe el estado consolidado; VERIFICATION.md contiene la evidencia y NEXT-TASK.md las prioridades. Las versiones anteriores se conservan en Git, no son el estado vigente.

## Versión unificada

- Línea de trabajo: main. La consolidación incorpora por avance directo los siete commits de feat/ASTRA-006-document-intelligence sobre el main local, más esta actualización documental.
- Base funcional integrada: 3b2223de05f4a514ca4c664cefa81019373c3974. La consolidación inicial fue documental; main incorpora ahora las cuatro correcciones de comparación/cobertura del 15/09, verificadas con pruebas dirigidas.
- Checkout del IDE: C:/Users/devle/Documents/Codex/2026-09-06/i/outputs/astra-maintenance.
- Remoto: https://github.com/LeaGuevara01/astra-maintenance. El SHA de la consolidación se consulta con git rev-parse HEAD; no se inserta un SHA autorreferencial en este archivo.
- Staging local comprobado el 2026-09-15: http://localhost:4380, ready y versión 3b2223de05f4a514ca4c664cefa81019373c3974. Este despliegue es anterior a las cuatro correcciones del 15/09; no se redesplegó en esta tarea.
- Otros worktrees y ramas históricas se conservan; no son la línea vigente ni deben integrarse a ciegas.

## Funcionalidad integrada

- Piloto preventivo: activos, planes, OT, reserva/consumo, checkpoints críticos, cierre, historial, roles y documentos A6/A4.
- ASTRA-006: normalización local determinista, procedencia, cobertura y colas de OCR/revisión.
- ASTRA-007: comparación de candidatos sin aplicación y pantalla de revisión documental sintética. Las decisiones de la pantalla no persisten.
- Corrección operativa de overrides de Compose incluida.

## Límites y decisiones

- A_CONFIRMAR y validación humana siguen vigentes. Cantidades históricas no son stock y una fuente no establece equivalencia OEM.
- Aplicación transaccional de candidatos aún no habilitada. Los cuatro defectos documentales están corregidos; siguiente trabajo en NEXT-TASK.md.
- El usuario autorizó unificar y mergear local/remoto en esta sesión. Producción no forma parte de esta consolidación.
- Reutilizar evidencia válida. No repetir recorridos completos de roles ni revisiones PDF por actualizaciones documentales; hacer comprobaciones dirigidas cuando cambie el comportamiento afectado o aparezca una regresión.
- No imprimir secretos de .runtime. Pruebas con reinicialización únicamente sobre astra_test o test_*.

## Continuar

Consultar AGENTS.md, PRODUCT.md y API-CONTRACT.md para contratos; VERIFICATION.md para evidencia y NEXT-TASK.md para el trabajo pendiente. Los planes externos y checkpoints antiguos son antecedentes, no instrucciones de reiniciar trabajo completado.
