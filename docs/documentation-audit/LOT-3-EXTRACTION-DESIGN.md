# Diseño de extracción del lote 3

Estado: ejecutado el 2026-09-16.

Resultado: doce registros creados, 35 bloques verificados por SHA-256 normalizado y `HANDOFF.md`/`VERIFICATION.md` compactados como índices. La única sección retenida literalmente en el índice de verificación fue `Pendientes de verificación`.

## Objetivo

Reducir `HANDOFF.md` y `VERIFICATION.md` a índices vigentes y trasladar su cronología a registros por incremento, sin perder texto, fechas, SHA, comandos, resultados, límites ni bloqueos. Este lote no cambia código, datos, staging ni corpus técnico.

## Decisión de estructura

Cada incremento tendrá un único registro bajo:

```text
docs/07-evidence/releases/
  README.md
  2026-09-15/
    01-document-review-persistence.md
    02-document-pagination-and-history.md
    03-source-review-queue.md
    04-document-analysis-dry-run.md
  2026-09-16/
    01-assisted-findings.md
    02-provenance-and-derivation.md
    03-catalog-row-segmentation.md
    04-equipment-references.md
    05-ui-entity-slice.md
    06-documentation-baseline.md
    07-openapi-parity.md
    08-documentation-archive-lots.md
```

No se separarán artificialmente “handoff” y “verification” en archivos paralelos. Cada registro tendrá secciones distintas para contexto y evidencia, evitando duplicación pero preservando la naturaleza de cada texto.

## Contrato de cada registro

```yaml
---
document_id: ASTRA-EVIDENCE-YYYYMMDD-NN
title: ...
type: evidence
status: historical|current-uncommitted
owner: integrator
updated_at: YYYY-MM-DD
applies_to: sha|working-tree-on-sha
staging: not-deployed|historical|current
source_sections:
  - HANDOFF.md#...
  - VERIFICATION.md#...
---
```

Después del front matter:

1. `Contexto y resultado`: texto literal extraído de `HANDOFF.md`.
2. `Verificación ejecutada`: texto literal extraído de `VERIFICATION.md`.
3. `Límites y pendientes`: sólo se agrega cuando el texto de origen ya declara esos límites; no se inventan conclusiones.
4. `Relaciones`: enlaces a contratos, código y registros vecinos.

`applies_to` nunca se infiere: si la fuente no prueba un SHA limpio se usa `working-tree-on-<base>` o `A_CONFIRMAR`.

## Mapa mecánico de extracción

| Registro destino | Secciones de `HANDOFF.md` | Secciones de `VERIFICATION.md` | Identidad |
|---|---|---|---|
| `2026-09-15/01-document-review-persistence.md` | carga autorizada del corpus; antecedentes de revisión persistente previos a los incrementos fechados | revisión persistente; cierre del incremento persistente; base histórica correspondiente | SHA citados en el texto; no unificar identidades |
| `2026-09-15/02-document-pagination-and-history.md` | paginación; historial de revisión | paginación documental; historial documental | SHA/ramas citados o `A_CONFIRMAR` |
| `2026-09-15/03-source-review-queue.md` | cola de revisión por fuente | cola de revisión por fuente | `2b6cd689...` |
| `2026-09-15/04-document-analysis-dry-run.md` | analizador documental dry-run | analizador documental dry-run | árbol/fecha indicados en origen |
| `2026-09-16/01-assisted-findings.md` | hallazgos asistidos persistentes | hallazgos asistidos persistentes | árbol verificado, sin atribuir staging |
| `2026-09-16/02-provenance-and-derivation.md` | procedencia y derivación asistida | procedencia y derivación asistida | árbol verificado |
| `2026-09-16/03-catalog-row-segmentation.md` | segmentación por ítem | segmentación por ítem | árbol verificado |
| `2026-09-16/04-equipment-references.md` | referencias de equipo/manual | referencias de equipo/manual | árbol con prueba dirigida |
| `2026-09-16/05-ui-entity-slice.md` | vertical slice UI de entidades | vertical slice UI de entidades | separar runtime aislado de staging `a6cf1a8` |
| `2026-09-16/06-documentation-baseline.md` | base documental canónica | base documental canónica; correcciones y consolidación documental | `working-tree-on-c8e2efb` cuando corresponda |
| `2026-09-16/07-openapi-parity.md` | ASTRA-DOC-001 | ASTRA-DOC-001 | `working-tree-on-c8e2efb`; no desplegado |
| `2026-09-16/08-documentation-archive-lots.md` | archivo lote 1; revisión lote 2 | archivo lote 1; revisión lote 2 | cambio documental sin SHA limpio |

Disposición de las secciones transversales de `VERIFICATION.md`:

