# Arquitectura UI y plan de migración progresiva

Estado: arquitectura aprobada para ejecución; primer vertical slice implementado en el árbol de trabajo, sin migración de base de datos  
Fecha de análisis: 2026-09-16  
Checkout analizado: `feat/document-review-history` @ `35e06ed2b8045b73d278af3a5d4118faa1216bad`  
Referencia remota observada: `origin/main` @ `54beabe7f8d25f306c9ab38c781df3c972a033d8`

## 1. Hallazgos

ASTRA ya tiene una base visual coherente y responsive, pero la reutilización es principalmente estética. `Badge`, `Field`, `Modal`, `SearchBox`, `SectionHeading`, estados vacíos y tablas resuelven primitivas; no existe todavía una capa común para representar identidad, clasificación, estado, relaciones y acciones de una entidad.

La UI se divide hoy en dos patrones:

1. Operación del taller: vista general, activos, OT, inventario, planes y auditoría. Son recorridos relativamente claros, pero las tablas y filas codifican directamente cada dominio.
2. Inteligencia documental: cola de fuentes, cola de hallazgos, candidatos, historial y dry-run en una sola pantalla. Es el principal foco de altura, carga cognitiva, filtros repetidos y lógica maestro-detalle duplicada.

Problemas principales:

- `App.tsx` carga globalmente dashboard, activos, planes, inventario, órdenes y hasta 500 auditorías, aunque la ruta activa no los use. Cada mutación refresca el conjunto completo.
- `Views.tsx` concentra seis vistas y tablas específicas. Hay patrones repetidos de encabezado, toolbar, búsqueda, recuento, tabla, estado y acción, sin contrato común.
- `DocumentReview.tsx` reúne tres recursos paginados con estados de carga, selección, filtros, navegación y panel de detalle independientes. La pantalla crece verticalmente aun cuando el usuario trabaja con una sola cola.
- `Badge` infiere el color desde strings globales o un `tone` manual. No distingue categoría de dato, prioridad, fuente, unidad, interacción ni acción.
- Los objetos frontend replican las respuestas API. No hay un adaptador de presentación que separe `identity`, `classification`, `attributes`, `state`, `relations`, `context` y `actions`.
- `Asset.family`, múltiples estados y categorías documentales son strings libres. Conviene normalizar vocabulario y validación de entrada antes de crear tablas taxonómicas.
- Los listados operativos usan tablas anchas. En resoluciones menores dependen del scroll horizontal; no existe una variante compacta móvil basada en filas/cards expandibles.
- Los detalles de una OT ya usan progresión de información y pestañas, y los planes ya son colapsables. Esos son precedentes que deben evolucionar, no reemplazarse.
- Las acciones están dispersas entre botones permanentes, botones de tabla y grupos de decisión. Falta resolverlas por entidad, contexto, rol y estado.
- El backend protege reglas críticas: RBAC, idempotencia, transacciones de stock, checkpoints y snapshots. Ninguna abstracción visual puede convertirse en autoridad de negocio.

### Decisiones de arquitectura

- Crear primero una capa de presentación tipada; no crear una tabla `Entity` universal.
- Mantener recursos API específicos. Un `EntityViewModel` los adapta para UI sin borrar su semántica.
- Introducir relaciones mediante un catálogo explícito de capacidades y comandos; no permitir asociaciones genéricas libres.
- Usar progressive disclosure con tres niveles: scan, expandido y detalle/ruta.
- Tratar drag & drop como un iniciador de un comando existente: validar en servidor, mostrar preview y pedir confirmación. Siempre ofrecer selector/click equivalente.
- Empezar por una relación ya existente y segura: `DocumentFinding` → `DocumentCandidate`.

## 2. Inventario UI actual

### 2.1 Matriz de pantallas

