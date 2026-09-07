import express from 'express';
import { createHash } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';
import { auth, roles } from './auth.js';
import type { Config } from './config.js';
import { readConfig } from './config.js';
import { ApiError, assert } from './errors.js';
import { audit, fullOrder, getOrder, idempotent, lockParts, orderView, partView, retryable, transaction } from './db.js';
import { closeOrder, consumeMaterial, generateOrder, recordReading, reserveOrder, updateCheckpoint, updateTask } from './maintenance.js';
import { renderCardHtml, renderCardPdf } from './documents.js';
import { openapi } from './openapi.js';

const id = z.string().min(1).max(100);
const meter = z.number().int().min(0).max(100_000_000);
const quantity = z.number().positive().max(1_000_000).refine(value => Math.abs(value * 1000 - Math.round(value * 1000)) < 0.00001, 'Máximo tres decimales.');
const string = (max = 200) => z.string().trim().min(1).max(max);
const planView = <T extends { tasks: { quantity: Prisma.Decimal | null }[] }>(plan: T) => ({ ...plan, tasks: plan.tasks.map(t => ({ ...t, quantity: t.quantity === null ? null : Number(t.quantity) })) });

export function createApp(db: PrismaClient, config: Config = readConfig()) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin', 'Cache-Control': 'no-store' });
    if (!req.path.endsWith('/card')) res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (_req, res) => {
    try {
      await db.$queryRaw`SELECT 1`;
      await db.user.count();
      res.json({ status: 'ready' });
    } catch { res.status(503).json({ status: 'unavailable' }); }
  });
  app.get('/api/v1/version', (_req, res) => res.json({ version: config.version, commit: config.commit, environment: config.environment }));
  app.get('/api/v1/openapi.json', (_req, res) => res.json(openapi));
  const api = express.Router();
  const authentication = auth(db, config);
  api.post('/auth/login', authentication.requireOrigin, authentication.login);
  api.use(authentication.requireSession, authentication.requireCsrf);
  api.get('/auth/me', (req, res) => res.json({ user: req.actor, csrfToken: req.csrfToken }));
  api.post('/auth/logout', authentication.logout);
  api.get('/dashboard', async (_req, res) => {
    const [assets, orders, inventory] = await Promise.all([db.asset.count(), db.workOrder.findMany({ where: { status: 'OPEN' }, include: { asset: true } }), db.part.findMany()]);
    res.json({ assets, openOrders: orders.length, overdue: orders.filter(o => o.asset.meter > o.targetMeter).length, lowStock: inventory.filter(p => p.onHand.minus(p.reserved).lessThanOrEqualTo(1)).length });
  });
  api.get('/assets', async (_req, res) => {
    const assets = await db.asset.findMany({ include: { plan: { include: { tasks: true } } }, orderBy: { code: 'asc' } });
    res.json(assets.map(a => ({ ...a, plan: a.plan ? planView(a.plan) : null })));
  });
  api.post('/assets', roles('ADMIN'), async (req, res) => {
    const input = z.object({ code: string(40), name: string(120), family: string(80), meter, planId: id.optional() }).strict().parse(req.body);
    const result = await transaction(db, async tx => {
      if (input.planId) assert(await tx.plan.findFirst({ where: { id: input.planId, status: 'ACTIVE' } }), 422, 'PLAN_NOT_FOUND', 'Plan activo inexistente.');
      const asset = await tx.asset.create({ data: input, include: { plan: true } });
      await tx.reading.create({ data: { assetId: asset.id, value: asset.meter, actorId: req.actor.id } });
      await audit(tx, req.actor, 'ASSET_CREATED', asset.id, input);
      return asset;
    });
    res.status(201).json(result);
  });
  api.post('/assets/:id/readings', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const { value } = z.object({ value: meter }).strict().parse(req.body);
    res.json(await transaction(db, tx => recordReading(tx, req.actor, String(req.params.id), value)));
  });
  api.get('/plans', async (_req, res) => res.json((await db.plan.findMany({ include: { tasks: { orderBy: { frequency: 'asc' } } }, orderBy: { code: 'asc' } })).map(planView)));
  api.get('/inventory', async (_req, res) => res.json((await db.part.findMany({ orderBy: { code: 'asc' } })).map(partView)));
  api.post('/inventory/:id/receive', roles('ADMIN'), async (req, res) => {
    const input = z.object({ quantity, reference: string(120) }).strict().parse(req.body);
    const partId = String(req.params.id);
    // Receipt reference is its natural idempotency key; do not post the same delivery twice.
    const result = await idempotent(db, 'receipt:' + partId, 'receipt-' + createHash('sha256').update(input.reference).digest('hex'), input, async tx => {
      await lockParts(tx, [partId]);
      const part = await tx.part.update({ where: { id: partId }, data: { onHand: { increment: input.quantity } } });
      await tx.stockMovement.create({ data: { partId, kind: 'RECEIVE', quantity: input.quantity, reference: input.reference, actorId: req.actor.id } });
      await audit(tx, req.actor, 'STOCK_RECEIVED', partId, input);
      return partView(part);
    });
    res.json(result);
  });
  api.get('/orders', async (_req, res) => res.json((await db.workOrder.findMany({ include: fullOrder, orderBy: { createdAt: 'desc' } })).map(orderView)));
  api.post('/orders/generate', roles('ADMIN'), async (req, res) => {
    const input = z.object({ assetId: id, targetMeter: meter.positive(), actualMeter: meter }).strict().parse(req.body);
    res.status(201).json(await generateOrder(db, req.actor, req.get('Idempotency-Key'), input));
  });
  api.get('/orders/:id', async (req, res) => {
    const orderId = String(req.params.id);
    const order = await getOrder(db, orderId);
    const events = await db.audit.findMany({ where: { entityId: orderId }, orderBy: { createdAt: 'asc' } });
    res.json({ ...order, audit: events });
  });
  api.post('/orders/:id/reserve', roles('ADMIN', 'TECHNICIAN'), async (req, res) => res.json(await reserveOrder(db, req.actor, String(req.params.id), req.get('Idempotency-Key'))));
  api.post('/orders/:id/consume', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const input = z.object({ materialId: id, quantity }).strict().parse(req.body);
    res.json(await consumeMaterial(db, req.actor, String(req.params.id), req.get('Idempotency-Key'), input));
  });
  api.patch('/orders/:id/tasks/:taskId', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const input = z.object({ status: z.enum(['PENDING', 'DONE', 'DEFERRED', 'NA']), deferredReason: string(400).optional(), deferredUntil: z.string().date().or(z.iso.datetime()).optional() }).strict().parse(req.body);
    res.json(await updateTask(db, req.actor, String(req.params.id), String(req.params.taskId), input));
  });
  api.patch('/orders/:id/checkpoints/:checkpointId', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const { result } = z.object({ result: z.enum(['PASS', 'FAIL', 'NA']) }).strict().parse(req.body);
    res.json(await updateCheckpoint(db, req.actor, String(req.params.id), String(req.params.checkpointId), result));
  });
  api.post('/orders/:id/close', roles('ADMIN', 'TECHNICIAN'), async (req, res) => {
    const input = z.object({ result: z.enum(['OPERATIVE', 'OPERATIVE_WITH_NOTES', 'NOT_OPERATIVE']), notes: string(1000).optional() }).strict().parse(req.body);
    res.json(await closeOrder(db, req.actor, String(req.params.id), req.get('Idempotency-Key'), input));
  });
  api.get('/orders/:id/card', async (req, res) => {
    const format = z.enum(['a6', 'a4']).default('a6').parse(req.query.format);
    res.type('html').send(await renderCardHtml(await getOrder(db, String(req.params.id)), format, config.origin));
  });
  api.get('/orders/:id/pdf', async (req, res) => {
    const format = z.enum(['a6', 'a4']).default('a6').parse(req.query.format);
    const order = await getOrder(db, String(req.params.id));
    const bytes = await renderCardPdf(order, format, config.origin);
    res.type('pdf').set('Content-Disposition', `inline; filename="${order.code}-${format}.pdf"`).send(bytes);
  });
  api.get('/audit', async (_req, res) => res.json(await db.audit.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })));
  app.use('/api/v1', api);
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Ruta inexistente.')));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Revise los datos enviados.', details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) } });
    if (error instanceof ApiError) return res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return res.status(409).json({ error: { code: 'ALREADY_EXISTS', message: 'Ya existe un registro con ese identificador.' } });
      if (error.code === 'P2025') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Registro inexistente.' } });
      if (retryable(error)) return res.status(409).json({ error: { code: 'RETRY_TRANSACTION', message: 'Conflicto concurrente. Reintente con la misma clave.' } });
    }
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON inválido.' } });
    if (typeof error === 'object' && error && 'type' in error && error.type === 'entity.too.large') return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Solicitud demasiado grande.' } });
    console.error('Request failed', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'No se pudo completar la operación.' } });
  });
  return app;
}
