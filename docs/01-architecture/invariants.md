# Invariantes de dominio y persistencia

Estado: consolidación de contrato, servicios, migraciones y pruebas. “Base de datos” significa constraint, índice o trigger; “servicio” significa validación transaccional de API.

## Activos y lecturas

| Invariante | Capa | Evidencia |
|---|---|---|
| Lectura y medidor no negativos | Validación + base | `meter` Zod; `asset_meter_nonnegative` |
| Una nueva lectura no disminuye el medidor | Servicio con lock | `recordReading`, `METER_DECREASE` |
| Lecturas son append-only | Base | trigger `reading_append_only` |
| Crear activo registra lectura inicial y auditoría | Transacción | `POST /assets` |

La unidad del medidor no está modelada. No debe asumirse “horas” para todo activo fuera del piloto actual.

## Planes y generación

- Frecuencia de tarea positiva; cantidad opcional positiva.
- Plan identificado por `(code, revision)`; código de tarea único dentro del plan.
- Sólo un plan `ACTIVE` permite generar.
- Una tarea vence cuando su frecuencia divide exactamente el objetivo nominal.
- Objetivo posterior debe avanzar respecto de la última OT.
- Sólo una OT `OPEN` por activo, reforzada con índice parcial único.
- `(assetId, planId, targetMeter)` evita duplicar el mismo servicio.
- Lectura real y objetivo nominal permanecen separados.

## Stock

| Invariante | Base | Servicio |
|---|---:|---:|
| `onHand >= 0` | Sí | Sí |
| `0 <= reserved <= onHand` | Sí | Sí |
| Cantidades previstas positivas | Sí | Validación de origen |
| `used + reserved <= planned` | Sí | Sí |
| Movimientos con cantidad positiva | Sí | Sí |
| Consumo no toma reservas ajenas | — | Locks y cálculo de stock libre |
| Cierre libera reservas no usadas | — | Misma transacción de cierre |
| Recepción repetida no duplica ingreso | Clave persistida | Referencia natural por parte |

Las transacciones usan aislamiento serializable, locks deterministas de partes y hasta cinco reintentos para conflictos reconocidos.

## Ejecución y cierre

- Sólo una OT abierta puede modificarse.
- Tareas bloqueantes deben quedar `DONE`.
- Tareas obligatorias no pueden permanecer `PENDING`.
- Diferimiento exige motivo, fecha y actor; tareas diferidas excluyen resultado `OPERATIVE`.
- Checkpoint crítico sólo admite `PENDING`, `PASS` o `FAIL`; debe estar `PASS` para cualquier cierre.
- Resultado distinto de `OPERATIVE` exige notas.
- Tarea realizada con material requiere consumo real suficiente.
- Cierre actualiza OT y estado del activo, libera reservas y audita en una transacción.
- Una OT cerrada y sus tareas, materiales y checkpoints son inmutables por triggers.
- Auditoría, movimientos, lecturas y enlaces de continuidad son append-only.

## Idempotencia y concurrencia

- Las claves aceptan 8–160 caracteres del conjunto documentado por la expresión regular del servicio.
- Scope + clave es único.
- Reusar clave con el mismo cuerpo devuelve la respuesta guardada.
- Reusar clave con otro cuerpo devuelve `IDEMPOTENCY_CONFLICT`.
- Un advisory lock serializa solicitudes idénticas antes de que exista el recurso.
- Generación, reserva, consumo, cierre, creación/revisión documental y derivación usan idempotencia persistida.
- Recepción usa hash de la referencia como clave natural.
- Updates de tarea/checkpoint y dry-run no tienen clave idempotente persistida.

## Evidencia documental

- `DocumentRevision` es única por fuente y SHA-256 e inmutable.
- Un SHA nuevo es otra revisión; no hereda aprobación.
- `DocumentReview` y `DocumentFindingReview` son append-only.
- Revisión de candidato usa versión optimista y rechaza decisiones stale.
- `DocumentFinding.stockEffect` sólo admite `NONE` en la base.
- Revisar, comparar o derivar no aplica catálogo ni escribe stock.
- Derivación sólo acepta `PART_CANDIDATE` con código distinto de `A_CONFIRMAR`.
- PN desconocido se conserva como `A_CONFIRMAR`.
- Fuente, hash y locator acompañan la propuesta.

## Seguridad

- Toda ruta de negocio exige sesión vigente y usuario activo.
- Toda mutación exige origen exacto y CSRF, además del rol aplicable.
- Passwords usan scrypt con salt; tokens de sesión no se guardan en claro.
- Cookies inseguras sólo son válidas en configuraciones loopback permitidas.
- Seed sintético rechaza producción y exige contraseñas separadas.

## Vacíos que no deben inferirse

- Los strings de estado no están todos respaldados por enums Prisma.
- No existe foreign key desde `actorId` hacia `User` en varios registros.
- No existe cancelación/reapertura de OT ni reversión de consumo.
- No existe aplicación transaccional de candidatos al catálogo.
- No existe validación automática de equivalencia OEM o aplicabilidad por unidad.
