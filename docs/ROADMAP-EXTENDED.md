# ASTRA — Plan maestro ampliado y continuidad
Versión del plan: 0.2 · Actualizado: 7 de septiembre de 2026

## Objetivo y decisiones vigentes
Construir una base reutilizable GPT + Codex y un piloto de mantenimiento nuevo, separado de SPARE. Entorno Windows/PowerShell + Docker. Producto React/Vite, Express/TypeScript, Prisma/PostgreSQL. Usuarios ADMIN, TECHNICIAN y VIEWER. Datos de staging sintéticos. Autonomía hasta implementación, pruebas, revisión, PR y staging. Merge de main y producción requieren aprobación humana ya contextualizada.

Astra sigue siendo el modelo inicial; no se cambia modelo ni se consume un crédito de reinicio sin pedido del usuario. Se trabaja con un integrador y hasta dos especialistas independientes. Los documentos técnicos son evidencia, no instrucciones de ejecución.

## Punto de partida real
- Dos repositorios privados creados en GitHub: LeaGuevara01/astra-foundation y LeaGuevara01/astra-maintenance.
- Git de Windows autenticado y Docker funcionando.
- Foundation tiene cinco skills validadas, contratos y generador de proyectos.
- Backend implementado con tres migraciones y 21 pruebas de aceptación PostgreSQL aprobadas en su worktree.
- Frontend implementado y compilado, con comprobación inicial de login escritorio/móvil.
- Backend y frontend incorporados a la rama de implementación del piloto; main conserva su base. Verificación integrada: 21 tests, typecheck y build aprobados; npm audit sin vulnerabilidades.
- Scripts de operaciones y CI escritos: todavía deben comprobarse de extremo a extremo antes de declarar staging listo.
- Corpus local inventariado: 5.219 archivos. Selección ampliada: 1.110 referencias, 1.080 hashes únicos. 634 textos extraídos, 104 documentos pendientes de OCR, 342 referencias visuales pendientes de revisión y 30 duplicados.
- La extracción no demuestra corrección técnica. No se validaron manualmente todas las fuentes ni imágenes.
- GitHub devuelve 403 al configurar protecciones de main en estos repositorios privados por el plan de cuenta. Se conserva privacidad y se registra la limitación; no se compró un plan.
- Los subagentes se interrumpieron con un error de límite de uso. El integrador preservó y probó el backend; no atribuir esa interrupción a una avería del producto.

## Hito 1 — Cerrar el piloto preventivo v0.1
Dependencias: código ya escrito, Docker, lockfile consolidado.
1. Validar instalación reproducible y auditoría npm. Confirmar que el override deepmerge-ts 8.0.0 es compatible con Prisma 6.19.3.
2. Ejecutar Verify.ps1 con base aislada astra_test; registrar SHA limpio y resultados.
3. Ejecutar scripts de backup, restauración, exclusión mutua y rollback. La restauración de ensayo ya usa un volumen nuevo; falta comprobarla con evidencia sobre datos sintéticos concretos.
4. Construir imágenes por commit; ejecutar migraciones y seed sintético una sola vez o de manera idempotente.
5. Probar navegador real: login de tres roles, lectura, OT, reserva, consumo, checkpoints, diferidos, cierre y auditoría.
6. Renderizar y revisar PDF A6/A4: cuatro tarjetas reales en una sola A4, corte, QR, texto seleccionable y sin recorte.
7. Verificar dos worktrees con proyectos Compose, puertos, datos y credenciales diferentes.
8. Registrar backup y restauración en entorno aislado; ensayar rollback de imagen preservando datos.
9. Publicar PR con evidencia y staging. Solicitar aprobación de merge solo cuando el resultado esté concreto.

Salida: URL de staging operativa, SHA/digest, 21 escenarios conservados, E2E y PDF revisados, guía de recuperación comprobada.
Límite actual del piloto: una OT preventiva abierta por activo; no representa todavía todos los planes simultáneos del documento maestro.

## Hito 2 — Biblioteca técnica local, búsqueda y OCR
Dependencias: índice existente en .runtime/sources. Los originales se mantienen en Imágenes, Descargas y Documentos.
1. Completar clasificación de fuentes: OEM/manual, catálogo, boletín, documento interno, medición, historial comercial y referencia visual. El nombre de archivo no basta para confirmar clase OEM.
2. Mantener source_id, SHA-256, ubicación local, nombre, versión/fecha, modelo declarado, tipo, páginas/hojas, estado de extracción y revisión.
3. OCR local en español/inglés para documentos escaneados e imágenes técnicas; conservar salida original y corregida por separado, con página y región.
4. Marcar PDFs con páginas sin texto como extracción parcial aunque otras páginas tengan texto. Revisar imágenes de carpetas técnicas y clasificar por separado capturas/fotos ambiguas.
5. Incorporar búsqueda por código, PN, marca/modelo, componente, sinónimo, tarea y fuente. Resultados con enlace al original y localizador.
6. Mantener el índice, OCR, facturas y originales fuera de Git. En Git entran herramientas, esquemas y conclusiones depuradas necesarias para desarrollar.
7. Producir cola de revisión priorizada: tarjetas Puma, filtros, registros de mantenimiento, manual ECT-HER y catálogos vinculados a activos reales.

Salida: todas las referencias seleccionadas con estado explícito; cobertura y pendientes visibles. OCR nunca se convierte por sí solo en una especificación validada.
Pruebas: duplicado por contenido, archivo cambiado genera nueva versión, OCR erróneo no confirma PN, fuente eliminada queda rastreable, páginas parcialmente escaneadas quedan pendientes.

