# Avance autónomo de desarrollo

Autorización del usuario: 2026-09-15, “Autonomizar avance de desarrollo”. Se aplica al desarrollo de ASTRA dentro de este workspace, conservando las autorizaciones de integración y staging de la sesión.

## Ciclo de trabajo

1. Leer HANDOFF, NEXT-TASK y PLAN-STATUS; contrastar Git y no repetir trabajo integrado.
2. Elegir el siguiente incremento pequeño que elimine una limitación real y no requiera una decisión de negocio pendiente.
3. Implementar contratos, API/UI y migración necesaria dentro de ese incremento.
4. Probar el comportamiento afectado; reutilizar evidencia previa. No repetir circuitos completos de roles como trámite.
5. Revisar diff, registrar resultados y límites, integrar/publicar y desplegar staging sintético cuando corresponda.
6. Actualizar estado y dejar una siguiente acción concreta. Si un punto requiere al usuario, avanzar mientras tanto en otro trabajo independiente autorizado.

## Orden de avance

- Paginación, historial, OpenAPI y concurrencia documental: integrados en `a0c9178`; no repetir.
- Ejecutar [ASTRA-010](05-planning/ASTRA-010-secure-source-reader.md) por gates: contrato/resolver, endpoint, UI y staging sintético. Diseñar primero contra fixtures aislados; no publicar carpetas personales.
- Preparar lote técnico pequeño con fuente/localizador/aplicabilidad para decisión humana.
- Diseñar aplicación al catálogo sin efecto de stock después de definir identidad de lote, vigencia de revisión y autorización del lote.

## Límites de autonomía

No inventar valores OEM, aprobar equivalencias o fuentes técnicas como si fueran decisiones humanas; no convertir facturas en existencias. No desplegar producción, enviar comunicaciones a terceros, borrar datos reales ni ampliar acceso público sin autorización específica. P06 e historia cerrada se conservan.

Esta guía permite elegir y completar trabajo durante sesiones activas. No instala un servicio programado ni ejecuta tareas después de terminar la sesión. El estado recuperable está en Git; no depende de recordar el chat.
