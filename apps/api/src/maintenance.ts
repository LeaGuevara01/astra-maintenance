import { Prisma, type PrismaClient } from '@prisma/client';
import type { Actor } from './auth.js';
import { assert } from './errors.js';
import { asJson, audit, getOrder, idempotent, lockOrder, lockParts, transaction, type Tx } from './db.js';

export function dueTasks<T extends { frequency: number }>(tasks: T[], target: number): T[] {
  return tasks.filter(task => target > 0 && task.frequency > 0 && target % task.frequency === 0);
}

export function nextNominalMeter(tasks: { frequency: number }[], target: number) {
  return Math.min(...tasks.map(task => (Math.floor(target / task.frequency) + 1) * task.frequency));
}

export function generateOrder(db: PrismaClient, actor: Actor, key: string | undefined, input: { assetId: string; targetMeter: number; actualMeter: number }) {
  return idempotent(db, 'generate:' + actor.id, key, input, async tx => {
    const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Asset" WHERE id = ${input.assetId} FOR UPDATE`;
    assert(locked.length, 404, 'ASSET_NOT_FOUND', 'Activo inexistente.');
    const asset = await tx.asset.findUniqueOrThrow({ where: { id: input.assetId }, include: { plan: { include: { tasks: { include: { part: true } } } } } });
    assert(asset.plan?.status === 'ACTIVE', 409, 'PLAN_REQUIRED', 'El activo requiere un plan activo.');
    const plan = asset.plan;
    const existing = await tx.workOrder.findUnique({ where: { assetId_planId_targetMeter: { assetId: asset.id, planId: plan.id, targetMeter: input.targetMeter } } });
    if (existing) {
      assert(existing.actualMeter === input.actualMeter, 409, 'ORDER_ALREADY_EXISTS', 'Ya existe una OT para este objetivo con otra lectura real.');
      return getOrder(tx, existing.id);
    }
    assert(input.actualMeter >= asset.meter, 409, 'METER_DECREASE', 'La lectura real no puede disminuir.');
    const selected = dueTasks(plan.tasks, input.targetMeter);
    assert(selected.length, 422, 'NO_DUE_TASKS', 'El objetivo no coincide con una frecuencia nominal del plan.');
    const latest = await tx.workOrder.findFirst({ where: { assetId: asset.id }, orderBy: { targetMeter: 'desc' } });
    assert(!latest || latest.status !== 'OPEN', 409, 'ACTIVE_ORDER_EXISTS', 'Cierre la OT abierta del activo antes de generar el próximo servicio.');
    assert(!latest || input.targetMeter > latest.targetMeter, 409, 'TARGET_NOT_FORWARD', 'La próxima OT debe avanzar el objetivo nominal.');
    const deferred = await tx.orderTask.findMany({ where: { status: 'DEFERRED', continuation: null, order: { assetId: asset.id, status: 'CLOSED' } }, orderBy: { id: 'asc' } });
    const nextServiceMeter = nextNominalMeter(plan.tasks, input.targetMeter);
    const order = await tx.workOrder.create({ data: {
      assetId: asset.id, planId: plan.id, targetMeter: input.targetMeter, actualMeter: input.actualMeter, nextServiceMeter,
      assetSnapshot: asJson({ id: asset.id, code: asset.code, name: asset.name, family: asset.family, meter: input.actualMeter, operatingStatus: asset.operatingStatus, planId: plan.id }),
      planSnapshot: asJson({ id: plan.id, code: plan.code, name: plan.name, revision: plan.revision, anchor: 'NOMINAL', synthetic: true }),
      checkpoints: { create: [
        { code: 'BRAKES', label: 'Verificación de frenos (criterio A_CONFIRMAR)', critical: true },
        { code: 'LEAKS', label: 'Inspección visual de fugas', critical: false },
      ] },
    } });
    const materials = new Map<string, Prisma.Decimal>();
    for (const task of selected) {
      await tx.orderTask.create({ data: { orderId: order.id, code: task.code, description: task.description, frequency: task.frequency,
        mandatory: task.mandatory, blocking: task.blocking, sourceType: task.sourceType, sourceReference: task.sourceReference,
        partId: task.partId, quantity: task.quantity } });
      if (task.partId && task.quantity) materials.set(task.partId, (materials.get(task.partId) ?? new Prisma.Decimal(0)).plus(task.quantity));
    }
    for (const task of deferred) {
      const continuation = await tx.orderTask.create({ data: { orderId: order.id, code: `${task.code.split('-PEND-')[0]}-PEND-${task.id.slice(-8)}`,
        description: `Pendiente anterior: ${task.description.replace(/^Pendiente anterior: /, '')}`, frequency: task.frequency,
        mandatory: task.mandatory, blocking: task.blocking, sourceType: task.sourceType, sourceReference: task.sourceReference,
        partId: task.partId, quantity: task.quantity, deferredReason: task.deferredReason, deferredUntil: task.deferredUntil, deferredBy: task.deferredBy } });
      await tx.deferredLink.create({ data: { sourceTaskId: task.id, targetTaskId: continuation.id } });
      if (task.partId && task.quantity) materials.set(task.partId, (materials.get(task.partId) ?? new Prisma.Decimal(0)).plus(task.quantity));
    }
    for (const [partId, quantity] of materials) {
      const part = await tx.part.findUniqueOrThrow({ where: { id: partId } });
      await tx.orderMaterial.create({ data: { orderId: order.id, partId, quantityPlanned: quantity,
        partSnapshot: asJson({ code: part.code, name: part.name, partNumber: part.partNumber, unit: part.unit }) } });
    }
    if (input.actualMeter > asset.meter) {
      await tx.asset.update({ where: { id: asset.id }, data: { meter: input.actualMeter } });
      await tx.reading.create({ data: { assetId: asset.id, value: input.actualMeter, actorId: actor.id } });
    }
    await audit(tx, actor, 'ORDER_GENERATED', order.id, { ...input, planId: plan.id, revision: plan.revision, sourceDeferredTasks: deferred.map(t => t.id), nextServiceMeter });
    return getOrder(tx, order.id);
  });
}

