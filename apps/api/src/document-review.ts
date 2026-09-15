import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { roles } from './auth.js';
import { audit, idempotent, transaction } from './db.js';
import { assert } from './errors.js';
import { dryRunCandidateImport } from './candidate-import.js';

const text = (max: number) => z.string().trim().min(1).max(max);
const include = { revision: true, reviews: { orderBy: { version: 'desc' as const } } };
export function documentReviewRouter(db: PrismaClient) {
  const router = Router();
  router.get('/', async (_req, res) => res.json(await db.documentCandidate.findMany({ include, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: 200 })));
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
