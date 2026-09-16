import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { seed } from '../src/seed.js';
import { dueTasks, nextNominalMeter } from '../src/maintenance.js';
import { cardData } from '../src/documents.js';

const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url || !/^\/(?:astra_test|test_[\w-]+)$/.test(new URL(url).pathname)) throw new Error('Acceptance tests require an isolated PostgreSQL database named astra_test or test_*. Set TEST_DATABASE_URL. No fallback/mocks.');
const db = new PrismaClient({ datasourceUrl: url });
const origin = 'http://localhost:4301';
const app = createApp(db, { origin, secureCookie: false, environment: 'test', version: '0.1.0', commit: 'acceptance-commit' });
const credentials = { SEED_ADMIN_PASSWORD: 'Admin-Test-Only-42', SEED_TECH_PASSWORD: 'Tech-Test-Only-42', SEED_VIEWER_PASSWORD: 'Viewer-Test-Only-42' };
type Session = { agent: ReturnType<typeof request.agent>; csrf: string };

async function login(role = 'admin'): Promise<Session> {
  const agent = request.agent(app);
  const password = role === 'admin' ? credentials.SEED_ADMIN_PASSWORD : role === 'tecnico' ? credentials.SEED_TECH_PASSWORD : credentials.SEED_VIEWER_PASSWORD;
  const result = await agent.post('/api/v1/auth/login').set('Origin', origin).send({ email: `${role}@astra.local`, password }).expect(200);
  return { agent, csrf: result.body.csrfToken };
}
function mutate(session: Session, method: 'post' | 'patch', route: string, body: object = {}, key = randomUUID()) {
  return session.agent[method]('/api/v1' + route).set('Origin', origin).set('X-CSRF-Token', session.csrf).set('Idempotency-Key', key).send(body);
}
async function generate(session: Session, target = 600, assetCode = 'AST-001', actual = target) {
  const asset = await db.asset.findUniqueOrThrow({ where: { code: assetCode } });
  const result = await mutate(session, 'post', '/orders/generate', { assetId: asset.id, targetMeter: target, actualMeter: actual }).expect(201);
  return result.body;
}
async function finish(session: Session, order: any) {
  for (const material of order.materials) {
    const part = await db.part.findUniqueOrThrow({ where: { id: material.partId } });
    if (Number(part.onHand) < material.quantityPlanned) await mutate(session, 'post', `/inventory/${part.id}/receive`, { quantity: material.quantityPlanned, reference: randomUUID() }).expect(200);
    await mutate(session, 'post', `/orders/${order.id}/consume`, { materialId: material.id, quantity: material.quantityPlanned }).expect(200);
  }
  for (const task of order.tasks) await mutate(session, 'patch', `/orders/${order.id}/tasks/${task.id}`, { status: 'DONE' }).expect(200);
  for (const checkpoint of order.checkpoints) await mutate(session, 'patch', `/orders/${order.id}/checkpoints/${checkpoint.id}`, { result: 'PASS' }).expect(200);
}

beforeAll(async () => { await db.$connect(); });
beforeEach(async () => {
  await db.$executeRawUnsafe('TRUNCATE TABLE "DocumentFindingReview", "DocumentFinding", "DocumentAnalysisRun", "DocumentReview", "DocumentCandidate", "DocumentRevision", "DeferredLink", "OrderTask", "OrderMaterial", "Checkpoint", "StockMovement", "Audit", "Idempotency", "WorkOrder", "Reading", "Asset", "PlanTask", "Plan", "Part", "Session", "User" RESTART IDENTITY CASCADE');
  await seed(db, credentials);
});
afterAll(() => db.$disconnect());