export function reserveOrder(db: PrismaClient, actor: Actor, orderId: string, key: string | undefined) {
  return idempotent(db, `reserve:${actor.id}:${orderId}`, key, {}, async tx => {
    const order = await lockOrder(tx, orderId);
    await lockParts(tx, order.materials.map(m => m.partId));
    const reservations = [];
    for (const material of order.materials) {
      const part = await tx.part.findUniqueOrThrow({ where: { id: material.partId } });
      const needed = Prisma.Decimal.max(0, material.quantityPlanned.minus(material.quantityReserved).minus(material.quantityUsed));
      const quantity = Prisma.Decimal.min(needed, part.onHand.minus(part.reserved));
      if (quantity.greaterThan(0)) {
        await tx.part.update({ where: { id: part.id }, data: { reserved: { increment: quantity } } });
        await tx.orderMaterial.update({ where: { id: material.id }, data: { quantityReserved: { increment: quantity } } });
        await tx.stockMovement.create({ data: { partId: part.id, orderId, kind: 'RESERVE', quantity, reference: key!, actorId: actor.id } });
        reservations.push({ partId: part.id, quantity: Number(quantity) });
      }
    }
    await audit(tx, actor, 'STOCK_RESERVED', orderId, { reservations });
    return getOrder(tx, orderId);
  });
}