| Pantalla | Sección | Objeto | Familia actual/propuesta | Tipo | Datos clave | Datos secundarios | Acciones | Relaciones | Componente sugerido |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login | Acceso | User/Session | Identidad | Cuenta | email, rol, estado sesión | nombre | ingresar, elegir perfil, salir | sesión–usuario | conservar `Field`, `ErrorBox`; `IdentitySummary` |
| Vista general | KPIs | Dashboard | Operación | Resumen | activos, OT abiertas, vencidos, bajo stock | cerradas, planes | navegar, generar OT | agrega activos/OT/inventario | `MetricCard`, `EntityPreviewList` |
| Vista general | Órdenes recientes | WorkOrder | Mantenimiento | OT preventiva | código, activo, estado, objetivo | lectura real, fecha | abrir | OT–activo–plan | `EntityTable`/`EntityRow` |
| Vista general | Flota | Asset | Activos | máquina/equipo | nombre, código, lectura | familia | abrir listado | activo–plan | `EntityCard` compacta |
| Activos | Listado | Asset | Activos | equipo genérico actual | nombre, código, familia, condición | horómetro, plan | registrar, actualizar lectura | activo–plan–lecturas–OT | tabla desktop + `EntityAccordion` móvil |
| Órdenes | Listado | WorkOrder | Mantenimiento | preventiva | código, activo, estado | medidores, creación | generar, abrir | OT–activo–plan | `EntityList`, filtros de estado |
| Orden | Cabecera/meta | WorkOrder | Mantenimiento | intervención | código, estado, activo, servicio | creación, resultado, próxima lectura | volver, PDF, reservar, cerrar | activo, plan, tareas, materiales, checkpoints | `EntityDetailsHeader`, `EntityBadgeGroup`, `ActionMenu` |
| Orden | Tareas | OrderTask | Mantenimiento | tarea ejecutable | código, descripción, estado | frecuencia, fuente, diferimiento | completar, diferir, N/A | tarea–OT–parte–continuidad | `EntityAccordion`, acciones contextuales |
| Orden | Materiales | OrderMaterial/Part | Repuestos | material planificado | nombre, PN, disponible/faltante | planeado, reservado, usado | reservar, consumir | material–parte–OT | `RelationRow`, `QuantityBadge` |
| Orden | Checkpoints | Checkpoint | Mantenimiento/Seguridad | control | código, etiqueta, criticidad, resultado | — | PASS/FAIL/NA | checkpoint–OT | `CheckpointRow`, `StateBadge` |
| Orden | Documentos/historial | Card/Audit | Información técnica/Trazabilidad | salida/auditoría | formato, acción, actor, fecha | detalle | abrir PDF | documento–OT; evento–OT | `RelatedEntityList`, timeline colapsable |
| Inventario | Listado | Part | Repuestos y consumibles | parte actual | código, nombre, PN, disponible | unidad, existencia, reservado | ingreso | parte–tarea–OT–movimientos | primer candidato para `EntityRow` posterior |
| Planes | Plan colapsable | Plan | Mantenimiento | plan preventivo | código, nombre, revisión, estado | cantidad de tareas | expandir | plan–activo–OT–tareas | conservar patrón; migrar a `EntityAccordion` |
| Planes | Tareas | PlanTask | Mantenimiento | tarea de plan | código, descripción, frecuencia | obligatoria, bloqueo, fuente, parte/cantidad | consulta | tarea–plan–parte | `EntityRow` expandible |
| Documentos | Cola de fuentes | DocumentRevision | Información técnica | revisión de fuente | título, sourceId, extracción, prioridad | hash, páginas, OCR, familia inferida | filtrar, seleccionar, paginar | revisión–candidatos–corridas | `EntityWorkbench`, `FilterBar`, `QuickInspector` |
| Documentos | Hallazgos | DocumentFinding | Información técnica | hallazgo IA | código, nombre, tipo, estado humano | PN, locator, categoría, relevancia, evidencia | revisar, derivar | hallazgo–corrida–revisión–candidato | primer vertical slice |
| Documentos | Candidatos | DocumentCandidate | Repuestos/Información técnica | candidato de catálogo | código, nombre, decisión | PN, unidad, aplicabilidad, fuente, versión | revisar, comparar | candidato–fuente–revisiones–Part potencial | `EntityWorkbench`, `RelationChip` |
| Documentos | Historial | DocumentReview | Trazabilidad | decisión | decisión, razón, actor, fecha | versión | paginar | revisión–candidato | `EntityTimeline` colapsable |
| Documentos | Dry-run | Candidate comparison | Abastecimiento/Información técnica | comparación | decisión, PN propuesto, conflictos | stockEffect | comparar lote | candidato–Part | `ComparisonPanel` |
| Auditoría | Listado | Audit | Trazabilidad | evento | acción, actor, fecha, entityId | detalles JSON | inspeccionar | evento–objeto | `EntityTimeline`, detalle bajo demanda |

### 2.2 Componentes reutilizables existentes

Conservar y evolucionar:

- `Badge`: base visual válida; convertirla gradualmente en `EntityBadge` sin romper usos.
- `Field`, `Modal`, `ErrorBox`, `Empty`, `Loading`, `SearchBox`, `SectionHeading`, `TextLink`.
- `OrderTable`: primer patrón tabular reutilizado en dos contextos; extraer capacidades, no un componente genérico prematuro.
- acordeón de planes y `<details>` ya usados para formulario, contexto y errores.
- patrón maestro-detalle de revisión documental.
- pestañas de detalle de OT y timeline de auditoría.

No conviene reutilizar directamente:

- strings de clases y bloques `evidence-card` como contrato de datos;
- `review-item` para cualquier entidad sin definir densidad, selección y accesibilidad;
- `Badge` como sustituto de todas las propiedades;
- el estado global de `AppData` como store universal.

## 3. Mapa actual y universo de objetos

### 3.1 Entidades persistidas

