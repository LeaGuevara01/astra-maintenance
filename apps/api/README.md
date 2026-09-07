# ASTRA API

Express 5, TypeScript, Prisma 6, PostgreSQL. The pilot uses synthetic maintenance data and does not supply OEM recommendations. Public OpenAPI: `GET /api/v1/openapi.json`.

## Runtime

- `DATABASE_URL`: PostgreSQL connection string. Apply all versioned migrations with `npm run db:migrate` before starting.
- `APP_ORIGIN`: exact browser origin, without a trailing slash. Required. Login and every write validate it.
- `PORT=4301`, `HOST=0.0.0.0` by default; bind via the reverse proxy.
- `APP_ENVIRONMENT=development|staging|production`, `APP_VERSION`, `GIT_COMMIT` identify the artifact.
- `COOKIE_SECURE=true` for HTTPS/LAN/production. `false` is accepted only for a loopback origin in development/staging/test. Loopback staging may use `NODE_ENV=production` while remaining synthetic staging.
- Seed requires distinct `SEED_ADMIN_PASSWORD`, `SEED_TECH_PASSWORD`, `SEED_VIEWER_PASSWORD`, each at least 12 characters. Existing passwords and operational data are preserved on repeat seed. Synthetic seed refuses `APP_ENVIRONMENT=production`.

Sessions are random 256-bit opaque tokens; only their SHA-256 digest is stored. Passwords use salted scrypt. Cookies are HttpOnly/SameSite Strict, with an absolute eight-hour expiry. Each session has an independent CSRF token. No signing secret is necessary.

## Domain and transaction behavior

- A task is due when its positive frequency divides the nominal target. The next service meter is the next nominal frequency boundary, independent of actual execution drift.
- One OPEN preventive OT per asset prevents overlapping interventions from releasing an unsafe asset. Duplicate generation returns the original OT; a reused idempotency key with another payload returns 409.
- Stock reservations and consumption lock the order and the affected parts. Serializable transactions retry PostgreSQL serialization/deadlock errors. Decimal quantities have at most three places. Own reservations are consumed first; other OT reservations are preserved.
- Delivery `reference` is the natural receipt idempotency key per part. Generation, reservation, consumption and closure require `Idempotency-Key`. A transport retry must retain both the key and the original body. Replays return the original response; GET the resource to refresh subsequent changes.
- Mandatory PENDING tasks block closure. Blocking tasks cannot be NA/deferred. DONE tasks with materials require recorded real consumption. Deferral requires a reason, date and authenticated responsible person; the next generated OT links a new pending task to the immutable original.
- A critical PENDING/FAIL blocks operational release; critical NA is invalid. `NOT_OPERATIVE` may document unsafe equipment, with closure notes, after tasks are resolved. Deferred tasks require `OPERATIVE_WITH_NOTES` or `NOT_OPERATIVE`.
- Closure releases unused reservations atomically. Database triggers freeze closed orders and details; audit, stock movements, readings and deferred links are append-only. Correction work belongs to a subsequent intervention; this pilot does not offer retroactive editing.
- Asset, plan, task and part descriptions/technical unknowns are snapshotted. Catalog edits cannot alter historical cards. Unknown technical values remain `A_CONFIRMAR`.

## Documents

HTML and PDF derive their rows from the same snapshot. A4 repeats the same A6 card four times. PDF text is selectable; QR links to `/orders/:id`. The compact PDF rejects content that exceeds a minimum legible font instead of clipping it (`CARD_CAPACITY`, 422). The digital record retains full text.

## Acceptance evidence

Set `TEST_DATABASE_URL` to an isolated database named `astra_test` or `test_*`, apply migrations, then `npm test`. Tests explicitly refuse to truncate any other database name. The suite uses real PostgreSQL and resets its synthetic data between scenarios; there are no persistence mocks.

Coverage: nominal overlap, actual/nominal separation, concurrent generation and consumption, last-unit race, reservation ownership, partial shortages, receipt replay/decimal precision, all role gates, CSRF/origin/session expiry, monotonic readings, pending/failed checkpoints, closure/checkpoint race, idempotent closure, immutable history, real-consumption checks, deferred continuation, four identical HTML cards and real PDF generation.

`npm run build --workspace @astra/api` typechecks and emits the server. `apps/api/test/export-pdf.ts` exports a synthetic 1200h sample for visual QA to an explicitly supplied directory.
