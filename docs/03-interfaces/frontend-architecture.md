# Arquitectura frontend

Estado: implementación React/Vite vigente e integrada en `a0c9178`. La UI es una SPA servida en el mismo origen que `/api`; no contiene reglas de negocio autoritativas.

## Composición

```text
main.tsx
  App.tsx ─ sesión, navegación, carga global y modales principales
    Views.tsx ─ overview, activos, órdenes, inventario, planes y auditoría
    OrderDetail.tsx ─ ejecución de una OT y documentos
    DocumentReview.tsx ─ fuentes, hallazgos, candidatos e historial
    entity.tsx ─ primitivas de entidad, badges, filas y drop zone
    ui.tsx ─ controles visuales compartidos
    api.ts ─ transporte, CSRF, errores e idempotency keys en memoria
    types.ts ─ contratos de vista TypeScript
```

## Navegación

No se usa una librería de router. `App.tsx` interpreta `window.location.pathname`, actualiza `history.pushState` y escucha `popstate`.

Rutas de interfaz: `/`, `/assets`, `/orders`, `/orders/:id`, `/inventory`, `/plans`, `/documents` y `/audit`. El servidor web debe devolver `index.html` para rutas SPA.

## Sesión y datos

1. Al iniciar, la UI consulta `/auth/me`.
2. Si la sesión es válida, conserva usuario y CSRF en memoria.
3. La carga global ejecuta en paralelo dashboard, activos, planes, inventario, órdenes, auditoría y versión.
4. Un 401 posterior emite `astra:session-expired`, limpia sesión, datos, CSRF y diálogo.
5. Tras una mutación exitosa, la UI vuelve a cargar el conjunto global.

`DocumentReview` mantiene su propia carga paginada. No existe cache compartida ni biblioteca de data fetching.

## Transporte e idempotencia

`api.ts` agrega credenciales same-origin, JSON y CSRF. Para operaciones marcadas como idempotentes genera una UUID y la conserva por firma método+ruta+cuerpo mientras el resultado sea incierto.

- Éxito: elimina la clave.
- Error HTTP 4xx explícito: elimina la clave para permitir corregir entrada.
- Error de red: conserva la clave para reintento seguro dentro de la misma sesión de página.
- Cambio de CSRF/sesión: elimina todas las claves.

La clave vive sólo en memoria; una recarga pierde el identificador. Después de una recarga con resultado incierto se debe consultar el recurso/auditoría antes de reenviar.

## Autorización de presentación

La UI oculta o deshabilita acciones según rol para mejorar la experiencia:

- ADMIN: administración, generación, ingresos y derivación documental.
- TECHNICIAN: ejecución y revisión documental.
- VIEWER: consulta.

El backend sigue siendo la autoridad. Ocultar un botón no constituye control de acceso.

## Sistema de componentes

- `ui.tsx`: Badge, errores, empty state, loading, búsqueda, campos y modal.
- `entity.tsx`: contrato común para hallazgos/candidatos y máximo visual inicial de cinco badges.
- El inspector separa resumen operativo y evidencia detallada.
- Drag & drop es mejora progresiva: sólo ADMIN, sólo `PART_CANDIDATE`, oculto bajo 800 px y siempre acompañado por click/teclado.

## Accesibilidad y resiliencia

- Skip link, labels, roles de pestaña, estados de carga y anuncios de toast.
- Escape/foco modal dependen del elemento `dialog` usado por `Modal`.
- Fuentes empaquetadas localmente; no requiere CDN.
- Errores de API permanecen visibles y ofrecen reintento de lectura.

## Límites y deuda

- `App.tsx` concentra navegación, sesión, carga global y formularios.
- No hay tests automatizados del transporte o componentes frontend.
- No hay descarte general de respuestas tardías entre sesiones para todas las cargas.
- Los tipos frontend se mantienen manualmente; no se generan desde OpenAPI.
- La revisión desktop del gesto físico drag & drop sigue pendiente.