- Identidad y acceso: `User`, `Session`.
- Activos: `Asset`, `Reading`.
- Mantenimiento: `Plan`, `PlanTask`, `WorkOrder`, `OrderTask`, `DeferredLink`, `Checkpoint`.
- Repuestos/stock: `Part`, `OrderMaterial`, `StockMovement`.
- Trazabilidad: `Audit`, `Idempotency`.
- Información técnica: `DocumentRevision`, `DocumentCandidate`, `DocumentReview`, `DocumentAnalysisRun`, `DocumentFinding`, `DocumentFindingReview`.

### 3.2 Conceptos presentes pero no modelados como entidad propia

- familia de activo;
- categoría/relevancia/procedencia del hallazgo, hoy dentro de JSON de evidencia;
- aplicación/compatibilidad declarada, hoy texto;
- fuente/localizador como conceptos transversales;
- condición, prioridad y estados como strings;
- documentos A6/A4 como proyecciones de OT;
- proveedor, depósito, requisición, precio, herramienta, EPP, riesgo, bloqueo, componente, subconjunto, síntoma, falla y punto de lubricación: forman parte del universo objetivo, pero todavía no son recursos operativos del producto actual.

Estos últimos deben aparecer en la taxonomía y en el catálogo futuro de relaciones, no en una migración inmediata.

## 4. Taxonomía propuesta

La taxonomía es una clasificación navegable, no una herencia rígida de tablas.

```text
Activos
├── Equipos móviles
│   ├── Máquinas agrícolas
│   ├── Vehículos
│   └── Implementos
├── Instalaciones y estructuras
└── Componentes y subconjuntos

Mantenimiento
├── Planificación
│   ├── Planes
│   ├── Frecuencias
│   └── Tareas
├── Ejecución
│   ├── Órdenes
│   ├── Intervenciones
│   └── Checkpoints
└── Diagnóstico
    ├── Fallas
    └── Síntomas

Recursos
├── Herramientas
├── Instrumentos
├── Equipos especiales
└── Auxiliares

Seguridad
├── EPP
├── Riesgos y controles
├── Bloqueos y habilitaciones
└── Inspecciones

Repuestos y consumibles
├── Piezas
├── Filtros
├── Rodamientos, correas y cadenas
├── Lubricantes y fluidos
└── Consumibles normalizados

Abastecimiento
├── Stock y depósitos
├── Requisiciones y compras
├── Proveedores y precios
└── Referencias y equivalencias comerciales

Información técnica
├── Fuentes y revisiones
├── Hallazgos y candidatos
├── Especificaciones y afirmaciones técnicas
├── Aplicabilidad y compatibilidad
└── Documentos, imágenes, catálogos y normas

Trazabilidad
├── Auditoría
├── Decisiones humanas
└── Procedencia y localizadores
```

### Dónde aplicar Dominio → Familia → Tipo → Objeto

Funciona bien para navegación, filtros y catálogo en activos, repuestos, recursos, seguridad y documentos. Ejemplos:

- Activos → Máquinas agrícolas → Tractor → Unidad FAG38.
- Repuestos → Filtros → Aceite → Filtro W123.
- Recursos → Herramientas → Llaves → Llave combinada 19 mm.
- Información técnica → Manuales → Operador → revisión identificada por hash.

No debe forzarse en:

- OT, auditorías, movimientos y revisiones, que son transacciones/eventos y se clasifican mejor por estado, contexto y relación;
- tareas que pueden pertenecer a varias familias o sistemas;
- compatibilidad y equivalencia, que son relaciones con evidencia y vigencia, no tipos;
- roles y permisos;
- valores técnicos variables por modelo, variante, serie o revisión.

Para evitar una mega-enumeración, usar vocabularios pequeños por dominio y un registro de taxonomía versionado. Sólo persistir claves taxonómicas cuando existan búsquedas, validaciones o relaciones que lo justifiquen.

## 5. Modelo conceptual de presentación

Primera etapa, sólo TypeScript:

```ts
type EntityKind =
  | 'asset' | 'plan' | 'plan_task' | 'work_order' | 'order_task'
  | 'checkpoint' | 'part' | 'order_material'
  | 'document_revision' | 'document_finding' | 'document_candidate'
  | 'audit_event';

interface EntityViewModel {
  ref: { kind: EntityKind; id: string; version?: number };
  identity: {
    code?: string;
    name: string;
    subtitle?: string;
  };
  classification: {
    domain: DomainKey;
    family?: string;
    type?: string;
    category?: string;
  };
  attributes: EntityAttribute[];
  state: EntityState[];
  relations: EntityRelationSummary[];
  context?: EntityContext;
  provenance?: ProvenanceSummary;
  actions: EntityActionDescriptor[];
}
```

Reglas:

