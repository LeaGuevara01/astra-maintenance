# Auditoría documental integral — base ASTRA siguiente versión

Auditoría no destructiva iniciada el 2026-09-16 sobre `feat/document-review-history` y reconciliada después de integrar PR #8. La regeneración post-deploy se ejecuta desde `chore/ASTRA-DOC-002-post-deploy-plan`, cuya base `a0c9178d668305bc33bc8bacdad9f0ec529e4653` coincide con `main`, `origin/main` y staging sintético al iniciar el incremento. El inventario registra por separado el HEAD usado al generar sus salidas; el commit que incorpora esos archivos puede ser posterior. La documentación del sistema y el corpus externo se contabilizan por separado.

## Entregables

- `system-inventory.csv`: registro maestro reproducible de artefactos documentales versionados.
- `summary.json`: conteos por estado, dominio, módulo, tipo y extensión.
- `overlap-candidates.csv`: pares con solapamiento léxico; es una cola de revisión, no una declaración automática de duplicado.
- `CONFLICTS-AND-GAPS.md`: contradicciones, contenido vencido y conocimiento implementado no documentado.
- `GLOSSARY.md`: vocabulario canónico inicial y equivalencias históricas.
- `TARGET-ARCHITECTURE.md`: arquitectura documental propuesta y plan de migración.
- `tools/documentation-audit.mjs`: regeneración de métricas e inventarios.
- `.runtime/documentation-audit/technical-corpus-inventory.csv`: inventario local detallado y separado del corpus, deliberadamente fuera de Git.

## Alcance y método

Se revisaron los 110 archivos versionados visibles al inicio, los nuevos entregables de esta auditoría, el historial de todas las ramas locales/remotas disponibles, documentos eliminados, README, instrucciones GitHub, contratos, ADR, planes, migraciones, esquema Prisma, configuración y fuentes relevantes de API/UI/tests/scripts. Las extensiones documentales pedidas que no existen versionadas (`mdx`, `txt`, `rst`, `adoc`, `csv`, `drawio`, `puml`, `mermaid`, `pdf`) se registran como ausencia, no como cero corpus externo.

No fue posible consultar Issues y Pull Requests actuales: `gh` no está instalado y la vista web del repositorio no expuso contenido sin autenticación. El historial Git y las ramas remotas locales sí fueron inspeccionados. Esta limitación impide llamar “integral de GitHub” al resultado hasta exportar esos metadatos.

Ramas visibles: `main`, ramas ASTRA-001/002/003/005/006, `feat/document-review-history` y cuatro referencias remotas Copilot. Se detectó `docs/ONBOARDING.md` en el commit histórico `d45f673`, ausente del árbol actual; debe tratarse como fuente histórica recuperable, no restaurarse automáticamente. Los commits relevantes se reflejan en `last_git_change` y el historial por archivo, mientras que los documentos de tareas anteriores se clasifican como históricos aunque sigan presentes.

## Conteo del sistema

| Métrica | Cantidad | Interpretación |
|---|---:|---|
| Archivos versionados del checkout base | 110 | Universo Git antes de esta auditoría |
| Artefactos documentales inventariados | 97 | Incluye registros por incremento y el plan ASTRA-010; excluye los tres índices autogenerados |
| Documentos narrativos | 77 | Markdown existente y producido durante la consolidación |
| Canónicos propuestos | 33 | Contratos, índices, políticas, referencias, runbooks y matrices actuales |
| Vigentes | 70 | Incluye la base documental, configuración, migraciones e índice de releases |
| Parcialmente vigentes | 10 | Planes/diseños con partes ejecutadas o aún abiertas, incluido ASTRA-010 |
| Históricos | 17 | Cuatro tareas archivadas y trece registros de evidencia por incremento |
| Obsoletos como documento completo | 0 | Hay secciones obsoletas, detalladas por conflicto |
| Duplicados exactos | 0 | Por SHA-256 del contenido actual |
| Pares candidatos por solapamiento | 28 | Excluye releases históricos deliberadamente relacionados; los restantes requieren revisión humana |
| Sin versión explícita | 95 | El SHA Git actúa como versión efectiva sólo para los ya versionados |
| Sin autor Git identificable | 2 | Son los dos documentos nuevos de ASTRA-DOC-002 antes del commit |
| Sin propietario explícito | 97 | No existe `CODEOWNERS`; el front matter de releases no sustituye ownership global |