| Sección actual | Destino |
|---|---|
| `Base anterior y staging comprobado` | Se reparte sin reescritura entre los registros cuyo SHA identifica; si un párrafo abarca varios SHA queda en `2026-09-15/01-document-review-persistence.md` con `applies_to: multiple-historical-sha` |
| `Evidencia histórica reutilizable` | `2026-09-15/01-document-review-persistence.md`, marcada como resumen histórico, no verificación nueva |
| `Correcciones documentales` y `Consolidación documental anterior` | `2026-09-16/06-documentation-baseline.md` |
| `Pendientes de verificación` | Permanece en `VERIFICATION.md` y se sincroniza con `verification-index.md` |

El encabezado y el párrafo introductorio de ambos archivos permanecen en sus índices. Así, cada sección actual tiene destino o retención explícita antes de ejecutar la extracción.

## Secciones que permanecen en los índices

`HANDOFF.md` conservará únicamente:

- identidad de checkout, SHA base y rama documental;
- estado de continuidad resumido;
- tabla con incremento, fecha, identidad, estado y enlace al registro;
- siguiente acción enlazada a `NEXT-TASK.md`;
- advertencia de que un registro histórico no prueba el runtime actual.

`VERIFICATION.md` conservará únicamente:

- último árbol/SHA verificado y alcance exacto;
- staging observado por separado;
- checks actualmente pendientes;
- tabla de evidencia enlazada a los registros;
- criterios de lectura de PASS, staging y evidencia sintética.

La sección actual `Pendientes de verificación` se reconcilia con `07-evidence/verification-index.md`; no se archiva como resultado cerrado mientras siga pendiente.

## Compatibilidad de enlaces

- Las rutas `docs/HANDOFF.md` y `docs/VERIFICATION.md` no cambian.
- Sus índices enlazarán todos los registros extraídos.
- Los enlaces sin anchor continuarán funcionando.
- Antes de retirar headings se buscarán enlaces `HANDOFF.md#...` y `VERIFICATION.md#...`; si existen, se conservará un anchor HTML de compatibilidad junto al enlace nuevo.
- `07-evidence/verification-index.md` será la tabla de navegación canónica; `VERIFICATION.md` seguirá siendo la entrada compatible requerida por contratos y runbooks.

## Reglas de preservación

1. Copiar cada bloque desde su heading hasta el heading del mismo o mayor nivel siguiente.
2. No corregir cifras, SHA, comandos o conclusiones dentro del bloque durante la extracción.
3. Las aclaraciones nuevas van fuera del bloque y declaran fecha y motivo.
4. Normalizar sólo finales de línea para el repositorio; conservar el texto lógico y registrar hashes SHA-256 de los bloques antes/después.
5. No combinar evidencias de SHA distintos bajo un único `applies_to`.
6. No convertir verificaciones parciales, browser local o datos sintéticos en staging/producción.
7. No mover evidencia local `.runtime`, capturas, dumps ni originales del corpus a Git.

## Manifiesto de migración

La ejecución generará temporalmente `.runtime/documentation-audit/lot-3-manifest.json` con:

- archivo y rango de líneas de origen;
- heading y slug destino;
- SHA-256 del bloque normalizado;
- identidad declarada y estado de staging;
- resultado de copia, enlace e integridad.

El manifiesto local no se versiona porque los rangos cambiarán al compactar los índices. El mapa lógico y los destinos sí quedan versionados en este diseño.

## Secuencia ejecutada

1. Congelar headings y calcular hashes de los bloques fuente. Completado.
2. Crear `07-evidence/releases/README.md` y los doce registros destino. Completado.
3. Copiar literalmente los bloques y agregar únicamente metadata/relaciones. Completado.
4. Comparar hashes normalizados fuente→destino. Completado: 35/35.
5. Convertir `HANDOFF.md` y `VERIFICATION.md` en índices, manteniendo pendientes vigentes. Completado.
6. Actualizar `verification-index.md`, README, política documental y referencias entrantes. Completado.
7. Regenerar auditoría y comprobar enlaces, markers y `git diff --check`. Completado.
8. Revisar el diff antes de considerar cualquier movimiento adicional o commit. Pendiente de commit; no bloquea la integridad documental.

## Criterios de aceptación

- Doce registros creados y enlazados.
- Cien por ciento de secciones asignadas o justificadas como contenido vigente del índice.
- Hash lógico coincidente para cada bloque extraído.
- Cero enlaces/anchors locales rotos.
- Ningún SHA o staging promovido por inferencia.
- `HANDOFF.md` y `VERIFICATION.md` continúan siendo puntos de entrada válidos.
- Inventario documental regenerado y cambio de conteos explicado.
- Diff exclusivamente documental para este lote.

## No incluido

- Reescribir la historia para uniformar estilo.
- Ejecutar nuevamente pruebas funcionales o staging.
- Mover `PLAN-STATUS.md`, roadmaps o contratos.
- Archivar registros recién extraídos: son evidencia navegable, no residuos.
