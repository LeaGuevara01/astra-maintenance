# Producto piloto

Usuarios: ADMIN (planifica, genera OT, administra); TECHNICIAN (ejecuta, reserva/consume, checkpoints y cierre); VIEWER (consulta). Autenticación por sesión servidor y autorización en API.

P01 Activos y lecturas monotónicas. P02 Plan y tareas versionadas con procedencia. P03 Generación idempotente por activo/plan/objetivo. P04 Frecuencias 300/600/900/1200 por tarea. P05 Reserva y consumo transaccional sin stock negativo. P06 Ningún resultado de cierre puede cerrar una OT con checkpoint crítico fallido o pendiente; NOT_OPERATIVE documenta el estado del activo, pero no omite este bloqueo. P07 Snapshots históricos inmutables. P08 Pendientes con motivo/responsable/fecha y continuidad. P09 Tarjeta A6 y A4 cuatro A6 deterministas. P10 Trazabilidad y roles.

Alcance: circuito preventivo con datos sintéticos; ninguna especificación OEM inventada. Campos sin fuente: A_CONFIRMAR. Anclaje NOMINAL por defecto; lectura objetivo y real separadas. Correctivos completos, compras/contabilidad y nube fuera de esta entrega.