export function consumeMaterial(db: PrismaClient, actor: Actor, orderId: string, key: string | undefined, input: { materialId: string; quantity: number }) {
  return idempotent(db, `consume:${actor.id}:${orderId}`, key, input, async tx => {
    const order = await lockOrder(tx, orderId);
    const material = order.materials.find(m => m.id === input.materialId);
    assert(material, 404, 'MATERIAL_NOT_FOUND', 'El material no pertenece a esta OT.');
    await lockParts(tx, [material.partId]);
    const part = await tx.part.findUniqueOrThrow({ where: { id: material.partId } });
    const quantity = new Prisma.Decimal(input.quantity);
    assert(material.quantityUsed.plus(quantity).lessThanOrEqualTo(material.quantityPlanned), 409, 'EXCESS_CONSUMPTION', 'El consumo supera lo planificado.');
    const free = part.onHand.minus(part.reserved).plus(material.quantityReserved);
    assert(quantity.lessThanOrEqualTo(free), 409, 'INSUFFICIENT_STOCK', 'Stock insuficiente; se preservan las reservas de otras OT.');
    const fromReservation = Prisma.Decimal.min(quantity, material.quantityReserved);
    await tx.part.update({ where: { id: part.id }, data: { onHand: { decrement: quantity }, reserved: { decrement: fromReservation } } });
    await tx.orderMaterial.update({ where: { id: material.id }, data: { quantityUsed: { increment: quantity }, quantityReserved: { decrement: fromReservation } } });
    await tx.stockMovement.create({ data: { partId: part.id, orderId, kind: 'CONSUME', quantity, reference: key!, actorId: actor.id } });
    await audit(tx, actor, 'MATERIAL_CONSUMED', orderId, { materialId: material.id, partId: part.id, quantity: Number(quantity) });
    return getOrder(tx, orderId);
  });
}

export type TaskInput = { status: 'PENDING' | 'DONE' | 'DEFERRED' | 'NA'; deferredReason?: string; deferredUntil?: string };
export function updateTask(db: PrismaClient, actor: Actor, orderId: string, taskId: string, input: TaskInput) {
  return transaction(db, async tx => {
    const order = await lockOrder(tx, orderId);
    const task = order.tasks.find(t => t.id === taskId);
    assert(task, 404, 'TASK_NOT_FOUND', 'La tarea no pertenece a esta OT.');
    assert(!task.blocking || !['DEFERRED', 'NA'].includes(input.status), 422, 'TASK_BLOCKING', 'La tarea bloqueante debe realizarse.');
    if (input.status === 'DEFERRED') {
      assert(input.deferredReason?.trim() && input.deferredUntil, 422, 'DEFERRAL_REQUIRED', 'Indique motivo y fecha de continuidad.');
      const until = new Date(input.deferredUntil);
      assert(Number.isFinite(until.getTime()) && until >= new Date(new Date().toISOString().slice(0, 10)), 422, 'DEFERRAL_DATE', 'La fecha de continuidad debe ser hoy o posterior.');
    }
    await tx.orderTask.update({ where: { id: taskId }, data: {
      status: input.status,
      deferredReason: input.status === 'DEFERRED' ? input.deferredReason!.trim() : null,
      deferredUntil: input.status === 'DEFERRED' ? new Date(input.deferredUntil!) : null,
      deferredBy: input.status === 'DEFERRED' ? actor.name : null,
    } });
    await audit(tx, actor, 'TASK_UPDATED', orderId, { taskId, before: task.status, ...input, actorId: actor.id });
    return getOrder(tx, orderId);
  });
}

export function updateCheckpoint(db: PrismaClient, actor: Actor, orderId: string, checkpointId: string, result: 'PASS' | 'FAIL' | 'NA') {
  return transaction(db, async tx => {
    const order = await lockOrder(tx, orderId);
    const checkpoint = order.checkpoints.find(c => c.id === checkpointId);
    assert(checkpoint, 404, 'CHECKPOINT_NOT_FOUND', 'El checkpoint no pertenece a esta OT.');
    assert(!(checkpoint.critical && result === 'NA'), 422, 'CRITICAL_NA', 'Un checkpoint crítico no admite N/A.');
    await tx.checkpoint.update({ where: { id: checkpointId }, data: { result } });
    if (checkpoint.critical && result === 'FAIL') await tx.asset.update({ where: { id: order.assetId }, data: { operatingStatus: 'NOT_OPERATIVE' } });
    await audit(tx, actor, 'CHECKPOINT_UPDATED', orderId, { checkpointId, before: checkpoint.result, result, critical: checkpoint.critical });
    return getOrder(tx, orderId);
  });
}