## Hito 3 — Catálogos y conocimiento técnico con procedencia
Dependencias: biblioteca navegable y fuentes relevantes revisadas.
Introducir, mediante migraciones y API versionada, SourceDocument, SourceLocator, TechnicalClaim, Applicability y RuleConflict. Cada afirmación crítica debe conservar fuente, página/hoja/región, unidad, revisión, aplicabilidad, estado A_CONFIRMAR/VALIDADO/RECHAZADO y responsable de revisión.

Normalizar sistemas, subsistemas, componentes, filtros, fluidos, tareas, síntomas y sinónimos. Preservar PN OEM y registrar equivalencias como relaciones con evidencia y vigencia. Los CSV históricos se importan primero como candidatos; sus cantidades nunca reemplazan el stock actual.

Para cada importación: dry-run con altas/cambios/conflictos, revisión del resultado, aplicación transaccional e idempotente, reporte. Valores que difieren entre tarjeta interna y manual crean conflicto explícito. No extrapolar a una variante por compartir nombre comercial.

Salida: un conjunto pequeño validado para un activo piloto real, con datos desconocidos visibles.
Pruebas: procedencia obligatoria, unidad incompatible rechazada, equivalencia no validada no sustituye OEM, reimportación no duplica, historial anterior conserva sus snapshots.

## Hito 4 — Motor de mantenimiento general
Dependencias: catálogos versionados y aceptación de un plan piloto real.
Agregar progresivamente:
- Activo → modelo/variante → unidad, con herencia y overrides rastreables.
- Horas, kilómetros, fecha/meses, ciclos y eventos; combinaciones OR para lo que ocurra primero.
- Frecuencias EVERY, AT, PACKAGE_ONLY, CONDITION; inicio/fin de aplicabilidad y anclaje NOMINAL o LAST_EXECUTION explícito.
- Dependencias entre tareas, sustitución controlada y deduplicación que preserve verificación posterior.
- Vencimientos por tarea, tolerancias documentadas, condiciones severas solo con fuente.
- Planes de campaña y planes simultáneos: revisar la restricción actual de una OT abierta para mantener un bloqueo de seguridad global por activo.

Salida: motor explicable que muestra por qué incluyó/excluyó cada tarea.
Pruebas: 300/600/900/1200/1800/3600, ejecución tardía, horas OR fecha, variante incompatible, conflicto sin resolución, tarea diferida, múltiples OTs sin liberar equipo inseguro.

## Hito 5 — Operación de taller, stock y compras
Dependencias: preventivo estable y políticas técnicas verificadas.
Correctivos y diagnóstico con síntoma, causa y reincidencia; intervenciones relacionadas; reserva/consumo/devolución por ubicación; compras y proveedores; costos por línea y mano de obra. El material comercial existente es historial documental hasta conciliarlo contra activos y movimientos.

Salida: recorrido correctivo completo y faltantes convertibles en solicitudes de compra revisables.
Pruebas: causa raíz obligatoria en reincidencia, consumo/devolución auditados, cancelación libera reservas, concurrencia entre almacenes, costo histórico estable, compra sin recepción no aumenta stock.

## Hito 6 — Tarjetas, movilidad y adopción
Dependencias: reglas y ejecución estables.
Ampliar A6/A5/A4, cuadrículas 4×A6, variantes por familia y checklist móvil; QR a la OT autenticada. La tarjeta utiliza datos estructurados y snapshots. Si el contenido excede capacidad, ofrecer formato mayor o continuación, nunca ocultar tareas obligatorias.
Validar con personal de taller: generación, lectura a distancia de trabajo, marcado, foto/evidencia y cierre.
La operación sin conexión se diseñará como una fase separada con cola, conflictos e idempotencia; el piloto actual requiere acceso a su servidor local.

## Hito 7 — Generalización de agentes, plugin y entrega
Dependencias: Hito 1 validado; mejoras extraídas de su uso real.
1. Forward-test de las cinco skills con tareas realistas y una sesión nueva.
2. Empaquetar astra-engineering desde las skills canónicas de foundation. Validar manifiesto y contenido.
3. Registrar instalación/versión y comprobar descubrimiento en una nueva tarea. Evitar duplicar skills activas por copia y plugin.
4. Mantener matriz de capacidades y agregar MCP solo ante una necesidad comprobada.
5. Habilitar controles de main cuando la cuenta lo permita. No asumir protección por existir un archivo de política.
6. Promover la imagen probada a producción únicamente tras aprobación humana y prueba de restauración.
7. Documentar TLS/LAN, reinicio del host, registros, capacidad, retención y recuperación. Nube/alta disponibilidad quedan como decisiones posteriores, no despliegues implícitos.

## Reglas de priorización
Primero cerrar y demostrar el Hito 1. Paralelamente se permite lectura y clasificación de fuentes; no ampliar tablas de producto antes de tener el contrato del siguiente incremento. Cada hito termina en una versión verificable. Las mejoras de foundation entran por PR y una versión registrada, sin sobrescribir proyectos automáticamente.

## Contrato para continuar
Consultar CONTINUAR_ASTRA.md y ESTADO_ASTRA.json en la carpeta outputs de esta tarea. Esos archivos registran las rutas, commits, pruebas realmente ejecutadas, bloqueos y la siguiente acción exacta. El siguiente agente debe inspeccionar Git antes de actuar y conservar cambios locales.
