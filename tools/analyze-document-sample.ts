import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { analyzeDocumentSource } from '../apps/api/src/document-analysis.js';
import type { SourceRecord } from '../apps/api/src/document-intelligence.js';

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function listOption(name: string) {
  return (option(name) ?? '').split(',').map(value => value.trim()).filter(Boolean);
}

const input = option('--input') ?? '.runtime/sources/index.json';
const output = option('--output') ?? '.runtime/document-analysis';
const limit = Number(option('--limit') ?? 12);
const ids = new Set(listOption('--ids'));
const defaultNames = [/JOHN DEERE 6615 FILTRO/i, /MANUAL DE OPERADOR MXY/i, /MANUAL MZ54/i, /MANUAL DE REPUESTOS RICHIGER/i, /STIHL TS420/i, /CAT[ÁA]LOGO DE RETENES/i, /HILUX 2017/i, /TABLA DE EQUIVALENCIAS/i, /BULNES/i, /TECNOLOG[ÍI]A P[ÉE]REZ/i];
const persist = process.argv.includes('--persist');
const analyzerId = option('--analyzer-id') ?? 'astra-local-patterns';
const analyzerVersion = option('--analyzer-version') ?? '2026-09-16';

const indexPath = path.resolve(input);
const root = path.dirname(indexPath);
const records = JSON.parse(await readFile(indexPath, 'utf8')) as SourceRecord[];
const technical = records.filter(record => record.kind === 'MANUAL_OR_CATALOG' || record.kind === 'TECHNICAL_REFERENCE');
const selected = ids.size
  ? technical.filter(record => record.id && ids.has(record.id))
  : technical.filter(record => record.extractionStatus !== 'DUPLICATE' && defaultNames.some(pattern => pattern.test(record.name ?? record.path))).slice(0, limit);

const analyses = [];
for (const source of selected) {
  const textPath = source.textFile ? path.resolve(root, source.textFile) : '';
  let text = '';
  if (textPath) {
    try { text = await readFile(textPath, 'utf8'); }
    catch { text = ''; }
  }
  analyses.push(analyzeDocumentSource(source, text));
}

await mkdir(output, { recursive: true });
const findings = analyses.flatMap(analysis => analysis.findings);
const summary = {
  analyzedAt: new Date().toISOString(),
  input,
  selectedSources: analyses.length,
  findings: findings.length,
  byFamily: Object.fromEntries([...new Set(analyses.map(analysis => analysis.family))].sort().map(family => [family, analyses.filter(analysis => analysis.family === family).length])),
  byFindingKind: Object.fromEntries([...new Set(findings.map(finding => finding.kind))].sort().map(kind => [kind, findings.filter(finding => finding.kind === kind).length])),
  note: 'Dry-run local: los hallazgos son propuestas A_CONFIRMAR, no validan compatibilidad ni modifican stock.',
};

await writeFile(path.join(output, 'analyses.json'), JSON.stringify(analyses, null, 2), 'utf8');
await writeFile(path.join(output, 'findings.json'), JSON.stringify(findings, null, 2), 'utf8');
await writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

if (persist) {
  const db = new PrismaClient();
  try {
    for (const analysis of analyses) {
      const revision = await db.documentRevision.findUnique({ where: { sourceId_sha256: { sourceId: analysis.sourceId, sha256: analysis.sha256 } } });
      if (!revision) throw new Error(`No existe DocumentRevision para ${analysis.sourceId} / ${analysis.sha256}. Cargá primero el corpus técnico.`);
      const existing = await db.documentAnalysisRun.findUnique({ where: { revisionId_analyzerId_analyzerVersion: { revisionId: revision.id, analyzerId, analyzerVersion } }, include: { findings: { select: { id: true }, take: 1 } } });
      if (existing?.findings.length) throw new Error(`Ya existen hallazgos para ${analysis.sourceId} con ${analyzerId}@${analyzerVersion}. Usá otra versión de analizador para preservar revisiones humanas.`);
      const run = existing ?? await db.documentAnalysisRun.create({ data: { revisionId: revision.id, analyzerId, analyzerVersion, summary: { documentType: analysis.documentType, family: analysis.family, extractionStatus: analysis.extractionStatus, pages: analysis.pages, pagesNeedingOCR: analysis.pagesNeedingOCR, warnings: analysis.warnings } } });
      if (!existing) {
        await db.documentFinding.createMany({ data: analysis.findings.map(finding => ({ runId: run.id, kind: finding.kind, code: finding.code, name: finding.name, partNumber: finding.partNumber, unit: finding.unit, locator: finding.locator, applicability: finding.applicability, confidence: finding.confidence, reviewStatus: finding.reviewStatus, stockEffect: finding.stockEffect, evidence: finding.evidence, warnings: finding.warnings })) });
      }
    }
  } finally {
    await db.$disconnect();
  }
}

console.log(JSON.stringify({ ...summary, persisted: persist }));