- el adaptador es específico por recurso: `assetToEntity`, `partToEntity`, `findingToEntity`;
- no serializar este view model como nueva verdad de dominio;
- conservar el objeto fuente o su referencia para comandos específicos;
- identidad no incluye stock ni estado;
- clasificación no implica compatibilidad;
- `A_CONFIRMAR` es un estado explícito y nunca un valor “vacío” decorativo;
- cantidades siempre llevan unidad y semántica (`onHand`, `reserved`, `available`);
- procedencia diferencia fuente, revisión/hash, locator, evidencia y decisión humana.

### Niveles de información

- Nivel 1 — scan: nombre, código, tipo/estado y 2–5 badges priorizados.
- Nivel 2 — expandido: atributos relevantes, relaciones, procedencia resumida y acciones rápidas permitidas.
- Nivel 3 — detalle: historial completo, documentación, precios, archivos, trazabilidad y operaciones de alto impacto.

Cada vista declara qué campos pertenecen a cada nivel; el componente no decide por cantidad de datos arbitraria.

## 6. Sistema de badges

### Contrato

```ts
interface EntityBadgeSpec {
  key: string;
  label: string;
  value: string | number | boolean | null;
  category: 'identity' | 'classification' | 'state' | 'quantity' |
    'provenance' | 'relation' | 'risk' | 'schedule';
  semanticType: 'neutral' | 'info' | 'success' | 'warning' | 'danger' |
    'unknown' | 'critical';
  priority: 1 | 2 | 3;
  icon?: IconKey;
  unit?: string;
  sourceField: string;
  interaction?: 'none' | 'filter' | 'select' | 'action' | 'drag';
  targetTypes?: EntityKind[];
  action?: EntityActionDescriptor;
  accessibleLabel: string;
}
```

### Catálogo inicial justificado

| Badge | Categoría | Uso | Interacción permitida |
| --- | --- | --- | --- |
| código/PN | identidad | reconocer y copiar/buscar | seleccionar/copiar; nunca semántica de estado |
| estado de OT/tarea/checkpoint | estado | decidir próxima acción | filtro; acción sólo desde menú autorizado |
| `A_CONFIRMAR` | procedencia/estado | mostrar incertidumbre | filtro y acceso a evidencia |
| familia/tipo/categoría | clasificación | agrupar y filtrar | filtro |
| stock disponible/faltante | cantidad/estado | decisión operativa | filtro; abrir inventario |
| unidad + cantidad | cantidad | interpretación segura | informativo |
| frecuencia/intervalo | agenda | lectura de plan | filtro futuro |
| criticidad | riesgo | prioridad y bloqueo | filtro; no editar desde badge |
| prioridad/confianza/relevancia documental | estado/procedencia | triage | filtro |
| fuente/hash/locator | procedencia | trazabilidad | abrir inspector de evidencia |
| relación a activo/plan/OT/parte | relación | contexto | navegar/desasociar según permiso |

No convertir en badge párrafos, razones, snippets, hashes completos, notas de cierre ni listas largas. El hash puede mostrarse abreviado como badge y completo en inspector con acción de copia.

`EntityBadgeGroup` debe imponer máximo visible por densidad; los restantes aparecen en “+N” o al expandir. Color nunca será el único indicador. Estados no confirmados conservan texto e icono explícitos.

## 7. Estrategia de listados desplegables

| Listado actual | Problema | Migración recomendada |
| --- | --- | --- |
| Fuentes documentales | 25 filas + detalle siempre dentro de una pantalla extensa | workbench con lista compacta, inspector fijo en desktop y drawer en móvil; filtros colapsables |
| Hallazgos | siete filtros, lista, evidencia, botones de decisión simultáneos | presets de filtro, `EntityRow` Nivel 1, inspector Nivel 2, evidencia/contexto Nivel 3 |
| Candidatos | repite maestro-detalle y luego historial/dry-run separado | pestaña del workbench; historial y comparación como paneles de detalle |
| Auditoría | hasta 500 eventos y detalles potencialmente ruidosos | timeline virtual/paginada; `details` para JSON |
| Planes/tareas | patrón bueno pero tareas completas al abrir | conservar acordeón; agrupar por frecuencia/sistema cuando exista vocabulario confiable |
| Tareas de OT | muchas filas con acciones permanentes | fila expandible; estado y acción primaria en scan, diferimiento/fuente en expansión |
| Materiales OT | métricas repetidas por card | tabla expandible desktop; cards compactas móvil |
| Activos/inventario | tabla ancha móvil | tabla desktop; `EntityAccordion`/cards en viewport estrecho |

Primitivas:

- `EntityList`: carga, vacío, selección, paginación y densidad.
- `EntityRow`: scan con slots y expansión accesible.
- `EntityAccordion`: composición de filas, no repositorio de datos.
- `EntityWorkbench`: lista + inspector + toolbar; en móvil navega a drawer/ruta.
- `FilterBar`: filtros activos como chips, reset y presets; los avanzados viven en `<details>`.
- `QuickInspector`: Nivel 2; `EntityDetails` o ruta dedicada para Nivel 3.

