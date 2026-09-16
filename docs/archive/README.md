# Archivo documental

Esta carpeta conserva documentación histórica o sustituida sin confundirla con los contratos vigentes.

## Movimientos ejecutados

El lote 1 se ejecutó el 2026-09-16 como movimiento exclusivamente documental, sin eliminar contenido ni cambiar comportamiento:

- `tasks/TASK-ASTRA-001.md`
- `tasks/ASTRA-006.md`
- `tasks/ASTRA-007.md`
- `tasks/ASTRA-007-REVIEW.md`

## Principios

- Archivar no significa borrar.
- Git conserva historia, pero cada movimiento debe mantener enlaces desde el índice canónico.
- Un documento sólo se mueve cuando su contenido vigente ya fue incorporado o enlazado desde una fuente canónica.
- El documento archivado recibe estado, fecha, origen y `superseded_by`.
- Los contratos aceptados no se archivan por antigüedad; se sustituyen mediante una decisión explícita.

## Estructura objetivo

```text
docs/archive/
  tasks/
  releases/
  superseded/
  plans/
```

- `tasks/`: entregas ASTRA cerradas.
- `releases/`: handoffs/evidencia ligados a releases cuando se extraigan del registro acumulativo.
- `superseded/`: documentos reemplazados completamente.
- `plans/`: planes consumidos que conservan valor histórico.

## Gate de movimiento

Antes de mover:

1. confirmar que el inventario identifica estado y destino;
2. revisar enlaces entrantes con `rg`;
3. definir documento canónico sucesor;
4. aplicar movimiento con Git preservando contenido;
5. actualizar índices y enlaces;
6. regenerar auditoría y comprobar enlaces;
7. registrar el movimiento en handoff.

No se realizan movimientos masivos en el mismo cambio que modifica reglas de negocio.
