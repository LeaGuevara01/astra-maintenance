import { Prisma, PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import type { Actor } from './auth.js';
import { assert } from './errors.js';

export type Tx = Prisma.TransactionClient;
export const asJson = (value: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(value));
export const audit = (tx: Tx, actor: Actor, action: string, entityId: string, details: unknown = {}) =>
  tx.audit.create({ data: { actorId: actor.id, actorName: actor.name, action, entityId, details: asJson(details) } });

export function retryable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && (
    ['P2034', 'P2002'].includes(error.code) || (error.code === 'P2010' && ['40001', '40P01'].includes(String(error.meta?.code)))
  );
}

export async function transaction<T>(db: PrismaClient, action: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(action, { isolationLevel: 'Serializable', maxWait: 15000, timeout: 15000 });
    } catch (error) {
      if (retryable(error) && attempt < 5) {
        await new Promise(resolve => setTimeout(resolve, 15 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
}

export async function idempotent<T>(db: PrismaClient, scope: string, key: string | undefined, body: unknown, operation: (tx: Tx) => Promise<T>): Promise<T> {
  assert(key && /^[A-Za-z0-9._:-]{8,160}$/.test(key), 400, 'IDEMPOTENCY_KEY_REQUIRED', 'Envíe Idempotency-Key (8-160 caracteres).');
  const requestHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return transaction(db, async tx => {
    // An advisory lock serializes identical requests even before a resource exists.
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${scope + ':' + key}, 0))`;
    const existing = await tx.idempotency.findUnique({ where: { scope_key: { scope, key } } });
    if (existing) {
      assert(existing.requestHash === requestHash, 409, 'IDEMPOTENCY_CONFLICT', 'La clave ya se usó con otro contenido.');
      return existing.response as T;
    }
    const result = await operation(tx);
    await tx.idempotency.create({ data: { scope, key, requestHash, response: asJson(result) } });
    return result;
  });
}

export async function lockOrder(tx: Tx, orderId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "WorkOrder" WHERE id = ${orderId} FOR UPDATE`;
  assert(rows.length, 404, 'ORDER_NOT_FOUND', 'OT inexistente.');
  const order = await tx.workOrder.findUniqueOrThrow({ where: { id: orderId }, include: { tasks: true, materials: true, checkpoints: true } });
  assert(order.status === 'OPEN', 409, 'ORDER_CLOSED', 'La intervención cerrada conserva su historial y no puede modificarse.');
  return order;
}

export async function lockParts(tx: Tx, partIds: string[]) {
  for (const id of [...new Set(partIds)].sort()) {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Part" WHERE id = ${id} FOR UPDATE`;
    assert(rows.length, 404, 'PART_NOT_FOUND', 'Repuesto inexistente.');
  }
}

export const fullOrder = { tasks: { orderBy: { code: 'asc' as const } }, materials: { orderBy: { partId: 'asc' as const } }, checkpoints: { orderBy: { code: 'asc' as const } } };
export type OrderData = Prisma.WorkOrderGetPayload<{ include: typeof fullOrder }>;
export const partView = (part: { id: string; code: string; name: string; partNumber: string; unit: string; onHand: Prisma.Decimal; reserved: Prisma.Decimal }) => ({ ...part, onHand: Number(part.onHand), reserved: Number(part.reserved), available: Number(part.onHand.minus(part.reserved)) });

export function orderView(order: OrderData) {
  return {
    id: order.id, code: `OT-${String(order.number).padStart(6, '0')}`, status: order.status,
    targetMeter: order.targetMeter, actualMeter: order.actualMeter, nextServiceMeter: order.nextServiceMeter,
    createdAt: order.createdAt.toISOString(), closedAt: order.closedAt?.toISOString() ?? null,
    result: order.result, notes: order.notes,
    asset: order.assetSnapshot, plan: order.planSnapshot,
    tasks: order.tasks.map(task => ({ ...task, quantity: task.quantity === null ? null : Number(task.quantity), deferredUntil: task.deferredUntil?.toISOString() ?? null })),
    materials: order.materials.map(material => ({ id: material.id, partId: material.partId, part: material.partSnapshot,
      quantityPlanned: Number(material.quantityPlanned), quantityReserved: Number(material.quantityReserved), quantityUsed: Number(material.quantityUsed),
      shortage: Number(Prisma.Decimal.max(0, material.quantityPlanned.minus(material.quantityReserved).minus(material.quantityUsed))) })),
    checkpoints: order.checkpoints,
  };
}

export async function getOrder(tx: Tx, id: string) {
  const order = await tx.workOrder.findUnique({ where: { id }, include: fullOrder });
  assert(order, 404, 'ORDER_NOT_FOUND', 'OT inexistente.');
  return orderView(order);
}