No implementar árbol jerárquico hasta que existan componentes/subconjuntos o taxonomías con padres reales. No simular jerarquías usando strings de familia.

## 8. Arquitectura de componentes

```text
components/entity/
├── EntityCard
├── EntityRow
├── EntityBadge
├── EntityBadgeGroup
├── EntityList
├── EntityAccordion
├── EntityWorkbench
├── EntityPicker
├── EntityPreview
├── EntityDetails
├── EntityActions
├── RelationChip
├── RelationPicker
└── QuickInspector

components/interaction/
├── DragEntity
├── DropZone
├── CompatibilityIndicator
├── AssociationPreview
└── AssociationDialog

features/<feature>/
├── adapters/
├── actions/
├── api/
├── components/
└── views/
```

Responsabilidades:

- componentes `entity`: presentación y eventos, sin reglas de negocio;
- adaptadores: recurso API → view model;
- catálogo de badges: campo semántico → variante y formato;
- resolutor de acciones: entidad + contexto + rol + estado → descriptores visibles;
- feature: llama endpoints y traduce errores;
- backend: autoridad de compatibilidad, permisos, idempotencia y persistencia.

El stack actual no necesita una librería de estado o de drag & drop en la primera fase. React 19, estado local y atributos HTML alcanzan para el prototipo accesible. Evaluar una librería sólo después de validar teclado, touch, reordenamiento inexistente y previews.

### Acciones contextuales

Ejemplos actuales:

- Asset: actualizar lectura; generar/abrir OT según rol y estado; consultar plan.
- WorkOrder: abrir, reservar, cerrar, imprimir; según estado y rol.
- Part: recibir stock para ADMIN; consultar relaciones y movimientos.
- DocumentFinding: revisar para ADMIN/TECHNICIAN; derivar sólo `PART_CANDIDATE` y ADMIN.
- DocumentCandidate: revisar, consultar historial y comparar; nunca aplicar catálogo hoy.

Mostrar una acción primaria como máximo en la fila. El resto vive en `EntityActions` (menú) con razón de deshabilitación cuando sea útil. Ocultar acciones no autorizadas; el backend sigue rechazándolas.

## 9. Sistema de relaciones y drag & drop

### Modelo conceptual

```text
EntityRef de origen
  → RelationCapability registrada
  → destino/contexto candidato
  → validación local preliminar
  → validación autoritativa del servidor
  → preview de consecuencias y procedencia
  → confirmación explícita
  → comando idempotente
  → relación persistida + auditoría
  → invalidación sólo de recursos afectados
```

### Catálogo de relaciones

| Origen | Destino | Relación | Estado en proyecto | Persistencia necesaria |
| --- | --- | --- | --- | --- |
| DocumentFinding `PART_CANDIDATE` | bandeja de candidatos | deriva | ya existe endpoint y validación | existente: `DocumentCandidate` + revisión/auditoría |
| Part | WorkOrder/tarea | material requerido/usado | existe vía `OrderMaterial`, pero no asociación libre | comando específico; no mutar snapshots cerrados |
| PlanTask | Part | requerimiento | existe `partId` singular | revisar cardinalidad antes de ampliar |
| Asset | Plan | asignación | existe `planId` | endpoint explícito futuro |
| DocumentRevision/Finding | Asset/componente | evidencia/aplicabilidad | sólo texto hoy | requiere modelo de relación con procedencia |
| Tool | OrderTask | asignación | entidad inexistente | fuera del slice inicial |
| PPE | riesgo/tarea | control requerido | entidades inexistentes | fase posterior |
| Supplier | requisición | abastecimiento | entidades inexistentes | fase posterior |

### UX del primer drop target

- origen arrastrable: fila/card de hallazgo `PART_CANDIDATE`;
- destino: “Bandeja de candidatos” dentro del mismo workbench;
- alternativa: acción “Derivar candidato” y selector accesible;
- preview: código, descripción, PN, unidad, sourceId, hash, locator, aplicabilidad, advertencias y `stockEffect: NONE`;
- validación local: tipo de hallazgo y rol;
- validación servidor: permisos, existencia/revisión, idempotencia y reglas actuales;
- confirmación: motivo opcional/obligatorio según contrato definitivo;
- resultado: candidato creado una vez, revisión/auditoría, foco movido al candidato;
- error: devolver foco al origen, conservar contexto y anunciar por `aria-live`.

Accesibilidad:

- elementos arrastrables siguen siendo botones/filas enfocables;
- “Seleccionar para asociar” abre el mismo preview;
- no depender de hover, color ni precisión del puntero;
- touch usa selector/dialog, no gesto obligatorio;
- anunciar compatibilidad y resultado; respetar reduced motion.

## 10. Impacto técnico y cambios de modelo potenciales

### Frontend

