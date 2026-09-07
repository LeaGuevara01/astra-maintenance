import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';
import { hashPassword } from './auth.js';

export async function seed(db: PrismaClient, env = process.env) {
  const accounts = [
    { email: 'admin@astra.local', name: 'Administración demo', role: 'ADMIN' as const, password: env.SEED_ADMIN_PASSWORD },
    { email: 'tecnico@astra.local', name: 'Técnico demo', role: 'TECHNICIAN' as const, password: env.SEED_TECH_PASSWORD },
    { email: 'consulta@astra.local', name: 'Consulta demo', role: 'VIEWER' as const, password: env.SEED_VIEWER_PASSWORD },
  ];
  for (const account of accounts) if (!account.password || account.password.length < 12) throw new Error(`Required seed password missing or shorter than 12 characters for ${account.email}.`);
  if (new Set(accounts.map(a => a.password)).size !== 3) throw new Error('Seed accounts require distinct passwords.');
  if (env.APP_ENVIRONMENT === 'production') throw new Error('Synthetic seeding is forbidden in production.');
  for (const { password, ...account } of accounts) {
    // Re-running a seed never silently resets an existing identity or password.
    await db.user.upsert({ where: { email: account.email }, create: { ...account, passwordHash: await hashPassword(password!) }, update: {} });
  }
  const filter = await db.part.upsert({ where: { code: 'DEM-FIL-001' }, create: { code: 'DEM-FIL-001', name: 'Filtro de demostración', partNumber: 'A_CONFIRMAR', unit: 'u', onHand: 4 }, update: {} });
  const oil = await db.part.upsert({ where: { code: 'DEM-LUB-001' }, create: { code: 'DEM-LUB-001', name: 'Lubricante de demostración', partNumber: 'A_CONFIRMAR', unit: 'l', onHand: 1 }, update: {} });
  const plan = await db.plan.upsert({ where: { code_revision: { code: 'DEMO-PREV-H', revision: 1 } }, create: { code: 'DEMO-PREV-H', name: 'Preventivo sintético por horas', revision: 1,
    tasks: { create: [
      { code: 'DEM-0300', description: 'Inspección general de demostración', frequency: 300, mandatory: true, blocking: false, sourceReference: 'DATOS SINTÉTICOS - A_CONFIRMAR' },
      { code: 'DEM-0600', description: 'Cambio de filtro de demostración', frequency: 600, mandatory: true, blocking: false, partId: filter.id, quantity: 1, sourceReference: 'DATOS SINTÉTICOS - A_CONFIRMAR' },
      { code: 'DEM-0900', description: 'Revisión auxiliar de demostración', frequency: 900, mandatory: true, blocking: false, sourceReference: 'DATOS SINTÉTICOS - A_CONFIRMAR' },
      { code: 'DEM-1200', description: 'Cambio de lubricante de demostración', frequency: 1200, mandatory: true, blocking: false, partId: oil.id, quantity: 2, sourceReference: 'DATOS SINTÉTICOS - A_CONFIRMAR' },
    ] },
  }, update: {} });
  for (const data of [
    { code: 'AST-001', name: 'Tractor de prueba', family: 'Tractor (sintético)', meter: 600 },
    { code: 'AST-002', name: 'Equipo de apoyo', family: 'Apoyo (sintético)', meter: 1200 },
  ]) await db.asset.upsert({ where: { code: data.code }, create: { ...data, planId: plan.id }, update: {} });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = new PrismaClient();
  seed(db).then(() => console.log('Synthetic seed ready. Existing data and credentials preserved.')).catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
}
