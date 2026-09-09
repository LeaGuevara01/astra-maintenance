# ASTRA-001: circuito preventivo
Objetivo: convertir un plan por activo en una OT ejecutable, consumir stock sin duplicados, cerrar con seguridad y obtener tarjetas consistentes.
Alcance: P01-P10 de PRODUCT.md, API-CONTRACT.md, infraestructura local, cinco skills genéricas y una skill de fuentes técnica.
Ownership: integrador raíz/scripts/docs/lock; backend apps/api+prisma; frontend apps/web.
Aceptación: escenarios funcionales del plan, concurrencia PostgreSQL, roles y CSRF, idempotencia, PDF visible, aislamiento de worktrees, respaldo/restauración y versión de staging.
Autonomía: hasta staging, commits y PR. main/producción pendientes de usuario.
Origen: solicitud explícita del usuario y ASTRA_Sistema_Integrador_Mantenimiento_v1.1-v1.3.md. Material de Imágenes/Descargas/Documentos se registra como evidencia, sin importarlo como reglas OEM verificadas.
