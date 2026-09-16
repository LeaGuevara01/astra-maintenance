---
document_id: ASTRA-EVIDENCE-20260916-06
title: "Base y consolidación documental"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Base documental canónica — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — base documental canónica"
  - "docs/VERIFICATION.md#Correcciones documentales — 2026-09-15"
  - "docs/VERIFICATION.md#Consolidación documental anterior"
---

# Base y consolidación documental

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Base documental canónica — 2026-09-16;sha256=a58b33aaab4cbe1594b26a0e68c38d953e1e3e205b8dfa7160dbbba32c89539f -->
## Base documental canónica — 2026-09-16

Rama `docs/ASTRA-documentation-baseline`, creada desde `c8e2efb3854caeca92e09a6a46912827775234b9`. Se agregó `docs/README.md` como entrada y autoridad, `docs/CURRENT-STATUS.md` para distinguir checkout, SHA verificado y SHA desplegado, y `docs/documentation-audit/` con inventario, conflictos, glosario y arquitectura objetivo. Se corrigieron referencias vencidas en README, NEXT-TASK y OPERATIONS; posteriormente el lote 1 movió cuatro documentos históricos a `docs/archive/tasks/` sin eliminarlos.

El corpus permanece separado: su inventario detallado se genera localmente en `.runtime/documentation-audit/` y no se incorpora a Git. Este incremento no modifica API, UI, Prisma, datos ni staging. La validación proporcional es regenerar inventarios, comprobar sus conteos, revisar enlaces locales y ejecutar `git diff --check`.

Segundo incremento de la misma rama: se documentaron las 21 entidades persistidas y sus relaciones en `01-architecture/domain-model.md`, las transiciones implementadas en `state-machines.md`, los constraints/triggers/reglas transaccionales en `invariants.md` y la matriz endpoint × rol × CSRF × idempotencia en `08-reference/permissions-matrix.md`. Las afirmaciones se derivaron de Prisma, migraciones, routers, servicios y pruebas; los campos no modelados permanecen explícitos y no se infirieron capacidades futuras.

Tercer incremento: `03-interfaces/backend-architecture.md` y `frontend-architecture.md` delimitan capas, flujos, responsabilidades y deuda observada; `08-reference/environment-variables.md` clasifica configuración y secretos; `openapi-parity.md` compara las 35 operaciones implementadas con las 25 actualmente representadas. Faltan las diez operaciones documentales en OpenAPI. No se modificó `openapi.ts`: la corrección queda como próximo incremento funcional con prueba de paridad.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — base documental canónica;sha256=216731964f3271dd1b04008daca2e33f6920085f76b886b0b19696f9f25449d9 -->
## 2026-09-16 — base documental canónica

Alcance exclusivamente documental sobre la rama `docs/ASTRA-documentation-baseline`, base `c8e2efb3854caeca92e09a6a46912827775234b9`. Ejecutado `node tools/documentation-audit.mjs`: inventario del sistema y corpus regenerados. Tras documentar modelo, estados, invariantes, permisos, arquitectura de interfaces, configuración y paridad OpenAPI, la comprobación estructural registra 69 artefactos del sistema, 21 modelos Prisma, 35 operaciones HTTP implementadas y 1.110 filas del corpus local. `git diff --check`: PASS. Se revisaron los enlaces relativos añadidos.

No se ejecutaron tests, build, navegador ni despliegue porque no cambió código funcional, esquema ni datos. El SHA funcional verificado y desplegado continúa siendo `a6cf1a8a38aa6670066fa477dfe1f4c96c199d87`; estos cambios documentales todavía no tienen commit y no se atribuyen a ese SHA.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Correcciones documentales — 2026-09-15;sha256=6695bcba002dbc6ae5d97b719baa8608aad10754c4837e758ee12ba10ce7ee10 -->
## Correcciones documentales — 2026-09-15

- Rechazo humano tiene prioridad; número de pieza conocido se conserva ante valores ausentes o A_CONFIRMAR.
- Todos los candidatos con código repetido (normalizado) quedan bloqueados, sin depender del orden del lote.
- Cobertura sin evidencia por página queda null con COBERTURA_DESCONOCIDA; la cola OCR indica que falta determinar las páginas. Evidencia inválida no produce porcentaje.
- Ejecutado: npx vitest run apps/api/test/candidate-import.test.ts apps/api/test/document-intelligence.test.ts --maxWorkers=1: 20/20 pruebas aprobadas.
- Ejecutado: npm run typecheck: API y web aprobados. git diff --check aprobado.
- Sin escrituras de stock, base de datos ni corpus. No se ejecutaron suite PostgreSQL, build ni redespliegue; verification.json conserva su SHA histórico.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Consolidación documental anterior;sha256=6b0ffa65a3b4d659c1d6155bd658f50a6814f0d5e4f8a68bd4910040d5cf3f04 -->
## Consolidación documental anterior

Se unifican HANDOFF.md, VERIFICATION.md y NEXT-TASK.md sin modificar código funcional, dependencias ni datos. La comprobación pertinente es revisar el diff, verificar ausencia de errores de whitespace y confirmar main local/remoto en el mismo SHA tras el push. El resultado final de identidad se informa al cerrar la tarea.

No se requiere repetir la suite, el circuito de roles, PDF ni despliegue por esta actualización documental. Las futuras verificaciones deben centrarse en el comportamiento modificado.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
