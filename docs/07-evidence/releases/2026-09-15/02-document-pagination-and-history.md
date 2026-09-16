---
document_id: ASTRA-EVIDENCE-20260915-02
title: "Paginación e historial documental"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree-on-54beabe
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento autónomo — paginación"
  - "docs/HANDOFF.md#Incremento: historial de revisión"
  - "docs/VERIFICATION.md#Paginación documental — 2026-09-15"
  - "docs/VERIFICATION.md#Historial documental — 2026-09-15"
---

# Paginación e historial documental

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento autónomo — paginación;sha256=e35781d6c0fb3cf6a19949785df291c3ff367fce6f951132b1e0119ba3729742 -->
## Incremento autónomo — paginación

Autorización y secuencia en AUTONOMOUS-DEVELOPMENT.md. Endpoint aditivo /document-candidates/page y navegación anterior/siguiente de 25 candidatos. Sin migración ni cambios de stock. GET anterior permanece compatible. Test de continuación con fechas iguales, alta concurrente, cursor inválido y límite de página. Los tests ahora reinicializan también las tablas documentales dentro de astra_test para evitar contaminación entre casos.
<!-- end-source-block -->

<!-- source-block:docs/HANDOFF.md#Incremento: historial de revisión;sha256=e6293b69dc260825c698c7a0481ea5d500f20b5171849c6c59fb7e9bcac6f23d -->
## Incremento: historial de revisión

Rama feat/document-review-history, base 54beabe (coincidente con origin/main al iniciar). API de historial paginado por versión y UI de 25 decisiones por página; selección/versionado reinicia la navegación y descarta respuestas del historial anterior. Nombre actual del revisor resuelto por ID; ausencias explícitas, sin exponer datos de cuenta. actorId e historial append-only conservados. Listado paginado de candidatos sólo incluye la última decisión; endpoint legado compatible. Sin migraciones ni cambios de stock.

Prueba nueva: historial vacío, autenticación, lectura VIEWER, nombres/IDs, límites/cursor, candidato ausente, continuación frente a decisión concurrente, último estado y compatibilidad. Dos revisores concurrentes producen una sola decisión nueva y un 409 REVIEW_STALE.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#Paginación documental — 2026-09-15;sha256=1fdbba5e631010a36b83bd013e98109386e68018611b54c72150c06d79a76935 -->
## Paginación documental — 2026-09-15
43 pruebas aprobadas sobre astra_test, typecheck API/web y build aprobados. Cobertura nueva: páginas con timestamp igual, alta posterior sin duplicación de continuación, límites/cursor inválidos y compatibilidad del endpoint anterior. Sin migraciones. La prueba browser de paginación no se ejecutó en este incremento.
<!-- end-source-block -->

<!-- source-block:docs/VERIFICATION.md#Historial documental — 2026-09-15;sha256=ca9cf355d0fa7f38a0a8d68c9aecaedbef5c682b5364781f64f84076a8f76d27 -->
## Historial documental — 2026-09-15

Verify.ps1 -SkipInstall aprobado sobre el árbol de trabajo de feat/document-review-history (base 54beabe, dirty=true): 44/44 pruebas, typecheck API/web y build API/web. PostgreSQL aislado astra_test; cuatro migraciones existentes, ninguna pendiente. La prueba añadida cubre paginación por versión, nombres e identidad, autenticación, entradas inválidas, compatibilidad y dos revisores concurrentes (200/409, una sola decisión persistida). git diff --check aprobado.

No se ejecutó navegador ni despliegue de este incremento. verification.json identifica el árbol sucio y no habilita despliegue: se requiere Verify sobre el commit limpio antes de desplegar. No se atribuye esta ejecución a un SHA limpio ni se altera el registro. Próximos checks: navegación dirigida de páginas/historial y despliegue sintético cuando corresponda.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
