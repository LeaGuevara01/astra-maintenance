# ASTRA · Consola de mantenimiento

React 19 y TypeScript. Las reglas de mantenimiento y autorización son responsabilidad de `/api/v1`; la interfaz utiliza las respuestas reales del servidor. Las fuentes tipográficas se empaquetan localmente para funcionar en una red de taller sin acceso a Internet.

Desde la raíz del repositorio:

```powershell
npm ci
$env:WEB_PORT = '4381'
$env:API_TARGET = 'http://localhost:4301'
npm run dev --workspace @astra/web
```

La API debe aceptar el origen del frontend mediante su configuración. El proxy conserva el origen de la petición de login. En despliegues, el proxy inverso sirve `dist/` y `/api` en el mismo origen y devuelve `index.html` para rutas de interfaz.

## Verificación

```powershell
npm run typecheck --workspace @astra/web
npm run build --workspace @astra/web
```

Prueba del circuito contra datos sintéticos:

1. Ingresar como administrador con su contraseña configurada al sembrar datos. Generar una OT desde un activo con plan, distinguiendo servicio objetivo de lectura real.
2. Abrir tareas, registrar ejecución y diferir una tarea no crítica con motivo y fecha. Revisar su procedencia.
3. Reservar materiales, inspeccionar faltantes y registrar consumo real. El ingreso de inventario solo aparece para ADMIN.
4. Registrar controles, comprobar que la API rechaza la liberación con un control crítico no conforme y completar un cierre válido.
5. Descargar PDF A6/A4, abrir vistas de impresión y comprobar el enlace directo `/orders/:id` del QR.
6. Ingresar como técnico: ejecutar OT y actualizar lecturas; no aparecen generación, ingreso ni creación de activos. Como consulta, todos los registros son de lectura.
7. Verificar una sesión vencida, una petición rechazada, una caída de API y el reintento. Un fallo de actualización posterior a una mutación exitosa no vuelve a enviar la mutación.
8. Navegar con teclado, cerrar un diálogo con Escape y probar a 390 px de ancho. Los diálogos nativos conservan foco modal; búsquedas y formularios tienen etiquetas.

Rutas: `/`, `/assets`, `/orders`, `/orders/:id`, `/inventory`, `/plans`, `/audit`. Las rutas se conservan después del login y funcionan con los botones del navegador.

Los identificadores de operación se conservan en memoria ante un fallo de transporte. No recargar la pestaña para reintentar una operación incierta; revisar la orden y auditoría antes de enviar de nuevo tras una recarga completa.
