// QA helper: uses only the explicitly isolated test database, writes to the supplied output directory.
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { seed } from '../src/seed.js';
import { generateOrder } from '../src/maintenance.js';
import { renderCardHtml, renderCardPdf } from '../src/documents.js';

const url = process.env.TEST_DATABASE_URL;
if (!url || new URL(url).pathname !== '/astra_test' || !process.argv[2]) throw new Error('TEST_DATABASE_URL must end in /astra_test and an output directory argument is required.');
const db = new PrismaClient({ datasourceUrl: url });
try {
  await seed(db, { SEED_ADMIN_PASSWORD: 'Admin-Test-Only-42', SEED_TECH_PASSWORD: 'Tech-Test-Only-42', SEED_VIEWER_PASSWORD: 'Viewer-Test-Only-42' });
  const actor = await db.user.findUniqueOrThrow({ where: { email: 'admin@astra.local' } });
  const asset = await db.asset.findUniqueOrThrow({ where: { code: 'AST-002' } });
  const order = await generateOrder(db, actor, randomUUID(), { assetId: asset.id, targetMeter: 1200, actualMeter: 1200 });
  await mkdir(process.argv[2], { recursive: true });
  for (const format of ['a6', 'a4'] as const) {
    await writeFile(path.join(process.argv[2], `astra-card-${format}.pdf`), await renderCardPdf(order, format, 'http://localhost:4380'));
    await writeFile(path.join(process.argv[2], `astra-card-${format}.html`), await renderCardHtml(order, format, 'http://localhost:4380'));
  }
  console.log(`QA card: ${order.code} (${order.id})`);
} finally { await db.$disconnect(); }
