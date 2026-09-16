# Política documental

Estado: vigente para la consolidación iniciada en `docs/ASTRA-documentation-baseline`.

## Objetivo

Mantener una fuente canónica por concepto, separar estado de evidencia histórica y evitar que el corpus externo se confunda con contratos del sistema.

## Metadatos mínimos

Todo documento canónico nuevo debe declarar, en texto o front matter:

| Campo | Regla |
|---|---|
| `document_id` | Identificador estable y único |
| `title` | Nombre humano sin usar la fecha como único contexto |
| `type` | `contract`, `decision`, `architecture`, `guide`, `runbook`, `plan`, `evidence` o `archive` |
| `status` | `draft`, `current`, `partial`, `superseded` o `archived` |
| `owner` | Rol responsable; no confundir con autor Git |
| `version` | Versión editorial o SHA/release aplicable |
| `updated_at` | Fecha de revisión |
| `applies_to` | Módulo, rama, SHA o release |
| `supersedes` | Documentos reemplazados, si existen |
| `related_code` | Rutas relevantes, sin copiar implementación |
| `technical_corpus_references` | Sólo IDs/hash/locator; nunca originales incrustados |

Los documentos actuales se migrarán gradualmente a este formato. La ausencia de metadatos no invalida retroactivamente un contrato aceptado.

## Estados

- `draft`: propuesta sin autoridad.
- `current`: contenido vigente y reconciliado.
- `partial`: mezcla contenido vigente y trabajo pendiente claramente señalado.
- `superseded`: reemplazado por otro documento identificado.
- `archived`: evidencia histórica sin autoridad operativa actual.

No se elimina un documento por estar obsoleto. Primero se registra `superseded_by`, se corrigen enlaces y se preserva su historia Git.

## Autoridad y conflictos

El orden de autoridad está definido en `docs/README.md`. Una contradicción significativa debe:

1. recibir un ID `CONFLICT-nnn`;
2. citar documentos, código y evidencia relevantes;
3. permanecer visible hasta decisión explícita;
4. actualizar contrato, implementación o ambos;
5. registrar qué fuente quedó sustituida.

No se normalizan silenciosamente nombres, reglas de negocio, estados, intervalos o permisos.

## Versiones y evidencia

- Checkout HEAD, SHA verificado y SHA desplegado son identidades distintas.
- Un árbol sucio puede estar verificado, pero no recibe un SHA atribuible hasta ser commit limpio y volver a comprobarse cuando el riesgo lo requiera.
- La evidencia registra comando, resultado, fecha, entorno y alcance.
- Un bloqueo se documenta como `BLOCKED`, nunca como prueba aprobada.
- Evidencia histórica puede reutilizarse sólo para comportamiento no modificado y conservando SHA/alcance.

## Planes y estado actual

- `CURRENT-STATUS.md` contiene únicamente la situación vigente.
- `NEXT-TASK.md` no debe describir como futuro algo ya implementado.
- `HANDOFF.md` conserva identidad de continuidad e índice de incrementos.
- `VERIFICATION.md` conserva el estado verificable actual y checks pendientes.
- `07-evidence/releases/` conserva cronología, decisiones, comandos y resultados por incremento/SHA.
- Roadmaps no prueban implementación.

## Enlaces y duplicación

- Enlazar al documento canónico en vez de copiar secciones completas.
- README raíz sólo orienta; no replica contratos.
- README de aplicación describe operación local de ese componente.
- Solapamiento léxico es una señal de revisión, no duplicación automática.
- Todo movimiento físico conserva un enlace de compatibilidad durante la migración.

## Revisión

Revisar un documento canónico cuando cambie su contrato, módulo relacionado o evidencia de despliegue. Como mínimo, ejecutar:

```powershell
node tools/documentation-audit.mjs
git diff --check
```

Si se modifica comportamiento, aplicar además las pruebas exigidas por los paths afectados.
