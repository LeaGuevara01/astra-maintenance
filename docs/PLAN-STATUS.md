# Estado de las 84 tareas propuestas — 2026-09-16

Contraste con esquema, módulos API/web, pruebas y documentación de main. Resuelta significa alcance comprobado; parcial no cierra todos los criterios. No equivale a Issues publicadas. P009 conserva evidencia manual histórica pero automatización pendiente; no exige repetir recorridos manuales.

| ID | Tarea | Estado | Evidencia / pendiente |
|---|---|---|---|
| P001 | Reconciliar baseline, ramas e identidad de tareas | PARCIAL | main unificado; otros checkouts/IDs pendientes |
| P002 | Publicar mapa arquitectónico y reconciliar evidencia | PARCIAL | continuidad reconciliada; mapas completos pendientes |
| P003 | Respetar rechazo explícito en dry-run | RESUELTA | Código y pruebas de regresión documentales aprobados |
| P004 | Preservar PN conocido ante actualización incompleta | RESUELTA | Código y pruebas de regresión documentales aprobados |
| P005 | Validar colisiones e identidad dentro del lote | PARCIAL | códigos repetidos bloqueados; identidad/fingerprint pendientes |
| P006 | Representar cobertura OCR desconocida correctamente | RESUELTA | Código y pruebas de regresión documentales aprobados |
| P007 | Verificar paridad del contrato API público | RESUELTA | 35 operaciones cubiertas; paridad método+ruta y referencias locales integrada en `a0c9178` |
| P008 | Añadir pruebas del transporte frontend | PARCIAL | Cinco tests api.test.ts integrados por PR #11; cubren sesión e idempotencia. No certifican todo transporte ni componentes |
| P009 | Automatizar el circuito preventivo de tres roles | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P010 | Descartar respuestas de sesiones anteriores | PARCIAL | Transporte y carga global implementados en PR #11; evidencia 68ee631. PDF usa fetch directo; interacción de componentes y cobertura PDF pendientes |
| P011 | Certificar esquema SQL efectivo y preflight de integridad | PARCIAL | upgrade probado; certificación SQL completa pendiente |
| P012 | Modelar jerarquía mínima de activos y componentes | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P013 | Crear revisiones de planes sin editar historia | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P014 | Calcular vencimiento explícito por horas o fecha | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P015 | Disparar OT preventiva de forma idempotente | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P016 | Acordar tipos de OT y estados compatibles | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P017 | Registrar falla y generar OT correctiva mínima | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P018 | Definir contrato ResourceRequirement y cumplimiento | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P019 | Exponer requisitos derivados de OrderMaterial | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P020 | Añadir persistencia aditiva de requisitos | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P021 | Editar demanda PART sin duplicar material operativo | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P022 | Generar checkpoints desde plantilla versionada | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P023 | Registrar asignación y tiempo de trabajo en OT | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P024 | Cancelar OT abierta liberando reservas | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P025 | Extraer servicio transaccional de inventario | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P026 | Introducir ubicación heredada y saldos por ubicación | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P027 | Reservar y consumir por ubicación para una OT | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P028 | Transferir existencias entre ubicaciones | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P029 | Devolver material consumido con trazabilidad | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P030 | Conciliar ledger y saldos mediante apertura explícita | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P031 | Clasificar artículos y fijar unidades canónicas | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P032 | Registrar herramientas individuales y calibración | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P033 | Asignar y devolver herramienta a requisito OT | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P034 | Definir perfiles de seguridad y requisitos EPP | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P035 | Registrar entrega EPP y verificación de seguridad | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P036 | Reconciliar modelos de inteligencia entre checkouts | PARCIAL | comparación mínima documentada ADR-002; mapeo global pendiente |
| P037 | Persistir fuentes y revisiones accesibles por ID | PARCIAL | revisiones/candidatos persistidos; biblioteca completa pendiente |
| P038 | Persistir decisiones técnicas con evidencia y versión | PARCIAL | historial/versiones/API implementados; política técnica ampliada pendiente |
| P039 | Asegurar y fijar el entorno del lector local | PENDIENTE | Plan ejecutable ASTRA-010 definido; contrato, resolver y pruebas aún no implementados |
| P040 | Ejecutar OCR acotado conservando revisión y cobertura | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P041 | Aplicar lote de catálogo revisado transaccionalmente | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P042 | Administrar proveedores reutilizando modelo acordado | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P043 | Convertir faltante OT en requisición trazable | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P044 | Preparar RFQ y registrar ofertas comparables | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P045 | Emitir orden de compra con aprobación | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P046 | Recibir parcialmente una OC una sola vez | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P047 | Reservar recepción para la necesidad originaria | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P048 | Valorar consumo con moneda y fuente congeladas | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P049 | Congelar costo de mano de obra y resumen de OT | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P050 | Registrar ejecución y costo de servicio externo | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P051 | Pilotar consultas por recurso en Inventario | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P052 | Separar detalle de OT y mostrar requisitos | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P053 | Conectar biblioteca y revisión documental persistente | PARCIAL | UI/revisiones integradas y desplegadas en `a0c9178`; acceso seguro al original planificado en ASTRA-010 |
| P054 | Mostrar dry-run real separado de decisión técnica | PARCIAL | comparador real visible y browser aprobado; invalidación externa de fuente pendiente |
| P055 | Operar faltantes y requisiciones desde UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P056 | Registrar recepción parcial de OC desde UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P057 | Completar teclado en tabs y errores de PDF | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P058 | Publicar KPIs operativos con definición y evidencia | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P059 | Integrar búsqueda determinista de piezas y documentos | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P060 | Registrar equivalencia y aplicabilidad con decisión humana | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P061 | Preparar evaluación de búsqueda y asistencia | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P062 | Prototipar asistente OT de sólo lectura | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P063 | Recuperar precios externos como observaciones | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P064 | Proponer acción asistida revisable sin ejecutarla | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P065 | Mapear capacidades sobre los tres roles actuales | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P066 | Administrar ciclo de usuarios y sesiones | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P067 | Redactar logs y validar proxy/rate-limit LAN | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P068 | Demostrar backup diario y recuperación persistente | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P069 | Validar LAN HTTPS y controles de exposición | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P070 | Paginar órdenes y auditoría con filtros de servidor | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P071 | Preparar release de producción recuperable | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P072 | Precisar el significado de servicios vencidos | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P073 | Capturar RFQ y cotizaciones en una pantalla de comparación | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P074 | Revisar y aprobar OC desde la interfaz | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P075 | Operar préstamo y devolución de herramienta | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P076 | Mostrar requisitos EPP y evidencia de seguridad en OT | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P077 | Registrar falla y solicitar correctivo desde UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P078 | Editar y publicar una nueva revisión de plan | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P079 | Consultar costos de OT y sus fuentes | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P080 | Administrar usuarios y revocar sesiones desde UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P081 | Consumir paginación de órdenes y auditoría en UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P082 | Revisar visualmente un lote técnico acotado | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |
| P083 | Exponer dry-run autenticado contra catálogo vigente | PARCIAL | API autenticada contra catálogo; fingerprint global catálogo pendiente |
| P084 | Administrar proveedores desde UI | PENDIENTE | No se encontró implementación completa del alcance/criterios propuestos |

Superficies contrastadas: schema.prisma; apps/api/src (app.ts, auth.ts, candidate-import.ts, config.ts, db.ts, document-intelligence.ts, document-review.ts, documents.ts, errors.ts, index.ts, maintenance.ts, openapi.ts, seed.ts); apps/web/src; pruebas de aceptación/documentales; scripts de operaciones. Priorización: paginación/revisión visual dirigida del módulo, fuente original segura, revisión acotada del lote y aplicación transaccional sin stock. Planes y recursos avanzan por incrementos propios.

Reconciliación 2026-09-16: P007 queda resuelta por ASTRA-DOC-001 y su integración/despliegue en `a0c9178`. P039 y P053 se expanden mediante [ASTRA-010](05-planning/ASTRA-010-secure-source-reader.md): contrato/resolver, endpoint, UI y staging sintético por gates separados. No se considera implementado por existir el plan.
