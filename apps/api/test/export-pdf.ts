// QA helper: uses only the explicitly isolated test database, writes to the supplied output directory.
import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { seed } from '../src/seed.js';
import { closeOrder, consumeMaterial, generateOrder, updateCheckpoint, updateTask } from '../src/maintenance.js';
import { cardData, renderCardHtml, renderCardPdf } from '../src/documents.js';
import { getOrder } from '../src/db.js';

const url = process.env.TEST_DATABASE_URL;
if (!url || new URL(url).pathname !== '/astra_test' || !process.argv[2]) throw new Error('TEST_DATABASE_URL must end in /astra_test and an output directory argument is required.');
const db = new PrismaClient({ datasourceUrl: url });
try {
  await seed(db, { SEED_ADMIN_PASSWORD: 'Admin-Test-Only-42', SEED_TECH_PASSWORD: 'Tech-Test-Only-42', SEED_VIEWER_PASSWORD: 'Viewer-Test-Only-42' });
  const actor = await db.user.findUniqueOrThrow({ where: { email: 'admin@astra.local' } });
  // Own assets avoid editing shared test fixtures or closed history; Verify resets stock before QA.
  const plan = await db.plan.findUniqueOrThrow({ where: { code_revision: { code: 'DEMO-PREV-H', revision: 1 } } });
  const suffix = randomUUID().slice(0, 8);
  const asset = await db.asset.create({ data: { code: `PDF-OPEN-${suffix}`, name: 'Equipo de validación PDF', family: 'Sintético', meter: 1200, planId: plan.id } });
  const order = await generateOrder(db, actor, randomUUID(), { assetId: asset.id, targetMeter: 1200, actualMeter: 1245 });
  const closedAsset = await db.asset.create({ data: { code: `PDF-CLOSED-${suffix}`, name: 'Tractor de validación PDF', family: 'Sintético', meter: 600, planId: plan.id } });
  let closed = await generateOrder(db, actor, randomUUID(), { assetId: closedAsset.id, targetMeter: 600, actualMeter: 645 });
  for (const material of closed.materials) await consumeMaterial(db, actor, closed.id, randomUUID(), { materialId: material.id, quantity: material.quantityPlanned });
  for (const task of closed.tasks) await updateTask(db, actor, closed.id, task.id, { status: 'DONE' });
  for (const checkpoint of closed.checkpoints) await updateCheckpoint(db, actor, closed.id, checkpoint.id, 'PASS');
  closed = await closeOrder(db, actor, closed.id, randomUUID(), { result: 'OPERATIVE', notes: 'Cierre sintético para validar tarjeta y hoja A4.' });
  const originalCard = cardData(closed);
  await db.asset.update({ where: { id: closedAsset.id }, data: { name: 'Nombre modificado después del cierre' } });
  closed = await getOrder(db, closed.id);
  if (JSON.stringify(cardData(closed)) !== JSON.stringify(originalCard)) throw new Error('Closed document changed after catalog edit');
  await mkdir(process.argv[2], { recursive: true });
  const manifest = [];
  for (const [state, snapshot] of [['open', order], ['closed', closed]] as const) {
    for (const format of ['a6', 'a4'] as const) {
      const filename = `astra-card-${state}-${format}`;
      const pdf = await renderCardPdf(snapshot, format, 'http://localhost:4380');
      await writeFile(path.join(process.argv[2], `${filename}.pdf`), pdf);
      await writeFile(path.join(process.argv[2], `${filename}.html`), await renderCardHtml(snapshot, format, 'http://localhost:4380'));
      manifest.push({ filename, format, state, orderId: snapshot.id, orderCode: snapshot.code, expectedQr: `http://localhost:4380/orders/${snapshot.id}`, sha256: createHash('sha256').update(pdf).digest('hex'), card: cardData(snapshot), snapshot });
    }
  }
  await writeFile(path.join(process.argv[2], 'manifest.json'), JSON.stringify({ createdAt: new Date().toISOString(), environment: 'isolated-test', closedSnapshotPreservedAfterAssetEdit: true, files: manifest }, null, 2));
  console.log(`QA cards: ${order.code} (open), ${closed.code} (closed); four PDFs and matching HTML/snapshots.`);
} finally { await db.$disconnect(); }