describe('preventive engine and identity', () => {
  it('resolves 300/600/900/1200/1800/3600 by divisibility and nominal anchoring', () => {
    const tasks = [300, 600, 900, 1200].map(frequency => ({ frequency }));
    for (const [target, expected] of [[300, [300]], [600, [300, 600]], [900, [300, 900]], [1200, [300, 600, 1200]], [1800, [300, 600, 900]], [3600, [300, 600, 900, 1200]]] as [number, number[]][]) {
      expect(dueTasks(tasks, target).map(t => t.frequency)).toEqual(expected);
    }
    expect(nextNominalMeter(tasks, 600)).toBe(900);
  });
  it('persists a 600h service executed at 645h and keeps the next nominal target', async () => {
    const admin = await login();
    const order = await generate(admin, 600, 'AST-001', 645);
    expect(order.tasks.map((t: any) => t.frequency)).toEqual([300, 600]);
    expect(order.actualMeter).toBe(645);
    expect(order.nextServiceMeter).toBe(900);
    expect((await db.asset.findUniqueOrThrow({ where: { code: 'AST-001' } })).meter).toBe(645);
    expect(order.materials[0].part.partNumber).toBe('A_CONFIRMAR');
  });
  it('generates 1200h without a 900h task', async () => {
    const order = await generate(await login(), 1200, 'AST-002');
    expect(order.tasks.map((t: any) => t.frequency)).toEqual([300, 600, 1200]);
  });
  it('deduplicates concurrent generation and rejects a reused key with a different payload', async () => {
    const admin = await login();
    const asset = await db.asset.findUniqueOrThrow({ where: { code: 'AST-001' } });
    const input = { assetId: asset.id, targetMeter: 600, actualMeter: 600 };
    const key = randomUUID();
    const responses = await Promise.all([mutate(admin, 'post', '/orders/generate', input, key), mutate(admin, 'post', '/orders/generate', input, key)]);
    expect(responses.map(r => r.status)).toEqual([201, 201]);
    expect(responses[0].body.id).toBe(responses[1].body.id);
    expect(await db.workOrder.count()).toBe(1);
    const natural = await mutate(admin, 'post', '/orders/generate', input).expect(201);
    expect(natural.body.id).toBe(responses[0].body.id);
    expect((await mutate(admin, 'post', '/orders/generate', { ...input, actualMeter: 601 }, key).expect(409)).body.error.code).toBe('IDEMPOTENCY_CONFLICT');
  });
  it('requires login origin, CSRF, role permission and rejects expired sessions', async () => {
    await request(app).post('/api/v1/auth/login').send({ email: 'admin@astra.local', password: credentials.SEED_ADMIN_PASSWORD }).expect(403);
    const viewer = await login('consulta');
    await viewer.agent.get('/api/v1/plans').expect(200);
    await mutate(viewer, 'post', '/assets', { code: 'NO', name: 'Forbidden', family: 'Demo', meter: 0 }).expect(403);
    const admin = await login();
    await admin.agent.post('/api/v1/assets').set('Origin', origin).send({ code: 'NO', name: 'Missing token', family: 'Demo', meter: 0 }).expect(403);
    await admin.agent.post('/api/v1/assets').set('Origin', 'https://evil.example').set('X-CSRF-Token', admin.csrf).send({}).expect(403);
    const malformed = await admin.agent.post('/api/v1/assets').set('Origin', origin).set('X-CSRF-Token', 'é'.repeat(admin.csrf.length)).send({}).expect(403);
    expect(malformed.body.error.code).toBe('CSRF_INVALID');
    await db.session.updateMany({ data: { expiresAt: new Date(0) } });
    await admin.agent.get('/api/v1/assets').expect(401);
  });
  it('enforces VIEWER across every write route and TECHNICIAN on administration', async () => {
    const admin = await login();
    const order = await generate(admin);
    const viewer = await login('consulta');
    const technician = await login('tecnico');
    const writes: ['post' | 'patch', string, object][] = [
      ['post', `/assets/${order.asset.id}/readings`, { value: 601 }],
      ['post', '/orders/generate', { assetId: order.asset.id, targetMeter: 900, actualMeter: 900 }],
      ['post', `/orders/${order.id}/reserve`, {}],
      ['post', `/orders/${order.id}/consume`, { materialId: order.materials[0].id, quantity: 1 }],
      ['patch', `/orders/${order.id}/tasks/${order.tasks[0].id}`, { status: 'DONE' }],
      ['patch', `/orders/${order.id}/checkpoints/${order.checkpoints[0].id}`, { result: 'PASS' }],
      ['post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }],
      ['post', `/inventory/${order.materials[0].partId}/receive`, { quantity: 1, reference: 'forbidden' }],
    ];
    for (const [method, path, body] of writes) await mutate(viewer, method, path, body).expect(403);
    await mutate(technician, 'post', '/orders/generate', { assetId: order.asset.id, targetMeter: 900, actualMeter: 900 }).expect(403);
    await mutate(technician, 'post', '/assets', { code: 'NO', name: 'Forbidden', family: 'Demo', meter: 0 }).expect(403);
    await mutate(technician, 'post', `/inventory/${order.materials[0].partId}/receive`, { quantity: 1, reference: 'forbidden' }).expect(403);
  });
  it('creates assets, records monotonic readings, and rejects incompatible readings', async () => {
    const admin = await login();
    const plan = await db.plan.findFirstOrThrow();
    const asset = (await mutate(admin, 'post', '/assets', { code: 'AST-003', name: 'Nuevo activo', family: 'Sintético', meter: 10, planId: plan.id }).expect(201)).body;
    await mutate(admin, 'post', `/assets/${asset.id}/readings`, { value: 11 }).expect(200);
    await mutate(admin, 'post', `/assets/${asset.id}/readings`, { value: 9 }).expect(409);
    expect(await db.reading.count({ where: { assetId: asset.id } })).toBe(2);
    await mutate(admin, 'post', '/orders/generate', { assetId: asset.id, targetMeter: 601, actualMeter: 601 }).expect(422);
  });
  it('requires completion of the current order before opening the next service for the same asset', async () => {
    const admin = await login();
    const order = await generate(admin);
    const result = await mutate(admin, 'post', '/orders/generate', { assetId: order.asset.id, targetMeter: 900, actualMeter: 900 }).expect(409);
    expect(result.body.error.code).toBe('ACTIVE_ORDER_EXISTS');
    expect(await db.workOrder.count()).toBe(1);
  });
});

describe('stock transactions', () => {
  it('shows shortages on partial reservation and never records missing stock as used', async () => {
    const admin = await login();
    const order = await generate(admin, 1200, 'AST-002');
    const reserved = (await mutate(admin, 'post', `/orders/${order.id}/reserve`).expect(200)).body;
    const oil = reserved.materials.find((m: any) => m.part.unit === 'l');
    expect(oil).toMatchObject({ quantityPlanned: 2, quantityReserved: 1, quantityUsed: 0, shortage: 1 });
  });
  it('allows only one technician to consume the same final unit', async () => {
    const admin = await login();
    const filter = await db.part.findUniqueOrThrow({ where: { code: 'DEM-FIL-001' } });
    await db.part.update({ where: { id: filter.id }, data: { onHand: 1 } });
    const first = await generate(admin);
    const second = await generate(admin, 1200, 'AST-002');
    const technician = await login('tecnico');
    const result = await Promise.all([first, second].map(order => mutate(technician, 'post', `/orders/${order.id}/consume`, { materialId: order.materials.find((m: any) => m.partId === filter.id).id, quantity: 1 })));
    expect(result.map(r => r.status).sort()).toEqual([200, 409]);
    expect(Number((await db.part.findUniqueOrThrow({ where: { id: filter.id } })).onHand)).toBe(0);
    expect(await db.stockMovement.count({ where: { partId: filter.id, kind: 'CONSUME' } })).toBe(1);
  });
  it('preserves another order reservation, then consumes its own once on retries', async () => {
    const admin = await login();
    const filter = await db.part.findUniqueOrThrow({ where: { code: 'DEM-FIL-001' } });
    await db.part.update({ where: { id: filter.id }, data: { onHand: 1 } });
    const first = await generate(admin);
    const second = await generate(admin, 1200, 'AST-002');
    await mutate(admin, 'post', `/orders/${first.id}/reserve`).expect(200);
    await mutate(admin, 'post', `/orders/${second.id}/consume`, { materialId: second.materials.find((m: any) => m.partId === filter.id).id, quantity: 1 }).expect(409);
    const key = randomUUID();
    const body = { materialId: first.materials[0].id, quantity: 1 };
    await Promise.all([mutate(admin, 'post', `/orders/${first.id}/consume`, body, key).expect(200), mutate(admin, 'post', `/orders/${first.id}/consume`, body, key).expect(200)]);
    const stored = await db.part.findUniqueOrThrow({ where: { id: filter.id } });
    expect(Number(stored.onHand)).toBe(0);
    expect(Number(stored.reserved)).toBe(0);
    expect(await db.stockMovement.count({ where: { kind: 'CONSUME' } })).toBe(1);
  });
  it('receipts are decimal-safe and idempotent by delivery reference', async () => {
    const admin = await login();
    const oil = await db.part.findUniqueOrThrow({ where: { code: 'DEM-LUB-001' } });
    const path = `/inventory/${oil.id}/receive`;
    const body = { quantity: 2.125, reference: 'REM-DEMO-001' };
    await mutate(admin, 'post', path, body).expect(200);
    await mutate(admin, 'post', path, body).expect(200);
    await mutate(admin, 'post', path, { ...body, quantity: 3 }).expect(409);
    expect(Number((await db.part.findUniqueOrThrow({ where: { id: oil.id } })).onHand)).toBe(3.125);
    await mutate(admin, 'post', path, { quantity: 0.0001, reference: 'precision' }).expect(400);
  });
});

describe('closure, continuity and snapshot documents', () => {
  it('blocks pending tasks and critical checkpoints, including critical NA', async () => {
    const admin = await login();
    const order = await generate(admin);
    await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }).expect(422);
    await finish(admin, order);
    const critical = order.checkpoints.find((c: any) => c.critical);
    await mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${critical.id}`, { result: 'NA' }).expect(422);
    await mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${critical.id}`, { result: 'FAIL' }).expect(200);
    const failure = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }).expect(422);
    expect(failure.body.error.code).toBe('CRITICAL_CHECKPOINT');
    const blocked = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'NOT_OPERATIVE', notes: 'Frenos fallidos; equipo inmovilizado.' }).expect(422);
    expect(blocked.body.error.code).toBe('CRITICAL_CHECKPOINT');
    expect((await db.workOrder.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('OPEN');
  });
  it('does not allow performed tasks with materials that were never consumed', async () => {
    const admin = await login();
    const order = await generate(admin);
    for (const task of order.tasks) await mutate(admin, 'patch', `/orders/${order.id}/tasks/${task.id}`, { status: 'DONE' }).expect(200);
    for (const checkpoint of order.checkpoints) await mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${checkpoint.id}`, { result: 'PASS' }).expect(200);
    const response = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }).expect(422);
    expect(response.body.error.code).toBe('MATERIAL_NOT_USED');
  });
  it('blocks critical PENDING and never races a critical failure past operational closure', async () => {
    const admin = await login();
    const order = await generate(admin);
    for (const material of order.materials) await mutate(admin, 'post', `/orders/${order.id}/consume`, { materialId: material.id, quantity: material.quantityPlanned }).expect(200);
    for (const task of order.tasks) await mutate(admin, 'patch', `/orders/${order.id}/tasks/${task.id}`, { status: 'DONE' }).expect(200);
    const pending = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }).expect(422);
    expect(pending.body.error.code).toBe('CRITICAL_CHECKPOINT');
    const critical = order.checkpoints.find((c: any) => c.critical);
    await mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${critical.id}`, { result: 'PASS' }).expect(200);
    const [failure, closure] = await Promise.all([
      mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${critical.id}`, { result: 'FAIL' }),
      mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }),
    ]);
    expect([[200, 422], [409, 200]]).toContainEqual([failure.status, closure.status]);
    const stored = await db.workOrder.findUniqueOrThrow({ where: { id: order.id }, include: { checkpoints: true } });
    if (stored.status === 'CLOSED') expect(stored.checkpoints.find(c => c.critical)?.result).toBe('PASS');
  });
  it('closes idempotently and freezes history against API and direct database edits', async () => {
    const admin = await login();
    const order = await generate(admin);
    await finish(admin, order);
    const key = randomUUID();
    const first = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }, key).expect(200);
    const replay = await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE' }, key).expect(200);
    expect(replay.body).toEqual(first.body);
    expect(await db.audit.count({ where: { action: 'ORDER_CLOSED', entityId: order.id } })).toBe(1);
    await mutate(admin, 'patch', `/orders/${order.id}/tasks/${order.tasks[0].id}`, { status: 'NA' }).expect(409);
    await expect(db.orderTask.update({ where: { id: order.tasks[0].id }, data: { description: 'tampered' } })).rejects.toThrow();
    await expect(db.workOrder.update({ where: { id: order.id }, data: { notes: 'tampered' } })).rejects.toThrow();
    await db.part.update({ where: { id: order.materials[0].partId }, data: { partNumber: 'NEW-CATALOG-PN', name: 'New catalog name' } });
    await db.planTask.updateMany({ data: { description: 'Changed catalog task' } });
    await db.asset.update({ where: { id: order.asset.id }, data: { name: 'Renamed asset' } });
    const history = (await admin.agent.get(`/api/v1/orders/${order.id}`).expect(200)).body;
    expect(history.asset.name).toBe('Tractor de prueba');
    expect(history.tasks[0].description).toBe(order.tasks[0].description);
    expect(history.materials[0].part.partNumber).toBe('A_CONFIRMAR');
  });
  it('carries a deferred task once with reason, responsible person and date', async () => {
    const admin = await login();
    const order = await generate(admin);
    const deferred = order.tasks.find((t: any) => t.frequency === 600);
    const done = order.tasks.find((t: any) => t.frequency === 300);
    await mutate(admin, 'patch', `/orders/${order.id}/tasks/${deferred.id}`, { status: 'DEFERRED' }).expect(422);
    const until = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    await mutate(admin, 'patch', `/orders/${order.id}/tasks/${deferred.id}`, { status: 'DEFERRED', deferredReason: 'Esperar confirmación técnica', deferredUntil: until }).expect(200);
    await mutate(admin, 'patch', `/orders/${order.id}/tasks/${done.id}`, { status: 'DONE' }).expect(200);
    for (const checkpoint of order.checkpoints) await mutate(admin, 'patch', `/orders/${order.id}/checkpoints/${checkpoint.id}`, { result: 'PASS' }).expect(200);
    await mutate(admin, 'post', `/orders/${order.id}/reserve`).expect(200);
    const closed = (await mutate(admin, 'post', `/orders/${order.id}/close`, { result: 'OPERATIVE_WITH_NOTES', notes: 'Filtro pendiente con seguimiento.' }).expect(200)).body;
    expect(closed.materials[0].quantityReserved).toBe(0);
    const next = await generate(admin, 900);
    const continued = next.tasks.find((t: any) => t.code.includes('-PEND-'));
    expect(continued).toMatchObject({ status: 'PENDING', deferredReason: 'Esperar confirmación técnica', deferredBy: 'Administración demo' });
    expect(continued.deferredUntil.slice(0, 10)).toBe(until);
    expect(await db.deferredLink.count()).toBe(1);
    expect((await db.orderTask.findUniqueOrThrow({ where: { id: deferred.id } })).status).toBe('DEFERRED');
  });
  it('renders real PDF bytes and four HTML cards from the same snapshot', async () => {
    const admin = await login();
    const order = await generate(admin, 1200, 'AST-002');
    const html = await admin.agent.get(`/api/v1/orders/${order.id}/card?format=a4`).expect(200);
    expect(html.text.match(/<article class="card">/g)).toHaveLength(4);
    expect(html.text.match(/PN A_CONFIRMAR/g)).toHaveLength(8);
    const cards = html.text.split('<article class="card">').slice(1).map(part => part.split('</article>')[0]);
    expect(new Set(cards).size).toBe(1);
    for (const format of ['a6', 'a4']) {
      const pdf = await admin.agent.get(`/api/v1/orders/${order.id}/pdf?format=${format}`).buffer(true).parse((res, cb) => {
        const chunks: Buffer[] = []; res.on('data', chunk => chunks.push(chunk)); res.on('end', () => cb(null, Buffer.concat(chunks)));
      }).expect(200);
      expect(pdf.body.subarray(0, 5).toString()).toBe('%PDF-');
      expect(pdf.body.length).toBeGreaterThan(2500);
    }
    expect(cardData(order).rows.some(row => row.text.includes('A_CONFIRMAR'))).toBe(true);
  });
  it('exposes health and exact build identity', async () => {
    await request(app).get('/health/live').expect(200);
    await request(app).get('/health/ready').expect(200);
    expect((await request(app).get('/api/v1/version').expect(200)).body).toEqual({ version: '0.1.0', commit: 'acceptance-commit', environment: 'test' });
  });
  it('rejects oversized cards consistently instead of clipping printable HTML or PDF', async () => {
    const admin = await login();
    const order = await generate(admin, 1200, 'AST-002');
    await db.orderTask.updateMany({ where: { orderId: order.id }, data: { description: 'Detalle técnico largo que debe permanecer íntegro. '.repeat(50) } });
    for (const endpoint of ['card', 'pdf']) for (const format of ['a6', 'a4']) {
      const response = await admin.agent.get(`/api/v1/orders/${order.id}/${endpoint}?format=${format}`).expect(422);
      expect(response.body.error.code).toBe('CARD_CAPACITY');
    }
    const detail = await admin.agent.get(`/api/v1/orders/${order.id}`).expect(200);
    expect(detail.body.tasks[0].description).toContain('Detalle técnico largo');
  });
  it('permits insecure cookies only in loopback staging and fails unsafe deployment config', () => {
    expect(readConfig({ APP_ENVIRONMENT: 'staging', APP_ORIGIN: 'http://localhost:4380', COOKIE_SECURE: 'false' }).secureCookie).toBe(false);
    expect(() => readConfig({ APP_ENVIRONMENT: 'staging', APP_ORIGIN: 'http://192.168.1.20', COOKIE_SECURE: 'false' })).toThrow();
    expect(() => readConfig({ APP_ENVIRONMENT: 'production', APP_ORIGIN: 'http://localhost:4380', COOKIE_SECURE: 'false' })).toThrow();
  });
});

describe('persistent document review', () => {
  it('persists reviews, rejects stale decisions, compares catalog and never changes stock', async () => {
    const admin = await login(), tech = await login('tecnico'), viewer = await login('consulta');
    const before = await db.part.findMany({ orderBy: { code: 'asc' } });
    const input = { sourceId: 'TEST-DOC', title: 'Documento sintético', sha256: 'a'.repeat(64), code: before[0].code, name: before[0].name, partNumber: before[0].partNumber, unit: before[0].unit, locator: 'page:1', applicability: 'Sólo fixture sintética' };
    await mutate(viewer, 'post', '/document-candidates', input).expect(403);
    await mutate(tech, 'post', '/document-candidates', input).expect(403);
    const key = randomUUID();
    const created = await mutate(admin, 'post', '/document-candidates', input, key).expect(201);
    expect((await mutate(admin, 'post', '/document-candidates', input, key).expect(201)).body.id).toBe(created.body.id);
    const route = `/document-candidates/${created.body.id}/reviews`;
    await mutate(viewer, 'post', route, {version:0,decision:'VALIDADO',reason:'Test'}).expect(403);
    await mutate(tech, 'post', route, {version:0,decision:'VALIDADO',reason:''}).expect(400);
    const reviewKey = randomUUID();
    const decision = {version:0,decision:'RECHAZADO',reason:'Fuente insuficiente'};
    await mutate(tech, 'post', route, decision, reviewKey).expect(200);
    await mutate(tech, 'post', route, decision, reviewKey).expect(200);
    await mutate(admin, 'post', route, {version:0,decision:'VALIDADO',reason:'Obsoleto'}).expect(409);
    const persisted = (await viewer.agent.get('/api/v1/document-candidates').expect(200)).body.find((r:any)=>r.id===created.body.id);
    expect(persisted.reviews).toHaveLength(1);
    expect(persisted.reviews[0].decision).toBe('RECHAZADO');
    const report = await mutate(viewer,'post','/document-candidates/dry-run',{ids:[created.body.id]}).expect(200);
    expect(report.body).toMatchObject({apply:false,summary:{rejected:1}});
    await mutate(tech,'post',route,{version:1,decision:'VALIDADO',reason:'Revisado con evidencia'}).expect(200);
    expect((await mutate(viewer,'post','/document-candidates/dry-run',{ids:[created.body.id]}).expect(200)).body.results[0].decision).toBe('UNCHANGED');
    expect(await db.part.findMany({orderBy:{code:'asc'}})).toEqual(before);
    expect(await db.stockMovement.count()).toBe(0);
    await expect(db.documentReview.updateMany({data:{reason:'alterado'}})).rejects.toThrow();
  });
});

describe('document candidate pagination', () => {
  it('traverses tied timestamps without duplicates and excludes newer inserts from continuation', async () => {
    const session = await login();
    const revision = await db.documentRevision.create({data:{sourceId:randomUUID(),title:'Pagination fixture',sha256:'b'.repeat(64)}});
    const date = new Date('2100-01-01T00:00:00Z');
    for (const id of ['page-a','page-b','page-c']) await db.documentCandidate.create({data:{id,revisionId:revision.id,code:id,name:id,partNumber:'A_CONFIRMAR',unit:'u',locator:'page:1',applicability:'synthetic',createdAt:date}});
    const first = await session.agent.get('/api/v1/document-candidates/page?limit=2').expect(200);
    expect(first.body.items.map((r:any)=>r.id)).toEqual(['page-a','page-b']);
    expect(first.body.nextCursor).toBe('page-b');
    await db.documentCandidate.create({data:{id:'page-new',revisionId:revision.id,code:'new',name:'new',partNumber:'A_CONFIRMAR',unit:'u',locator:'page:1',applicability:'synthetic',createdAt:new Date('2101-01-01T00:00:00Z')}});
    const second = await session.agent.get('/api/v1/document-candidates/page?limit=2&cursor=page-b').expect(200);
    expect(second.body.items[0].id).toBe('page-c');
    expect(second.body.items.map((r:any)=>r.id)).not.toContain('page-new');
    await session.agent.get('/api/v1/document-candidates/page?limit=101').expect(400);
    await session.agent.get('/api/v1/document-candidates/page?cursor=missing').expect(400);
    expect(Array.isArray((await session.agent.get('/api/v1/document-candidates').expect(200)).body)).toBe(true);
  });
});

describe('document source review queue', () => {
  it('filters sources by extraction status, family and priority without deriving candidates', async () => {
    const viewer = await login('consulta');
    const admin = await db.user.findUniqueOrThrow({ where: { email: 'admin@astra.local' } });
    const high = await db.documentRevision.create({ data: { sourceId: 'SRC-JD-OCR', title: 'JOHN DEERE 4730 AN203010 FILTRO HIDRÁULICO.pdf', sha256: 'd'.repeat(64), createdAt: new Date('2100-01-03T00:00:00Z') } });
    const textReady = await db.documentRevision.create({ data: { sourceId: 'SRC-HILUX-TEXT', title: 'MANUAL HILUX 2017.pdf', sha256: 'e'.repeat(64), createdAt: new Date('2100-01-02T00:00:00Z') } });
    const low = await db.documentRevision.create({ data: { sourceId: 'SRC-DUP', title: 'BULNES - CATÁLOGO DE REPUESTOS TRANSMISIÓN (2).pdf', sha256: 'f'.repeat(64), createdAt: new Date('2100-01-01T00:00:00Z') } });
    await db.audit.createMany({ data: [
      { actorId: admin.id, actorName: admin.name, action: 'DOCUMENT_SOURCE_IMPORTED', entityId: high.id, details: { kind: 'TECHNICAL_REFERENCE', extractionStatus: 'OCR_REQUIRED', pages: 3, pagesNeedingOCR: [1, 2, 3], reviewStatus: 'A_CONFIRMAR' } },
      { actorId: admin.id, actorName: admin.name, action: 'DOCUMENT_SOURCE_IMPORTED', entityId: textReady.id, details: { kind: 'MANUAL_OR_CATALOG', extractionStatus: 'TEXT_EXTRACTED', pages: 555, pagesNeedingOCR: [], reviewStatus: 'A_CONFIRMAR' } },
      { actorId: admin.id, actorName: admin.name, action: 'DOCUMENT_SOURCE_IMPORTED', entityId: low.id, details: { kind: 'MANUAL_OR_CATALOG', extractionStatus: 'DUPLICATE', pages: null, pagesNeedingOCR: [], reviewStatus: 'A_CONFIRMAR' } },
    ] });
    const ocr = (await viewer.agent.get('/api/v1/document-candidates/sources/page?extractionStatus=OCR_REQUIRED&family=John%20Deere&priority=ALTA').expect(200)).body;
    expect(ocr.items).toHaveLength(1);
    expect(ocr.items[0]).toMatchObject({ sourceId: 'SRC-JD-OCR', extractionStatus: 'OCR_REQUIRED', family: 'John Deere', priority: 'ALTA', pagesNeedingOCR: [1, 2, 3], hasCandidates: false });
    const text = (await viewer.agent.get('/api/v1/document-candidates/sources/page?extractionStatus=TEXT_EXTRACTED&family=Hilux').expect(200)).body;
    expect(text.items.map((row: any) => row.sourceId)).toEqual(['SRC-HILUX-TEXT']);
    const baja = (await viewer.agent.get('/api/v1/document-candidates/sources/page?priority=BAJA').expect(200)).body;
    expect(baja.items.map((row: any) => row.sourceId)).toContain('SRC-DUP');
    await viewer.agent.get('/api/v1/document-candidates/sources/page?cursor=missing').expect(400);
    expect(await db.documentCandidate.count()).toBe(0);
    expect(await db.stockMovement.count()).toBe(0);
  });
});

describe('document review history pagination', () => {
  it('bounds history, resolves names and continues despite concurrent decisions', async () => {
    const admin = await login(), tech = await login('tecnico'), viewer = await login('consulta');
    const created = await mutate(admin, 'post', '/document-candidates', { sourceId: 'HISTORY', title: 'Synthetic history', sha256: 'c'.repeat(64), code: 'HIST', name: 'Fixture', unit: 'u', locator: 'page:1', applicability: 'Synthetic' }).expect(201);
    const route = `/document-candidates/${created.body.id}/reviews`;
    await request(app).get('/api/v1' + route).expect(401);
    expect((await viewer.agent.get('/api/v1' + route).expect(200)).body).toEqual({ items: [], nextCursor: null });
    for (let version = 0; version < 3; version++) await mutate(tech, 'post', route, { version, decision: 'A_CONFIRMAR', reason: `Review ${version}` }).expect(200);
    const first = (await viewer.agent.get('/api/v1' + route + '?limit=2').expect(200)).body;
    expect(first.items.map((r: any) => r.version)).toEqual([3, 2]);
    const actor = await db.user.findUniqueOrThrow({ where: { email: 'tecnico@astra.local' } });
    expect(first.items[0]).toMatchObject({ actorId: actor.id, actorName: actor.name });
    expect(first.items[0]).not.toHaveProperty('passwordHash');
    expect(first.nextCursor).toBe(2);
    const races = await Promise.all([admin, tech].map(session => mutate(session, 'post', route, { version: 3, decision: 'A_CONFIRMAR', reason: 'Concurrent review' })));
    expect(races.map(r => r.status).sort()).toEqual([200, 409]);
    expect(await db.documentReview.count({ where: { candidateId: created.body.id } })).toBe(4);
    const second = (await viewer.agent.get('/api/v1' + route + '?limit=2&cursor=2').expect(200)).body;
    expect(second.items.map((r: any) => r.version)).toEqual([1]);
    expect(second.nextCursor).toBeNull();
    for (const query of ['limit=0', 'limit=101', 'cursor=0', 'cursor=1.5', 'cursor=999', 'extra=true']) await viewer.agent.get('/api/v1' + route + '?' + query).expect(400);
    await viewer.agent.get('/api/v1/document-candidates/missing/reviews').expect(404);
    const page = (await viewer.agent.get('/api/v1/document-candidates/page').expect(200)).body;
    expect(page.items[0].reviews).toHaveLength(1);
    expect(page.items[0].reviews[0].version).toBe(4);
    expect((await viewer.agent.get('/api/v1/document-candidates').expect(200)).body[0].reviews).toHaveLength(4);
    expect(await db.stockMovement.count()).toBe(0);
  });
});


describe('assisted document finding review', () => {
  it('pages AI findings, records human decisions by role and never creates candidates or stock', async () => {
    const admin = await login(), tech = await login('tecnico'), viewer = await login('consulta');
    const revision = await db.documentRevision.create({ data: { sourceId: 'SRC-AI', title: 'John Deere synthetic source', sha256: 'd'.repeat(64) } });
    const run = await db.documentAnalysisRun.create({ data: { revisionId: revision.id, analyzerId: 'test-analyzer', analyzerVersion: 'v1', summary: { family: 'John Deere' } } });
    await db.documentFinding.createMany({ data: [
      { id: 'finding-a', runId: run.id, kind: 'PART_CANDIDATE', code: 'RE12345', name: 'Posible filtro', partNumber: 'A_CONFIRMAR', unit: 'u', locator: 'page:4', applicability: 'John Deere', confidence: 'MEDIA', evidence: { sourceId: 'SRC-AI', sha256: 'd'.repeat(64), textLocator: 'page:4', snippet: 'filtro RE12345' }, warnings: ['REVISION_HUMANA_REQUERIDA'], createdAt: new Date('2100-01-01T00:00:00Z') },
      { id: 'finding-b', runId: run.id, kind: 'OCR_REQUIRED', code: 'A_CONFIRMAR', name: 'OCR pendiente', partNumber: 'A_CONFIRMAR', unit: 'u', locator: 'page:9', applicability: 'John Deere', confidence: 'ALTA', evidence: { sourceId: 'SRC-AI', sha256: 'd'.repeat(64), textLocator: 'page:9', snippet: '' }, warnings: ['OCR_REQUERIDO_ANTES_DE_CONFIRMAR'], createdAt: new Date('2099-01-01T00:00:00Z') },
    ] });
    await request(app).get('/api/v1/document-candidates/findings/page').expect(401);
    const first = (await viewer.agent.get('/api/v1/document-candidates/findings/page?limit=1&decision=A_CONFIRMAR&sourceId=SRC-AI').expect(200)).body;
    expect(first.items).toHaveLength(1);
    expect(first.items[0]).toMatchObject({ id: 'finding-a', partNumber: 'A_CONFIRMAR', stockEffect: 'NONE', run: { revision: { sourceId: 'SRC-AI', sha256: 'd'.repeat(64) } } });
    expect(first.nextCursor).toBe('finding-a');
    const second = (await viewer.agent.get('/api/v1/document-candidates/findings/page?limit=1&cursor=finding-a&decision=A_CONFIRMAR&sourceId=SRC-AI').expect(200)).body;
    expect(second.items.map((row: any) => row.id)).toEqual(['finding-b']);
    await viewer.agent.get('/api/v1/document-candidates/findings/page?cursor=missing').expect(400);
    await mutate(viewer, 'post', '/document-candidates/findings/finding-a/reviews', { decision: 'REJECTED', reason: 'viewer' }).expect(403);
    await mutate(tech, 'post', '/document-candidates/findings/finding-a/reviews', { decision: 'REJECTED', reason: '' }).expect(400);
    const reviewed = await mutate(tech, 'post', '/document-candidates/findings/finding-a/reviews', { decision: 'OCR_REQUIRED', reason: 'La página necesita OCR visual' }).expect(200);
    expect(reviewed.body).toMatchObject({ id: 'finding-a', reviewStatus: 'OCR_REQUIRED', reviews: [{ decision: 'OCR_REQUIRED', reason: 'La página necesita OCR visual' }] });
    await mutate(admin, 'post', '/document-candidates/findings/finding-a/reviews', { decision: 'CONFLICT', reason: 'Conflicto con otra fuente' }).expect(200);
    const filtered = (await viewer.agent.get('/api/v1/document-candidates/findings/page?decision=CONFLICT').expect(200)).body;
    expect(filtered.items.map((row: any) => row.id)).toContain('finding-a');
    expect(await db.documentCandidate.count()).toBe(0);
    expect(await db.stockMovement.count()).toBe(0);
    await expect(db.documentFindingReview.updateMany({ data: { reason: 'alterado' } })).rejects.toThrow();
  });
});
