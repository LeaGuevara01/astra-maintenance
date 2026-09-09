# ADR-001: piloto modular y entrega local
Estado: aceptado por el usuario en el plan de implementación.

TypeScript integral con React/Vite, Express, Prisma 6.19.3 y PostgreSQL 17. Monolito modular; el motor no depende del renderer. Base reutilizable separada del producto. Cada dato técnico conserva procedencia, los snapshots de OT sobreviven a cambios de catálogo y el consumo se registra como movimiento.

Staging sintético se publica por HTTP exclusivamente en loopback para poder revisarlo sin instalar una CA global. LAN se habilita explícitamente con HTTPS, cookie Secure y CA local del proxy. Producción requiere aprobación humana. El producto no llama APIs de IA.

Las dependencias npm y las imágenes quedan bloqueadas. Actualizaciones entran por PR con las mismas pruebas. El contenedor de API contiene las herramientas de migración necesarias para el piloto. Los originales técnicos quedan en las carpetas del usuario; extracción y metadatos locales en .runtime.
