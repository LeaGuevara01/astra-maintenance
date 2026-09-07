import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { readConfig } from './config.js';

const db = new PrismaClient();
const config = readConfig();
const port = Number(process.env.PORT ?? 4301);
const server = createApp(db, config).listen(port, process.env.HOST ?? '0.0.0.0', () => {
  console.log(`ASTRA API ${config.version} listening on ${port}; environment=${config.environment}; commit=${config.commit}`);
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  server.close(() => void db.$disconnect().then(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
});
