# RF-000A-FE — Revisión frontend y colisiones

Estado: HANDOFF_READY. Revisión sólo lectura registrada por el integrador. Snapshot funcional revisado `abc77f6`; main avanzó después a `a68150e` sin diff de árbol. No se editaron los tres árboles inspeccionados.

- P008 PARCIAL: api.test.ts contiene cinco pruebas de sesión/idempotencia. Pendientes 204, formato inválido, errores HTTP y componentes.
- P010 PARCIAL: api.ts protege JSON y errores tardíos; App controla carga más reciente. OrderDetail.tsx:26 descarga PDF por fetch directo y puede continuar hasta a.click después del cambio de sesión. No se declara resuelto globalmente.
- El registro histórico 10 dice cuatro pruebas en la descripción y cinco en evidencia; prevalecen los cinco casos observados. Se conserva el registro histórico y se documenta aquí la discrepancia editorial.
- Familias fd402ec parte de a0c9178 y no incluye aislamiento. Integrar diff acotado preservando correcciones posteriores, nunca sustituir App/api por archivos antiguos.
- Familias y QR colisionan en App/Views; original y QR en DocumentReview. Integración secuencial por responsable.
- apiBlob local QR comprueba sesión tras respuesta/blob, pero el fallo de red tardío carece del tratamiento equivalente. Revisar dentro de REF-001.

## Hallazgos dirigidos de REF-001

Snapshot preliminar: `feat/technical-references-qr` en `17e7eaa6f152bd855fbd5ca6c263ddc8fa70163c`, árbol sucio. Los hashes SHA-256 observados fueron:

- `App.tsx`: `31AAD41946F360701D262D54963D5E15E7A34A183C656F6ABD1C7FAFCA829DEC`.
- `References.tsx`: `C1AFEB9ED1FB6CBBD3ED5DFF1C78F54184E5240BBC3A0D5E4A9CC8321E12D045`.
- `Traceability.tsx`: `440FFEB96002DDDF4F9FDE336569C378865C6CCB8EF97D4BDB400AC2786F94EE`.
- `api.ts`: `86299EE6583724BFE1B2716A7D7C7C2850912ACFE2FC963368D0CCCDB470791F`.

Defectos demostrables por flujo de estado:

1. P1 — `Traceability.tsx`: `PrintControls` conserva QR y emisión al cambiar de factura. React reutiliza el componente sin `key` ni reset por destino; una respuesta tardía de A puede aparecer bajo B. La identidad del destino debe invalidar estado y respuestas en vuelo.
2. P1 — `Traceability.tsx`: `selectObject()` aplica directamente la respuesta. Click A lento seguido de B rápido permite que A sobrescriba la última selección y exponga debajo formularios de ubicación, retiro e impresión para el objeto incorrecto.
3. P2 — `App.tsx`: `/q/:id` se lee directamente desde `window.location`, pero `popstate` sólo conserva `page` y `selectedOrder`. El paso `/q/id` → `/traceability` puede no cambiar estado React y dejar visible el QR; Atrás/Adelante tiene el mismo riesgo. La identidad completa de ruta debe formar parte del estado.
4. P2 — `References.tsx`: al seleccionar B se limpia disponibilidad, pero no los links de A. Se muestran asociaciones anteriores durante la carga y permanecen si la consulta falla.
5. P2 a reproducir en DOM — el selector no controlado de contenedor se monta antes de cargar opciones. El contenedor vigente puede no existir entre las primeras opciones y un cambio de ubicación podría enviarlo como vacío. Convertirlo en estado controlado y conservar siempre la opción vigente si el navegador confirma el caso.

No se observó fundamento para declarar fuga entre cuentas en estas superficies: `api.ts` contrasta la revisión de sesión después de `fetch` y después de consumir JSON o Blob. Las carreras anteriores ocurren entre destinos dentro de una misma sesión.

## Matriz de colisiones

| Archivo/superficie | Cruce | Resultado | Integración requerida |
|---|---|---|---|
| `App.tsx` | familias + REF-001 | Conflicto textual confirmado con `merge-file` sobre copias temporales | Integrador: conservar rutas/QR y aislamiento de REF-001, más `onOrder`/`onPlans` de familias. Corregir primero el estado completo de ruta |
| `Views.tsx` | familias + REF-001 | Combinación textual limpia | Revisar semántica: `AssetsView` debe usar `AssetFamilies` y App debe entregar las nuevas callbacks; un merge limpio por sí solo no garantiza esto |
| `DocumentReview.tsx` | cambios locales + REF-001 | Conflicto textual confirmado | Composición manual: conservar navegación por etapas, `useDeferredValue`, selección inicial y estilos locales; añadir IDs de revisión y enlaces a referencias de REF-001 |
| `styles.css` | cambios locales | Sin edición REF-001 observada | Conservar íntegro; revisar que nuevas vistas reutilicen clases válidas y no dependan de reglas ausentes |
| `main.tsx` / `asset-families.css` | familias | Aislado respecto de REF-001 | Mantener import explícito y archivo nuevo juntos |
| `entity.tsx` | familias | Aislado respecto de REF-001 | Revisar adaptador `assetToEntity`; no sustituir primitivas documentales existentes |
| `api.ts` | REF-001 + aislamiento ya integrado | Sin cruce de familias | Preservar revisión de sesión; añadir cobertura dirigida para `apiBlob` sólo si se corrige su transporte |
| `OrderDetail.tsx`, `References.tsx`, `Traceability.tsx` | REF-001 | Nuevas dependencias circulares de componentes (`References` ↔ `Traceability`) | Typecheck las acepta, pero conviene extraer controles compartidos al estabilizar el slice; no es requisito para corregir los defectos P1 |

Orden de integración recomendado:

1. El responsable de REF-001 fija un snapshot reproducible.
2. Corregir las dos carreras P1 y agregar regresiones con promesas diferidas.
3. Corregir ruta QR y links obsoletos; reproducir el selector de contenedor.
4. Integrar familias como diff funcional sobre la base corregida, resolviendo `App.tsx` manualmente.
5. Componer `DocumentReview.tsx` con los cambios locales por comportamiento, no eligiendo un archivo completo.
6. Ejecutar typecheck, tests web, build y navegador dirigido para ruta QR, Atrás/Adelante, cambio rápido de objeto/factura, permisos por rol y navegación entre activo, OT, referencia y ficha.

## Verificación observada

- `npm run typecheck --workspace @astra/web` en el árbol sucio REF-001: PASS.
- `npm test --workspace @astra/web`: PASS, 1 archivo y 5 pruebas. Esas pruebas cubren transporte existente; no reproducen los defectos anteriores.
- `merge-file -p` sobre copias temporales normalizadas: conflicto en `App.tsx` y `DocumentReview.tsx`; combinación textual limpia en `Views.tsx`. No se escribió ningún resultado en los worktrees.
- Sin build, navegador, staging, prueba móvil ni impresión física en esta revisión.

QR continúa siendo un árbol sucio: el informe fija hashes, pero no constituye aceptación ni handoff reproducible. El siguiente gate es corregir sobre un worktree/branch asignado después de que el responsable entregue snapshot estable. `Traceability.tsx` y `References.tsx` deben tener un único propietario; `App.tsx` queda bajo el integrador por sus colisiones de routing y familias.