`withoutClearOwner` mide responsabilidad documental, no autoría Git. `withoutGitAuthor` conserva por separado la ausencia de metadatos Git para los informes nuevos.

## Conteo del corpus externo

El índice local separado contiene 1.110 fuentes seleccionadas y 1.080 hashes únicos: 626 `TECHNICAL_REFERENCE`, 80 `MANUAL_OR_CATALOG`, 394 `COMMERCIAL_HISTORY` y 10 `INTERNAL_WORKFLOW`. Hay 30 filas duplicadas por hash, 634 con texto extraído, 104 `OCR_REQUIRED` y 342 `VISUAL_REVIEW_REQUIRED`.

Los 10 `INTERNAL_WORKFLOW` son una anomalía de clasificación: deben salir del corpus o justificarse como fuente externa. Los 394 antecedentes comerciales se mantienen separados del sistema y también de las afirmaciones OEM. Extracción de texto, nombre de archivo, factura o catálogo no valida aplicabilidad, equivalencia, precio vigente, stock ni verdad contable.

## Autoridad documental actual

1. `PRODUCT.md`, `API-CONTRACT.md` y ADR aceptados.
2. Decisiones humanas registradas para la tarea vigente.
3. Implementación y pruebas verificadas.
4. Registros de `07-evidence/releases/` ligados a SHA/árbol; HANDOFF y VERIFICATION como índices.
5. Roadmaps y planes.
6. README, checkpoints históricos y conversaciones.

El código no se vuelve contrato por sí solo. Cuando implementación y contrato divergen, se registra un conflicto y se requiere reconciliación.

## Decisión de depuración

La auditoría inicial fue no destructiva. La consolidación posterior ejecutó los lotes 1 y 3: cuatro tareas se movieron sin eliminar contenido y la cronología se extrajo a registros con hashes verificados. El lote 2 se retuvo por contener alcance pendiente. La regeneración se ejecuta con:

```powershell
node tools/documentation-audit.mjs
```

## Revisión del incremento integrado

El trabajo se separó en dos grupos y ambos fueron integrados por PR #8 en `a0c9178`: ASTRA-DOC-001 quedó en `7cb84e8` y la consolidación documental en `425c7f2`.

### Grupo funcional ASTRA-DOC-001

- `apps/api/src/openapi.ts`
- `apps/api/test/openapi-parity.test.ts`

Evidencia: prueba dirigida posterior al commit 2/2 y verificación limpia del merge `a0c9178` con 54/54, migraciones, typecheck y build API/web. Está incluido en staging `a0c9178`.

### Grupo de consolidación documental

- índices, políticas, arquitectura, referencias y runbooks bajo `docs/`;
- cuatro movimientos a `docs/archive/tasks/`;
- doce registros bajo `docs/07-evidence/releases/`;
- `tools/documentation-audit.mjs` y `tools/extract-documentation-evidence.mjs`;
- inventario, resumen y candidatos de solapamiento regenerados.

Evidencia: 35/35 bloques extraídos con hash válido, enlaces Markdown locales PASS, cero artefactos sin clasificar y `git diff --check` PASS. La revisión visual fue omitida por decisión del usuario y no es necesaria para validar esta reorganización.

Orden aplicado: primero el cambio funcional con su prueba; después la consolidación documental completa. Los movimientos y sus enlaces permanecieron juntos. Push, PR, merge y staging sintético se completaron; producción no fue desplegada.
