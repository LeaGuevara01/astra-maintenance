---
id: ASTRA-EVIDENCE-20260916-10
date: 2026-09-16
scope: frontend-session-isolation
base: a0c9178d668305bc33bc8bacdad9f0ec529e4653
branch: fix/frontend-session-isolation
---

# Aislamiento de respuestas entre sesiones

## Revisión y riesgo priorizado

La revisión integral confirmó el baseline funcional de 54 pruebas API, typecheck y build, además de cero vulnerabilidades de producción reportadas por `npm audit --omit=dev`. La deuda priorizada fue P008/P010: el transporte frontend no tenía pruebas automatizadas y una respuesta iniciada por una sesión podía completar después de logout, expiración o ingreso con otra identidad.

## Cambio acotado

- El transporte versiona el contexto de sesión cuando cambia el token CSRF y descarta respuestas o fallos de red tardíos mediante `STALE_SESSION`.
- Las claves idempotentes inciertas continúan reutilizándose dentro de la misma sesión, pero se invalidan al cambiar de sesión.
- La carga global acepta sólo su invocación más reciente y no presenta como error una respuesta descartada por cambio de sesión.
- `npm test` incluye ahora los workspaces API y web; el frontend incorpora cuatro pruebas dirigidas del transporte.

No se modificaron reglas de negocio, Prisma, stock, corpus ni datos. No se desplegó staging ni producción.

## Evidencia

- `npm run test --workspace @astra/web`: 4/4 PASS.
- `npm run typecheck --workspace @astra/web`: PASS.
- `scripts/Verify.ps1 -SkipInstall`: pendiente de repetir sobre el commit aislado.

## Cobertura pendiente

- Añadir pruebas de componentes para interacción por teclado y estados visuales.
- Tratar accesibilidad de pestañas y errores de descarga PDF como incremento separado.
- Diseñar el lector seguro de fuentes por `revisionId` sin exponer rutas locales.