- dividir `AppData` y carga global por recurso/ruta; introducir cache/invalidation por recurso antes de sumar complejidad visual;
- extraer tipos documentales hoy locales a `DocumentReview.tsx`;
- añadir `EntityViewModel` y adaptadores por feature;
- evolucionar `Badge` de forma compatible;
- dividir `DocumentReview.tsx` en workbench, colas, filtros, inspectores e historial;
- mantener CSS actual durante la primera extracción; luego introducir tokens de densidad, espaciado y estados semánticos;
- usar navegación/drawer móvil para Nivel 2 y rutas para Nivel 3.

### Backend/API

- no se necesita cambio para el primer slice: reutiliza hallazgos, derivación, candidatos, revisiones y dry-run;
- conviene completar OpenAPI documental antes de generalizar clientes;
- futuros endpoints de relación deben exponer `preview/validate` y `confirm` o un comando que pueda devolver preview sin persistir;
- todos los comandos mutables mantienen RBAC, CSRF, Idempotency-Key y auditoría;
- filtros y paginación permanecen en servidor para corpus extensos.

### Modelo de datos

No modificar Prisma en fases 0–4. Posibles cambios posteriores, cada uno sujeto a caso de uso y ADR:

1. `EntityRelation` no genérica o tablas específicas para aplicabilidad documental, parte–componente y recurso–tarea. Preferir relaciones tipadas si tienen reglas distintas.
2. vocabularios controlados para dominio/familia/tipo sólo cuando haya edición, filtros estables y gobernanza; migrar strings existentes con alias y fallback `A_CONFIRMAR`.
3. `TechnicalClaim`/`Applicability`/`SourceLocator` para afirmaciones técnicas, conforme al roadmap existente; no confundir similitud con equivalencia.
4. `ResourceRequirement` para múltiples herramientas/EPP/partes por tarea cuando exista flujo operativo validado; no sobrecargar `PlanTask.partId` silenciosamente.
5. proveedores, depósitos, requisiciones, componentes y riesgos requieren módulos propios, no filas de una tabla polimórfica universal.

Compatibilidad:

- recursos API actuales y componentes viejos conviven mediante adaptadores;
- no cambiar nombres funcionales visibles sólo para igualar claves técnicas;
- snapshots de OT cerradas no se reinterpretan con taxonomías nuevas;
- aliases permiten migrar familias libres sin perder valor original;
- feature flags por pantalla, no dos modelos de dominio paralelos.

## 11. Preparación para búsqueda e IA

La UI debe emitir consultas estructuradas (`kind`, campos, filtros, relaciones, fuente) y no construir prompts con texto visual. Un resultado asistido debe conservar:

- entidad propuesta y campo afectado;
- conclusión;
- confianza/relevancia separadas;
- fuente, revisión/hash y locator;
- evidencia y advertencias;
- aplicabilidad;
- estado humano `A_CONFIRMAR`, `VALIDADO` o `RECHAZADO`;
- acción sugerida separada de la acción persistente.

La IA puede buscar, ordenar, comparar y proponer. No escribe directo a Prisma, no valida equivalencias y no modifica stock, planes u OT sin comando humano autorizado.

## 12. Plan de implementación

### Fase 0 — inventario y contratos

- Objetivo: congelar mapa de rutas, objetos, acciones, permisos y estados; medir densidad y flujos críticos.
- Archivos: este documento, `docs/API-CONTRACT.md`, OpenAPI, pruebas y capturas dirigidas.
- Dependencias: HEAD definido y entorno sintético.
- Riesgos: diseñar sobre un SHA distinto al desplegado; omitir estados vacíos/error/móvil.
- Pruebas: matriz ADMIN/TECHNICIAN/VIEWER; desktop, 760 px y 480 px; navegación por teclado.
- Aceptación: cada elemento del inventario tiene dueño de dominio, fuente API, acción y nivel de información.

### Fase 1 — taxonomía y presentación común

- Objetivo: introducir `EntityViewModel`, `EntityRef`, vocabularios frontend y adaptadores de hallazgo/candidato.
- Archivos: nuevos `apps/web/src/entity/*`, tipos documentales extraídos; sin Prisma.
- Componentes/modelos: sólo tipos/adaptadores.
- Dependencias: casos del primer slice.
- Riesgos: abstracción amplia sin consumidor; pérdida de `A_CONFIRMAR`/procedencia.
- Pruebas: unitarias de adaptadores, prioridades, unidades y labels.
- Aceptación: hallazgo y candidato se renderizan desde contratos comunes sin cambiar respuestas API.

### Fase 2 — primitivas de entidad

- Objetivo: `EntityRow`, `EntityBadgeGroup`, `EntityActions`, `QuickInspector` y estados accesibles.
- Archivos: `apps/web/src/ui.tsx` con compatibilidad y nuevos componentes/carpetas; `styles.css` inicialmente.
- Dependencias: fase 1.
- Riesgos: componente excesivamente configurable; regresión responsive.
- Pruebas: rendering, teclado, foco, nombres accesibles y visual dirigida.
- Aceptación: soporta scan/expandido con 2–5 badges y acciones contextuales.