export type CloseInput = { result: 'OPERATIVE' | 'OPERATIVE_WITH_NOTES' | 'NOT_OPERATIVE'; notes?: string };
export function closeOrder(db: PrismaClient, actor: Actor, orderId: string, key: string | undefined, input: CloseInput) {
  return idempotent(db, `close:${actor.id}:${orderId}`, key, input, async tx => {
    const order = await lockOrder(tx, orderId);
    assert(!order.tasks.some(task => task.mandatory && task.status === 'PENDING'), 422, 'TASKS_PENDING', 'Resuelva o difiera explícitamente las tareas obligatorias.');
    if (input.result !== 'NOT_OPERATIVE') {
      assert(!order.checkpoints.some(c => c.critical && c.result !== 'PASS'), 422, 'CRITICAL_CHECKPOINT', 'No se puede liberar con un checkpoint crítico fallido o pendiente.');
      assert(!order.tasks.some(t => t.blocking && t.status !== 'DONE'), 422, 'TASK_BLOCKING', 'La liberación requiere las tareas bloqueantes realizadas.');
    }
    if (input.result === 'OPERATIVE') assert(!order.tasks.some(t => t.status === 'DEFERRED'), 422, 'DEFERRED_TASKS', 'Las tareas diferidas requieren OPERATIVE_WITH_NOTES o NOT_OPERATIVE.');
    if (input.result !== 'OPERATIVE') assert(input.notes?.trim(), 422, 'CLOSURE_NOTES_REQUIRED', 'Documente las observaciones del cierre.');
    const needed = new Map<string, Prisma.Decimal>();
    for (const task of order.tasks) if (task.status === 'DONE' && task.partId && task.quantity) needed.set(task.partId, (needed.get(task.partId) ?? new Prisma.Decimal(0)).plus(task.quantity));
    for (const [partId, quantity] of needed) {
      const material = order.materials.find(m => m.partId === partId);
      assert(material && material.quantityUsed.greaterThanOrEqualTo(quantity), 422, 'MATERIAL_NOT_USED', 'Las tareas realizadas requieren registrar el consumo real de sus materiales.');
    }
    await lockParts(tx, order.materials.map(m => m.partId));
    for (const material of order.materials) if (material.quantityReserved.greaterThan(0)) {
      await tx.part.update({ where: { id: material.partId }, data: { reserved: { decrement: material.quantityReserved } } });
      await tx.orderMaterial.update({ where: { id: material.id }, data: { quantityReserved: 0 } });
      await tx.stockMovement.create({ data: { partId: material.partId, orderId, kind: 'RELEASE', quantity: material.quantityReserved, reference: key!, actorId: actor.id } });
    }
    await tx.asset.update({ where: { id: order.assetId }, data: { operatingStatus: input.result } });
    await tx.workOrder.update({ where: { id: orderId }, data: { status: 'CLOSED', closedAt: new Date(), closedBy: actor.id, result: input.result, notes: input.notes?.trim() ?? null,
      assetSnapshot: asJson({ ...(order.assetSnapshot as object), operatingStatus: input.result }) } });
    await audit(tx, actor, 'ORDER_CLOSED', orderId, { result: input.result, notes: input.notes, nextServiceMeter: order.nextServiceMeter, deferredTaskIds: order.tasks.filter(t => t.status === 'DEFERRED').map(t => t.id) });
    return getOrder(tx, orderId);
  });
}

export async function recordReading(tx: Tx, actor: Actor, assetId: string, value: number) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Asset" WHERE id = ${assetId} FOR UPDATE`;
  assert(rows.length, 404, 'ASSET_NOT_FOUND', 'Activo inexistente.');
  const asset = await tx.asset.findUniqueOrThrow({ where: { id: assetId } });
  assert(value >= asset.meter, 409, 'METER_DECREASE', 'La lectura no puede disminuir.');
  await tx.reading.create({ data: { assetId, value, actorId: actor.id } });
  const result = await tx.asset.update({ where: { id: assetId }, data: { meter: value }, include: { plan: true } });
  await audit(tx, actor, 'READING_RECORDED', assetId, { before: asset.meter, value });
  return result;
}
