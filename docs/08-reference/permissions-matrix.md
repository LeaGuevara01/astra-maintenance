# Matriz de permisos HTTP

Estado: derivada de `app.ts`, `document-review.ts` y `auth.ts` en la base `c8e2efb`. Todos los endpoints `/api/v1` posteriores al login requieren sesión. Las mutaciones requieren además origen exacto y `X-CSRF-Token`.

Leyenda: `R` lectura, `W` escritura, `—` prohibido por rol, `P` público. `Idem` indica `Idempotency-Key` obligatorio.

## Plataforma y sesión

| Método y ruta | ADMIN | TECHNICIAN | VIEWER | CSRF | Idem |
|---|---:|---:|---:|---:|---:|
| `GET /health/live` | P | P | P | No | No |
| `GET /health/ready` | P | P | P | No | No |
| `GET /api/v1/version` | P | P | P | No | No |
| `GET /api/v1/openapi.json` | P | P | P | No | No |
| `POST /api/v1/auth/login` | P | P | P | Origen | No |
| `GET /api/v1/auth/me` | R | R | R | No | No |
| `POST /api/v1/auth/logout` | W | W | W | Sí | No |

## Operación preventiva

| Método y ruta | ADMIN | TECHNICIAN | VIEWER | CSRF | Idem |
|---|---:|---:|---:|---:|---:|
| `GET /dashboard` | R | R | R | No | No |
| `GET /assets` | R | R | R | No | No |
| `POST /assets` | W | — | — | Sí | No |
| `POST /assets/:id/readings` | W | W | — | Sí | No |
| `GET /plans` | R | R | R | No | No |
| `GET /inventory` | R | R | R | No | No |
| `POST /inventory/:id/receive` | W | — | — | Sí | Natural por `reference` |
| `GET /orders` | R | R | R | No | No |
| `GET /orders/:id` | R | R | R | No | No |
| `POST /orders/generate` | W | — | — | Sí | Sí |
| `POST /orders/:id/reserve` | W | W | — | Sí | Sí |
| `POST /orders/:id/consume` | W | W | — | Sí | Sí |
| `PATCH /orders/:id/tasks/:taskId` | W | W | — | Sí | No |
| `PATCH /orders/:id/checkpoints/:checkpointId` | W | W | — | Sí | No |
| `POST /orders/:id/close` | W | W | — | Sí | Sí |
| `GET /orders/:id/card` | R | R | R | No | No |
| `GET /orders/:id/pdf` | R | R | R | No | No |
| `GET /audit` | R | R | R | No | No |

## Revisión documental

| Método y ruta bajo `/document-candidates` | ADMIN | TECHNICIAN | VIEWER | CSRF | Idem |
|---|---:|---:|---:|---:|---:|
| `GET /` | R | R | R | No | No |
| `GET /page` | R | R | R | No | No |
| `GET /:id/reviews` | R | R | R | No | No |
| `GET /sources/page` | R | R | R | No | No |
| `GET /findings/page` | R | R | R | No | No |
| `POST /` | W | — | — | Sí | Sí |
| `POST /:id/reviews` | W | W | — | Sí | Sí |
| `POST /dry-run` | W sin efecto | W sin efecto | W sin efecto | Sí | No |
| `POST /findings/:id/reviews` | W | W | — | Sí | Sí |
| `POST /findings/:id/candidate` | W | — | — | Sí | Sí |

`POST /dry-run` usa POST por el lote de entrada, pero devuelve `apply:false`, no crea catálogo ni modifica stock.

## Controles transversales

- Cookie `HttpOnly`, `SameSite=Strict`; `Secure` depende del entorno permitido.
- Sesiones opacas de 256 bits; en base se guarda sólo SHA-256.
- Login limita diez intentos por IP durante quince minutos en memoria del proceso.
- Toda respuesta API deshabilita cache y agrega cabeceras defensivas.
- La autorización de UI no sustituye estos gates de servidor.

## Pendientes explícitos

- El contrato OpenAPI público refleja las 35 operaciones y sus gates principales; falta validación semántica independiente y ejemplos completos.
- No hay scopes por activo, taller o tenant; los roles son globales.
- `GET /audit` es visible para los tres roles y devuelve hasta 500 eventos; cualquier restricción adicional requiere decisión de producto.
