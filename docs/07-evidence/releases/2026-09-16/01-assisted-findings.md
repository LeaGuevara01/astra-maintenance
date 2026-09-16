---
document_id: ASTRA-EVIDENCE-20260916-01
title: "Hallazgos asistidos persistentes"
type: evidence
status: current-uncommitted
owner: integrator
updated_at: 2026-09-16
applies_to: working-tree
staging: not-deployed
source_sections:
  - "docs/HANDOFF.md#Incremento: hallazgos asistidos persistentes — 2026-09-16"
  - "docs/VERIFICATION.md#2026-09-16 — hallazgos asistidos persistentes"
---

# Hallazgos asistidos persistentes

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

<!-- source-block:docs/HANDOFF.md#Incremento: hallazgos asistidos persistentes — 2026-09-16;sha256=a94bb67ebd510abb63e51719957e2c6e89e65d4597054986a0a4d1cac6cd41ac -->
## Incremento: hallazgos asistidos persistentes — 2026-09-16

Continuación del plan automático de revisión documental. Agregadas tablas DocumentAnalysisRun, DocumentFinding y DocumentFindingReview con migración 20260916021000_document_analysis_findings. Los hallazgos nacen A_CONFIRMAR, stockEffect NONE, enlazados a DocumentRevision por sourceId/sha256 existentes. Las revisiones humanas de hallazgos son append-only e inmutables por trigger; el estado visible del hallazgo permite filtrar A_CONFIRMAR, CREATE_CANDIDATE, REJECTED, OCR_REQUIRED y CONFLICT.

API nueva: GET /document-candidates/findings/page para cola filtrable por decisión, tipo, fuente y confianza; POST /document-candidates/findings/:id/reviews para ADMIN/TECHNICIAN con motivo obligatorio e idempotencia. CREATE_CANDIDATE no crea candidato todavía: sólo deja marcada la intención para una derivación explícita posterior con locator, hash y aplicabilidad. VIEWER sólo consulta.

UI /documents ahora suma “Hallazgos asistidos por IA” debajo de la cola de fuentes. Muestra código, PN A_CONFIRMAR, locator, aplicabilidad, hash de revisión, snippet y advertencias. ADMIN/TECHNICIAN pueden decidir con motivo. La pantalla conserva el aviso de sin aplicación al catálogo ni stock.

El comando npm run documents:analyze-sample sigue siendo dry-run por defecto y agrega -- --persist para guardar corridas/hallazgos contra revisiones ya cargadas. Bloquea la reescritura de una misma analyzerVersion si ya existen hallazgos, para no destruir revisión humana. No se cargó texto completo ni binarios en la base.
<!-- end-source-block -->

## Verificación ejecutada

<!-- source-block:docs/VERIFICATION.md#2026-09-16 — hallazgos asistidos persistentes;sha256=01fc8dcbe20291935c5ecd6d7d43250e6c8b62f908fd5144f0af46aa21fe1927 -->
## 2026-09-16 — hallazgos asistidos persistentes

Comando: scripts/Verify.ps1 -SkipInstall.
Resultado: PASS. Migración 20260916021000_document_analysis_findings aplicada en astra_test. Prisma generate OK, typecheck API/web OK, tests API 49/49 OK, build API/web OK. Aviso operativo: puerto db test reasignado 50387->50388 por ocupación local.

Cobertura agregada: cola GET /document-candidates/findings/page autenticada y paginada, cursor inválido, VIEWER bloqueado en POST, motivo obligatorio, dos revisiones append-only, filtro por estado humano, inmutabilidad de DocumentFindingReview, y conteos de DocumentCandidate/StockMovement en cero.
<!-- end-source-block -->

## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
