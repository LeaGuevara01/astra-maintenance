# Arquitectura backend

Estado: arquitectura implementada e integrada en `a0c9178`. ASTRA API es un monolito modular Express/TypeScript con PostgreSQL y Prisma; no hay microservicios ni jobs persistentes.

## Capas

```text
HTTP / Express
  app.ts ───────────── rutas preventivas, validación Zod y respuestas
  document-review.ts ─ rutas documentales
        │
Seguridad y aplicación
  auth.ts ──────────── sesión, origen, CSRF y roles
  maintenance.ts ───── reglas de OT, stock, tareas y cierre
  candidate-import.ts  comparación conservadora
  document-analysis.ts análisis local y hallazgos
        │
Persistencia y concurrencia
  db.ts ────────────── transacciones serializables, locks, idempotencia y vistas
  Prisma Client ────── acceso tipado
  migraciones SQL ──── constraints, índices y triggers
        │
PostgreSQL
```

`documents.ts` genera HTML/PDF desde el snapshot de la orden. `openapi.ts` sirve las 35 operaciones implementadas y una prueba compara paridad método+ruta y referencias locales.

## Inicio y configuración

`index.ts` carga `readConfig`, crea Prisma Client y escucha en `PORT`/`HOST`. La configuración rechaza orígenes con path, cookies inseguras fuera de loopback y HTTP fuera de los entornos locales permitidos. La identidad expuesta combina `APP_VERSION`, `GIT_COMMIT` y `APP_ENVIRONMENT`.

## Flujo de una mutación

1. Express limita JSON a 64 KiB y agrega cabeceras defensivas.
2. `requireSession` valida cookie, expiración y usuario activo.
3. `requireCsrf` compara origen y token para métodos mutables.
4. `roles(...)` aplica autorización cuando corresponde.
5. Zod valida y normaliza entrada.
6. El servicio ejecuta una transacción serializable y toma locks explícitos cuando hay competencia.
7. Se escriben entidad, trazas y respuesta idempotente dentro del límite transaccional aplicable.
8. Los errores se normalizan como `{error:{code,message,details?}}`.

## Módulos

| Archivo | Responsabilidad | No debe asumir |
|---|---|---|
| `app.ts` | Composición HTTP, rutas generales y validación de DTO | Lógica técnica OEM |
| `auth.ts` | Login, sesión, CSRF y roles | Permisos sólo de UI |
| `maintenance.ts` | Generación, reserva, consumo, tareas, checkpoints, cierre y lecturas | Edición de historia cerrada |
| `db.ts` | Transacciones, idempotencia, locks y proyecciones | Reglas de presentación |
| `document-review.ts` | Fuentes, candidatos, revisiones, hallazgos y dry-run | Aplicación al catálogo/stock |
| `document-analysis.ts` | Hallazgos conservadores | Confirmación humana u OEM |
| `candidate-import.ts` | Comparación sin mutación | Persistencia o equivalencia automática |
| `documents.ts` | Tarjetas HTML/PDF deterministas | Fuente primaria de datos operativos |
| `seed.ts` | Datos sintéticos y cuentas configuradas | Producción o recomendaciones reales |

## Persistencia

- Prisma define 21 modelos; las migraciones versionadas son la autoridad de esquema efectivo.
- Reglas críticas se duplican intencionalmente entre servicio y base cuando protegen a otros writers.
- Los snapshots JSON congelan activo, plan y parte en la OT.
- Auditoría, movimientos, lecturas, continuidades y revisiones humanas relevantes son append-only.
- No se usa `db push` como mecanismo operativo.

## Procesos síncronos y offline

La API no ejecuta colas ni cron persistente. Normalización y análisis documental se invocan mediante comandos locales (`documents:normalize`, `documents:analyze-sample`). La persistencia de hallazgos requiere una revisión ya cargada y una versión de analizador no usada previamente.

## Límites y deuda

- `app.ts` concentra varias rutas y composición; aún no existe separación formal por todos los dominios.
- La metadata de la cola de fuentes se reconstruye desde eventos `Audit`, no desde columnas tipadas.
- Algunos estados son strings con constraints SQL, no enums Prisma.
- OpenAPI tiene prueba automática de paridad método+ruta mediante análisis estático de los dos routers; aún falta validación semántica independiente OpenAPI 3.1.
- El rate limit de login vive en memoria y no coordina múltiples procesos.
