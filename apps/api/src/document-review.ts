import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { roles } from './auth.js';
import { audit, idempotent, transaction } from './db.js';
import { assert } from './errors.js';
import { dryRunCandidateImport } from './candidate-import.js';

const text = (max: number) => z.string().trim().min(1).max(max);
const include = { revision: true, reviews: { orderBy: { version: 'desc' as const } } };
const sourceStatuses = ['TEXT_EXTRACTED', 'OCR_REQUIRED', 'VISUAL_REVIEW_REQUIRED', 'DUPLICATE', 'A_CONFIRMAR'] as const;
const sourcePriorities = ['ALTA', 'MEDIA', 'BAJA'] as const;
const findingDecisions = ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'] as const;
type SourceStatus = typeof sourceStatuses[number];
type SourcePriority = typeof sourcePriorities[number];
type SourceQueueMetadata = { kind?: string; extractionStatus?: string; pages?: number | null; pagesNeedingOCR?: number[]; reviewStatus?: string };
const familyRules = [
  ['John Deere', /\b(john\s*deere|jd|[as]t\d{5,6}|an\d{6})\b/i],
  ['Case IH / Puma', /\b(case\s*ih|puma|cnh)\b/i],
  ['Toyota Hilux', /\b(hilux|toyota)\b/i],
  ['Siembra / PLA / MXY', /\b(pla|mxy|siembra|dosificador|richiger)\b/i],
  ['Filtros y equivalencias', /\b(filtro|equivalenc)\b/i],
  ['Rodamientos y retenes', /\b(rodamiento|reten|ret[eé]n)\b/i],
  ['Lubricantes y seguridad', /\b(gulf|lubric|aceite|hoja[_\s-]*seguridad|ficha[_\s-]*t[eé]cnica)\b/i],
  ['Herramientas y taller', /\b(herramienta|taller|bremen|tecnomax)\b/i],
  ['Eléctrico / Kalop', /\b(kalop|cable|fotocontrol|grampa)\b/i],
] as const;
function metadata(details: unknown): SourceQueueMetadata {
  if (!details || typeof details !== 'object') return {};
  const raw = details as Record<string, unknown>;
  return {
    kind: typeof raw.kind === 'string' ? raw.kind : undefined,
    extractionStatus: typeof raw.extractionStatus === 'string' ? raw.extractionStatus : undefined,
    pages: typeof raw.pages === 'number' ? raw.pages : null,
    pagesNeedingOCR: Array.isArray(raw.pagesNeedingOCR) ? raw.pagesNeedingOCR.filter((v): v is number => typeof v === 'number') : [],
    reviewStatus: typeof raw.reviewStatus === 'string' ? raw.reviewStatus : 'A_CONFIRMAR',
  };
}
function sourceFamily(title: string) {
  return familyRules.find(([, pattern]) => pattern.test(title))?.[0] ?? 'A clasificar';
}
function sourcePriority(status: SourceStatus, title: string, hasCandidates: boolean): SourcePriority {
  if (hasCandidates || status === 'DUPLICATE') return 'BAJA';
  if (status === 'OCR_REQUIRED' || status === 'VISUAL_REVIEW_REQUIRED') return 'ALTA';
  return sourceFamily(title) === 'A clasificar' ? 'MEDIA' : 'ALTA';
}
export function documentReviewRouter(db: PrismaClient) {
  const router = Router();
  router.get('/', async (_req, res) => res.json(await db.documentCandidate.findMany({ include, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: 200 })));
  router.get('/sources/page', async (req, res) => {
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(25),
      cursor: text(100).optional(),
      extractionStatus: z.enum(sourceStatuses).optional(),
      family: z.string().trim().max(80).optional(),
      priority: z.enum(sourcePriorities).optional(),
    }).strict().parse(req.query);
    const anchor = query.cursor ? await db.documentRevision.findUnique({ where: { id: query.cursor }, select: { id: true, createdAt: true } }) : null;
    assert(!query.cursor || anchor, 400, 'INVALID_CURSOR', 'El cursor no corresponde a una fuente.');
    const rows = await db.documentRevision.findMany({
      include: { candidates: { select: { id: true }, take: 1 } },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: 500,
      where: anchor ? { OR: [{ createdAt: { lt: anchor.createdAt } }, { createdAt: anchor.createdAt, id: { gt: anchor.id } }] } : undefined,
    });
    const audits = await db.audit.findMany({ where: { action: 'DOCUMENT_SOURCE_IMPORTED', entityId: { in: rows.map(row => row.id) } }, select: { entityId: true, details: true } });
    const auditByRevision = new Map(audits.map(row => [row.entityId, metadata(row.details)]));
    const filtered = rows.map(row => {
      const meta = auditByRevision.get(row.id) ?? {};
      const extractionStatus = (sourceStatuses as readonly string[]).includes(meta.extractionStatus ?? '') ? meta.extractionStatus as SourceStatus : 'A_CONFIRMAR';
      const family = sourceFamily(row.title);
      const priority = sourcePriority(extractionStatus, row.title, row.candidates.length > 0);
      return {
        id: row.id,
        sourceId: row.sourceId,
        title: row.title,
        sha256: row.sha256,
        createdAt: row.createdAt,
        kind: meta.kind ?? 'A_CONFIRMAR',
        extractionStatus,
        pages: meta.pages ?? null,
        pagesNeedingOCR: meta.pagesNeedingOCR ?? [],
        reviewStatus: meta.reviewStatus ?? 'A_CONFIRMAR',
        family,
        priority,
        hasCandidates: row.candidates.length > 0,
      };
    }).filter(row =>
      (!query.extractionStatus || row.extractionStatus === query.extractionStatus) &&
      (!query.family || row.family.toLocaleLowerCase('es-AR').includes(query.family.toLocaleLowerCase('es-AR'))) &&
      (!query.priority || row.priority === query.priority)
    );
    const page = filtered.slice(0, query.limit + 1);
    const items = page.slice(0, query.limit);
    res.json({ items, nextCursor: page.length > query.limit ? items[items.length - 1].id : null });
  });

  router.get('/findings/page', async (req, res) => {
    const query = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(25),
      cursor: text(100).optional(),
      decision: z.enum(findingDecisions).optional(),
      kind: z.string().trim().max(80).optional(),
      sourceId: z.string().trim().max(120).optional(),
      confidence: z.string().trim().max(30).optional(),
      category: z.string().trim().max(80).optional(),
      relevance: z.string().trim().max(30).optional(),
      provenanceKind: z.string().trim().max(80).optional(),
    }).strict().parse(req.query);
    const anchor = query.cursor ? await db.documentFinding.findUnique({ where: { id: query.cursor }, select: { id: true, createdAt: true } }) : null;
    assert(!query.cursor || anchor, 400, 'INVALID_CURSOR', 'El cursor no corresponde a un hallazgo.');
    const where = {
      ...(query.decision ? { reviewStatus: query.decision } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.confidence ? { confidence: query.confidence } : {}),
      ...(query.category ? { evidence: { path: ['category'], equals: query.category } } : {}),
      ...(query.relevance ? { evidence: { path: ['relevance'], equals: query.relevance } } : {}),
      ...(query.provenanceKind ? { evidence: { path: ['provenanceKind'], equals: query.provenanceKind } } : {}),
      ...(query.sourceId ? { run: { revision: { sourceId: query.sourceId } } } : {}),
      ...(anchor ? { OR: [{ createdAt: { lt: anchor.createdAt } }, { createdAt: anchor.createdAt, id: { gt: anchor.id } }] } : {}),
    };
    const rows = await db.documentFinding.findMany({
      where,
      include: { run: { include: { revision: true } }, reviews: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: query.limit + 1,
    });
    const items = rows.slice(0, query.limit);
    res.json({ items, nextCursor: rows.length > query.limit ? items[items.length - 1].id : null });
  });
  router.post('/findings/:id/candidate', roles('ADMIN'), async (req, res) => {
    const input = z.object({ reason: z.string().trim().max(1000).optional() }).strict().parse(req.body ?? {});
    const result = await idempotent(db, `document-finding-candidate:${req.actor.id}:${req.params.id}`, req.get('Idempotency-Key'), input, async tx => {
      const finding = await tx.documentFinding.findUnique({ where: { id: String(req.params.id) }, include: { run: { include: { revision: true } } } });
      assert(finding, 404, 'FINDING_NOT_FOUND', 'Hallazgo inexistente.');
      assert(finding.kind === 'PART_CANDIDATE', 422, 'FINDING_NOT_PART', 'Sólo un hallazgo de repuesto puede derivarse a candidato de catálogo.');
      assert(finding.code !== 'A_CONFIRMAR', 422, 'FINDING_CODE_UNCONFIRMED', 'El hallazgo no contiene un código derivable.');
      const existing = await tx.documentCandidate.findFirst({ where: { revisionId: finding.run.revisionId, code: finding.code, locator: finding.locator }, include });
      const candidate = existing ?? await tx.documentCandidate.create({ data: { revisionId: finding.run.revisionId, code: finding.code.slice(0, 100), name: finding.name.slice(0, 200), partNumber: finding.partNumber || 'A_CONFIRMAR', unit: finding.unit || 'u', locator: finding.locator.slice(0, 200), applicability: finding.applicability.slice(0, 500) }, include });
      await tx.documentFindingReview.create({ data: { findingId: finding.id, decision: 'CREATE_CANDIDATE', reason: input.reason || 'Derivado a candidato con datos extraídos del hallazgo; requiere revisión humana antes de validar.', actorId: req.actor.id } });
      await tx.documentFinding.update({ where: { id: finding.id }, data: { reviewStatus: 'CREATE_CANDIDATE' } });
      await audit(tx, req.actor, 'DOCUMENT_FINDING_DERIVED', finding.id, { candidateId: candidate.id, revisionId: finding.run.revisionId, sourceId: finding.run.revision.sourceId, sha256: finding.run.revision.sha256, locator: finding.locator, stockEffect: 'NONE' });
      return candidate;
    });
    res.status(201).json(result);
  });
  router.post('/findings/:id/reviews', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const input = z.object({ decision: z.enum(findingDecisions), reason: text(1000) }).strict().parse(req.body);
    res.json(await idempotent(db, `document-finding-review:${req.actor.id}:${req.params.id}`, req.get('Idempotency-Key'), input, async tx => {
      const finding = await tx.documentFinding.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
      assert(finding, 404, 'FINDING_NOT_FOUND', 'Hallazgo inexistente.');
      const review = await tx.documentFindingReview.create({ data: { findingId: finding.id, decision: input.decision, reason: input.reason, actorId: req.actor.id } });
      await tx.documentFinding.update({ where: { id: finding.id }, data: { reviewStatus: input.decision } });
      await audit(tx, req.actor, 'DOCUMENT_FINDING_REVIEWED', finding.id, input);
      return tx.documentFinding.findUniqueOrThrow({ where: { id: finding.id }, include: { run: { include: { revision: true } }, reviews: { orderBy: { createdAt: 'desc' }, take: 1 } } });
    }));
  });
  router.get('/page', async (req, res) => {
    const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(25), cursor: text(100).optional() }).strict().parse(req.query);
    const anchor = query.cursor ? await db.documentCandidate.findUnique({ where: { id: query.cursor }, select: { id: true, createdAt: true } }) : null;
    assert(!query.cursor || anchor, 400, 'INVALID_CURSOR', 'El cursor no corresponde a un candidato.');
    const rows = await db.documentCandidate.findMany({
      include: { revision: true, reviews: { orderBy: { version: 'desc' }, take: 1 } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: query.limit + 1,
      where: anchor ? { OR: [{ createdAt: { lt: anchor.createdAt } }, { createdAt: anchor.createdAt, id: { gt: anchor.id } }] } : undefined,
    });
    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit);
    res.json({ items, nextCursor: hasMore ? items[items.length - 1].id : null });
  });
  router.get('/:id/reviews', async (req, res) => {
    const candidateId = String(req.params.id);
    const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(25), cursor: z.coerce.number().int().positive().optional() }).strict().parse(req.query);
    assert(await db.documentCandidate.findUnique({ where: { id: candidateId }, select: { id: true } }), 404, 'CANDIDATE_NOT_FOUND', 'Candidato inexistente.');
    if (query.cursor !== undefined) assert(await db.documentReview.findUnique({ where: { candidateId_version: { candidateId, version: query.cursor } }, select: { id: true } }), 400, 'INVALID_CURSOR', 'El cursor no corresponde al historial del candidato.');
    const rows = await db.documentReview.findMany({ where: { candidateId, ...(query.cursor === undefined ? {} : { version: { lt: query.cursor } }) }, orderBy: { version: 'desc' }, take: query.limit + 1 });
    const page = rows.slice(0, query.limit);
    const actors = await db.user.findMany({ where: { id: { in: [...new Set(page.map(row => row.actorId))] } }, select: { id: true, name: true } });
    const names = new Map(actors.map(actor => [actor.id, actor.name]));
    res.json({ items: page.map(row => ({ ...row, actorName: names.get(row.actorId) ?? null })), nextCursor: rows.length > query.limit ? page[page.length - 1].version : null });
  });
  router.post('/', roles('ADMIN'), async (req, res) => {
    const input = z.object({ sourceId: text(100), title: text(200), sha256: z.string().regex(/^[a-f0-9]{64}$/), code: text(100), name: text(200), partNumber: text(100).default('A_CONFIRMAR'), unit: text(30), locator: text(200), applicability: text(500) }).strict().parse(req.body);
    const result = await idempotent(db, `document-create:${req.actor.id}`, req.get('Idempotency-Key'), input, async tx => {
      const { sourceId, title, sha256, ...candidate } = input;
      const revision = await tx.documentRevision.upsert({ where: { sourceId_sha256: { sourceId, sha256 } }, create: { sourceId, title, sha256 }, update: {} });
      assert(revision.title === title, 409, 'SOURCE_CONFLICT', 'La revisión ya tiene otro título.');
      const row = await tx.documentCandidate.create({ data: { ...candidate, revisionId: revision.id }, include });
      await audit(tx, req.actor, 'DOCUMENT_CANDIDATE_CREATED', row.id, { revisionId: revision.id });
      return row;
    });
    res.status(201).json(result);
  });
  router.post('/:id/reviews', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const input = z.object({ version: z.number().int().min(0), decision: z.enum(['A_CONFIRMAR', 'VALIDADO', 'RECHAZADO']), reason: text(1000) }).strict().parse(req.body);
    res.json(await idempotent(db, `document-review:${req.actor.id}:${req.params.id}`, req.get('Idempotency-Key'), input, async tx => {
      const changed = await tx.documentCandidate.updateMany({ where: { id: String(req.params.id), version: input.version }, data: { version: { increment: 1 } } });
      assert(changed.count === 1, 409, 'REVIEW_STALE', 'El candidato cambió. Recargue y revise la decisión vigente.');
      await tx.documentReview.create({ data: { candidateId: String(req.params.id), version: input.version + 1, decision: input.decision, reason: input.reason, actorId: req.actor.id } });
      await audit(tx, req.actor, 'DOCUMENT_REVIEWED', String(req.params.id), input);
      return tx.documentCandidate.findUniqueOrThrow({ where: { id: String(req.params.id) }, include });
    }));
  });
  router.post('/dry-run', async (req, res) => {
    const { ids } = z.object({ ids: z.array(text(100)).min(1).max(200).refine(v => new Set(v).size === v.length) }).strict().parse(req.body);
    res.json(await transaction(db, async tx => {
      const rows = await tx.documentCandidate.findMany({ where: { id: { in: ids } }, include, orderBy: { id: 'asc' } });
      assert(rows.length === ids.length, 404, 'CANDIDATE_NOT_FOUND', 'Falta un candidato del lote.');
      const catalog = await tx.part.findMany({ select: { code: true, name: true, partNumber: true, unit: true } });
      return dryRunCandidateImport(rows.map(row => ({ candidateId: row.id, code: row.code, name: row.name, partNumber: row.partNumber, unit: row.unit, confidence: (row.reviews[0]?.decision ?? 'A_CONFIRMAR') as 'A_CONFIRMAR' | 'VALIDADO' | 'RECHAZADO', provenance: { sourceId: row.revision.sourceId, sourceRevision: row.revision.sha256, locator: row.locator } })), catalog);
    }));
  });
  return router;
}