### Fase 3 — badges semánticos

- Objetivo: catálogo de badges y migración compatible desde `Badge`.
- Archivos: catálogo/formatters, adaptadores, vistas del slice.
- Dependencias: tokens semánticos definidos.
- Riesgos: colores inconsistentes o badges decorativos en exceso.
- Pruebas: estado desconocido, cantidades/unidades, truncamiento, alto contraste.
- Aceptación: ningún color manual en el slice y todos los badges trazan `sourceField`.

### Fase 4 — listados colapsables y workbench documental

- Objetivo: reemplazar el flujo vertical de `/documents` por cola activa + inspector.
- Archivos: división de `DocumentReview.tsx`, componentes feature, estilos responsive.
- Dependencias: fases 1–3; endpoints paginados existentes.
- Riesgos: perder selección al filtrar/paginar; esconder evidencia crítica.
- Pruebas: paginación concurrente, filtros, deep state, loading/error/empty, móvil.
- Aceptación: una sola cola principal visible; Nivel 3 bajo demanda; operación existente completa.

### Fase 5 — relaciones contextuales

- Objetivo: `RelationChip`, registro de capacidades y preview de derivación hallazgo→candidato.
- Archivos: feature documental, adaptador de acciones, API client.
- Dependencias: endpoint de derivación existente y OpenAPI actualizado.
- Riesgos: presentar intención como relación confirmada.
- Pruebas: roles, tipo incompatible, idempotencia, error de red y foco.
- Aceptación: click/selector completa la derivación con preview y auditoría, sin stock.

### Fase 6 — drag & drop accesible

- Objetivo: sumar drag como atajo al mismo comando de fase 5.
- Archivos: interacción, workbench documental, estilos.
- Dependencias: flujo click validado.
- Riesgos: móvil/teclado, drop ambiguo, doble envío.
- Pruebas: puntero, teclado/selector, touch fallback, replay, permisos y cancelación.
- Aceptación: ambos caminos producen el mismo payload y resultado idempotente.

### Fase 7 — extensión entre módulos

- Objetivo: aplicar primitives primero a inventario y tareas/materiales OT; después activos y planes.
- Archivos: `Views.tsx`, `OrderDetail.tsx`, adaptadores por feature, carga por recurso.
- Dependencias: métricas del slice y relaciones reales priorizadas.
- Riesgos: afectar flujos transaccionales o snapshots.
- Pruebas: regresión de roles, reserva/consumo/cierre, responsive y PDFs sin cambios.
- Aceptación: menos altura/acciones permanentes, invariantes backend intactas.

### Fase 8 — taxonomía persistida e integración IA

- Objetivo: persistir sólo vocabularios/relaciones validados y habilitar búsqueda semántica como propuesta.
- Archivos: ADR, Prisma/migración, API, OpenAPI, jobs de índice, UI de evidencia.
- Dependencias: uso real de clasificación y revisión técnica.
- Riesgos: falsa equivalencia, migración de strings, datos OEM no confirmados.
- Pruebas: provenance obligatoria, alias, conflictos, rollback, aislamiento, revisión humana.
- Aceptación: ninguna recomendación se aplica automáticamente; todas las conclusiones críticas conservan evidencia y estado humano.

## 13. Archivos concretos involucrados

### En el análisis y primer slice

- `apps/web/src/App.tsx`: routing manual, carga global, roles y shell.
- `apps/web/src/types.ts`: contratos operativos actuales.
- `apps/web/src/ui.tsx`: primitivas existentes y `Badge`.
- `apps/web/src/Views.tsx`: listados operativos y acordeón de planes.
- `apps/web/src/OrderDetail.tsx`: tareas, materiales, checkpoints, documentos y auditoría.
- `apps/web/src/DocumentReview.tsx`: foco principal del slice.
- `apps/web/src/styles.css`: sistema visual, densidad y breakpoints.
- `apps/web/src/api.ts`: CSRF, errores e idempotencia de cliente.
- `apps/api/src/document-review.ts`: paginación, revisión, derivación y dry-run.
- `apps/api/src/app.ts`: rutas operativas y RBAC.
- `apps/api/src/db.ts` y `maintenance.ts`: invariantes de OT/stock que la UI no debe duplicar.
- `prisma/schema.prisma`: mapa actual; sin cambio en el slice.
- `docs/API-CONTRACT.md`, `docs/ADR-002-document-review.md` y OpenAPI: contratos a sincronizar.

### Estructura candidata, no creada aún

```text
apps/web/src/entity/
apps/web/src/components/entity/
apps/web/src/components/interaction/
apps/web/src/features/documents/
apps/web/src/features/inventory/
apps/web/src/features/orders/
```

Antes de crearla, confirmar convenciones de imports y tamaño del slice. No mover todos los archivos en una sola fase.

