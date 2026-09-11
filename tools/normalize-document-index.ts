import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { normalizeInventory, type SourceRecord } from '../apps/api/src/document-intelligence.js';

function option(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) throw new Error(`Falta ${name}. Uso: npm run documents:normalize -- --input <index.json> --output <directorio> [--previous <index.json>]`);
  return value;
}

const input = option('--input');
const output = option('--output');
const previousArg = process.argv.includes('--previous') ? option('--previous') : undefined;
const records = JSON.parse(await readFile(input, 'utf8')) as SourceRecord[];
const previous = previousArg ? JSON.parse(await readFile(previousArg, 'utf8')) as SourceRecord[] : [];
const normalized = normalizeInventory(records, previous);
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'normalized-index.json'), JSON.stringify(normalized.sources, null, 2), 'utf8');
await writeFile(path.join(output, 'ocr-queue.json'), JSON.stringify(normalized.ocrQueue, null, 2), 'utf8');
await writeFile(path.join(output, 'review-queue.json'), JSON.stringify(normalized.reviewQueue, null, 2), 'utf8');
await writeFile(path.join(output, 'summary.json'), JSON.stringify({ ...normalized.summary, note: 'La extracción/OCR es evidencia parcial; ninguna cola confirma una especificación técnica.' }, null, 2), 'utf8');
console.log(JSON.stringify(normalized.summary));
