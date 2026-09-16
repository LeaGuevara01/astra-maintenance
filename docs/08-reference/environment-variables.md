# Variables de entorno y configuración

Estado: inventario derivado de API, Vite, Prisma, Compose y scripts. Los valores secretos se generan bajo `.runtime`; nunca deben documentarse valores reales ni incorporarse a Git.

## Aplicación

| Variable | Consumidor | Obligatoria | Sensible | Descripción |
|---|---|---:|---:|---|
| `DATABASE_URL` | Prisma/API/seed | Sí | Sí | Conexión PostgreSQL de ejecución |
| `TEST_DATABASE_URL` | tests/export PDF | Para tests | Sí | Debe apuntar a `astra_test` o `test_*` |
| `APP_ORIGIN` | API | Sí, salvo default de test | No | Origen HTTP(S) exacto, sin path ni slash final |
| `APP_ENVIRONMENT` | API/seed | Recomendada | No | `development`, `staging`, `test` o `production` según política |
| `COOKIE_SECURE` | API | Condicional | No | `true` fuera de loopback; `false` sólo local permitido |
| `APP_VERSION` | API | No | No | Default `0.1.0`; visible en `/version` |
| `GIT_COMMIT` | API/deploy | Para trazabilidad | No | SHA exacto del artefacto; default `unknown` |
| `PORT` | API | No | No | Puerto API, default 4301 |
| `HOST` | API | No | No | Bind API, default `0.0.0.0` |
| `NODE_ENV` | API/scripts | Según comando | No | `test`, `development` o `production` |
| `SEED_ADMIN_PASSWORD` | seed | Para seed | Sí | Contraseña ADMIN, mínimo 12 caracteres |
| `SEED_TECH_PASSWORD` | seed | Para seed | Sí | Contraseña TECHNICIAN, mínimo 12 caracteres |
| `SEED_VIEWER_PASSWORD` | seed | Para seed | Sí | Contraseña VIEWER, mínimo 12 caracteres |

## Frontend de desarrollo

| Variable | Consumidor | Default | Descripción |
|---|---|---|---|
| `WEB_PORT` | Vite | `4381` | Puerto estricto de desarrollo/preview |
| `API_TARGET` | Vite | `http://localhost:4301` | Destino proxy para `/api` y `/health` |

No hay variables `VITE_*` expuestas al bundle. La identidad se obtiene desde `/api/v1/version`.

## Compose y scripts

| Variable | Uso |
|---|---|
| `POSTGRES_IMAGE` | Imagen PostgreSQL fijada por digest/tag autorizado |
| `API_IMAGE`, `WEB_IMAGE` | Imágenes locales de release |
| `DB_NAME`, `DB_PASSWORD`, `DB_PORT` | Base, secreto y puerto aislados por entorno |
| `ASTRA_ENV` | Valor enviado como `APP_ENVIRONMENT` al contenedor |
| `BIND_ADDRESS`, `WEB_PORT`, `WEB_CONTAINER_PORT` | Publicación del proxy web |
| `CADDYFILE` | Configuración Caddy montada read-only |
| `GIT_COMMIT`, `APP_ORIGIN`, `COOKIE_SECURE` | Identidad y seguridad del despliegue |
| `SEED_*_PASSWORD` | Credenciales sintéticas generadas por contexto |

`Common.ps1` construye contextos separados en `.runtime/<environment>/config.json` y `.env`, reasigna puertos cuando corresponde y restaura variables de proceso después de invocar Compose.

## Reglas

- Usar `Prepare.ps1`, `Start-Dev.ps1`, `Verify.ps1` o `Deploy-Staging.ps1`; no copiar secretos entre entornos.
- `.env.example` es sólo una plantilla y no contiene todas las variables de Compose.
- `TEST_DATABASE_URL` nunca debe apuntar a staging o producción.
- Un despliegue sólo es identificable si health, `/api/v1/version` y footer coinciden con el SHA esperado.
- HTTPS y cookie Secure son obligatorios para LAN/producción.