## 14. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| mega-abstracción que borra reglas | view model sólo de presentación y adaptadores específicos |
| taxonomía falsa o rígida | vocabularios por dominio, aliases y `A_CONFIRMAR`; persistencia diferida |
| drag visual sin semántica | catálogo explícito de capacidades + comando backend |
| autorización sólo en UI | RBAC y validación siempre en API |
| asociación doble | Idempotency-Key y confirmación única |
| ocultar evidencia al compactar | Nivel 2/3 accesible, indicador de procedencia y advertencias |
| degradar móvil | drawer/ruta + selector alternativo; pruebas 760/480 px |
| exceso de badges | prioridad y máximo visible; texto largo fuera del badge |
| romper historia cerrada | snapshots y registros append-only no se re-clasifican automáticamente |
| confundir similitud con equivalencia | relación de equivalencia requiere evidencia y decisión humana |
| refresh global y respuestas obsoletas | carga/invalidation por recurso; conservar protección contra respuestas anteriores |
| divergencia HEAD/staging | registrar SHA en cada revisión visual y no reutilizar evidencia histórica como actual |

## 15. Primer vertical slice recomendado

### Hallazgo documental → candidato de catálogo

Es el mejor slice porque cubre la arquitectura completa con bajo riesgo transaccional:

- entidad de origen real: `DocumentFinding`;
- listado extenso real: cola paginada con filtros;
- badges reales: tipo, decisión humana, confianza, categoría, relevancia y procedencia;
- expansión real: evidencia, contexto vecino, hash, locator y advertencias;
- relación real: derivación a `DocumentCandidate`;
- drop target natural: bandeja de candidatos;
- validación real: sólo `PART_CANDIDATE`, rol ADMIN, fuente/revisión existentes;
- persistencia real: candidato, revisión y auditoría idempotentes;
- consecuencia acotada: no aplica catálogo y `stockEffect` permanece `NONE`;
- alternativa accesible ya conceptualizada: botón/selector “Derivar candidato”.

No elegir inicialmente Parte → componente o Herramienta → tarea: los destinos/componentes o las herramientas aún no existen como entidades suficientes. Tampoco elegir Part → OT como primer drop: toca reservas, cantidades, snapshots y transacciones críticas antes de validar la interacción.

### Criterio de aceptación del slice

1. La cola muestra Nivel 1 con nombre/código, estado y máximo cinco badges.
2. Expandir o seleccionar muestra Nivel 2 sin abandonar contexto.
3. Evidencia completa e historial quedan en Nivel 3.
4. La acción por click y el drop abren el mismo preview.
5. Un destino incompatible explica el motivo sin permitir confirmar.
6. ADMIN puede confirmar una sola derivación; TECHNICIAN/VIEWER no obtienen capacidad no autorizada.
7. El backend conserva idempotencia, procedencia, `A_CONFIRMAR` y cero movimientos de stock.
8. Filtros, paginación y selección funcionan en desktop y móvil.
9. Teclado y lector de pantalla pueden completar el camino alternativo.
10. Las pruebas existentes de documentos siguen pasando y se agregan regresiones del adaptador/interacción.

## 16. Resultado esperado de la reforma

La evolución propuesta no intenta uniformar el dominio borrando diferencias. Unifica cómo se escanea, expande, relaciona y acciona una entidad, mientras mantiene recursos, comandos e invariantes específicos. El éxito se medirá por menor altura y carga cognitiva, menos duplicación de comportamiento, relaciones comprensibles, accesibilidad y trazabilidad preservada; no por la cantidad de componentes “genéricos” creados.

## 17. Ejecución del primer vertical slice

Implementado el 2026-09-16 en el árbol de trabajo de `feat/document-review-history`, sin commit ni despliegue:

- `EntityViewModel`, `EntityBadgeSpec`, `EntityBadge`, `EntityBadgeGroup`, `EntityRow` y `DropZone` como primeras primitivas de presentación;
- adaptador explícito `DocumentFinding` → `EntityViewModel`;
- máximo de cinco badges en el scan y contador de propiedades restantes;
- filtros avanzados colapsados;
- inspector rápido con evidencia/trazabilidad en Nivel 3 colapsable;
- acción accesible “Preparar derivación” y drop target alternativo para ADMIN;
- preview común con confirmación antes de persistir;
- persistencia mediante el endpoint idempotente existente, sin cambios de API o Prisma;
- layout responsive que oculta el drop target en móvil y conserva la alternativa por click.

Verificación ejecutada: `scripts/Verify.ps1 -SkipInstall`, 52/52 pruebas, typecheck y build API/web aprobados. Revisión dirigida en navegador sobre una base sintética aislada comprobó un candidato creado, hallazgo `CREATE_CANDIDATE` y cero `StockMovement`. No es evidencia de staging y el runtime de desarrollo informó `commit=unknown`.
