import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const mode = process.argv[2] ?? '--copy';
const handoffPath = join(root, 'docs/HANDOFF.md');
const verificationPath = join(root, 'docs/VERIFICATION.md');
const outputRoot = join(root, 'docs/07-evidence/releases');
const manifestPath = join(root, '.runtime/documentation-audit/lot-3-manifest.json');
const normalize = value => value.replace(/\r\n/g, '\n').trimEnd() + '\n';
const hash = value => createHash('sha256').update(normalize(value)).digest('hex');

function sections(path) {
  const text = normalize(readFileSync(path, 'utf8'));
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];
  const result = new Map();
  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index].index;
    const end = matches[index + 1]?.index ?? text.length;
    result.set(matches[index][1].trim(), normalize(text.slice(start, end)));
  }
  return result;
}

const records = [
  {
    id: 'ASTRA-EVIDENCE-20260915-01', path: '2026-09-15/01-document-review-persistence.md', title: 'Persistencia de revisión documental y corpus autorizado', appliesTo: 'multiple-historical-sha', staging: 'historical',
    handoff: ['Carga autorizada del corpus técnico — 2026-09-15 Argentina'],
    verification: ['Base anterior y staging comprobado', 'Evidencia histórica reutilizable', 'Revisión persistente — 2026-09-15', 'Cierre del incremento persistente']
  },
  {
    id: 'ASTRA-EVIDENCE-20260915-02', path: '2026-09-15/02-document-pagination-and-history.md', title: 'Paginación e historial documental', appliesTo: 'working-tree-on-54beabe', staging: 'not-deployed',
    handoff: ['Incremento autónomo — paginación', 'Incremento: historial de revisión'],
    verification: ['Paginación documental — 2026-09-15', 'Historial documental — 2026-09-15']
  },
  {
    id: 'ASTRA-EVIDENCE-20260915-03', path: '2026-09-15/03-source-review-queue.md', title: 'Cola de revisión por fuente', appliesTo: '2b6cd68943018c45ec73ac71ad5abe3807ca3e6f', staging: 'historical',
    handoff: ['Incremento: cola de revisión por fuente'], verification: ['Cola de revisión por fuente — 2026-09-15']
  },
  {
    id: 'ASTRA-EVIDENCE-20260915-04', path: '2026-09-15/04-document-analysis-dry-run.md', title: 'Analizador documental dry-run', appliesTo: 'A_CONFIRMAR', staging: 'not-deployed',
    handoff: ['Incremento: analizador documental dry-run'], verification: ['Analizador documental dry-run — 2026-09-15']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-01', path: '2026-09-16/01-assisted-findings.md', title: 'Hallazgos asistidos persistentes', appliesTo: 'working-tree', staging: 'not-deployed',
    handoff: ['Incremento: hallazgos asistidos persistentes — 2026-09-16'], verification: ['2026-09-16 — hallazgos asistidos persistentes']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-02', path: '2026-09-16/02-provenance-and-derivation.md', title: 'Procedencia y derivación asistida', appliesTo: 'working-tree', staging: 'not-deployed',
    handoff: ['Incremento: procedencia y derivación asistida — 2026-09-16'], verification: ['2026-09-16 — procedencia y derivación asistida']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-03', path: '2026-09-16/03-catalog-row-segmentation.md', title: 'Segmentación por ítem de catálogo', appliesTo: 'working-tree', staging: 'not-deployed',
    handoff: ['Incremento: segmentación por ítem de catálogo — 2026-09-16'], verification: ['2026-09-16 — segmentación por ítem de catálogo']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-04', path: '2026-09-16/04-equipment-references.md', title: 'Referencias de equipo y manual', appliesTo: 'working-tree', staging: 'not-deployed',
    handoff: ['Ajuste: referencias de equipo/manual — 2026-09-16'], verification: ['2026-09-16 — referencias de equipo/manual']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-05', path: '2026-09-16/05-ui-entity-slice.md', title: 'Vertical slice UI de entidades', appliesTo: 'a6cf1a8a38aa6670066fa477dfe1f4c96c199d87', staging: 'historical',
    handoff: ['Vertical slice UI de entidades — 2026-09-16'], verification: ['2026-09-16 — vertical slice UI de entidades']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-06', path: '2026-09-16/06-documentation-baseline.md', title: 'Base y consolidación documental', appliesTo: 'working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9', staging: 'not-deployed',
    handoff: ['Base documental canónica — 2026-09-16'], verification: ['2026-09-16 — base documental canónica', 'Correcciones documentales — 2026-09-15', 'Consolidación documental anterior']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-07', path: '2026-09-16/07-openapi-parity.md', title: 'ASTRA-DOC-001 paridad OpenAPI', appliesTo: 'working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9', staging: 'not-deployed',
    handoff: ['ASTRA-DOC-001 — paridad OpenAPI documental'], verification: ['2026-09-16 — ASTRA-DOC-001 paridad OpenAPI']
  },
  {
    id: 'ASTRA-EVIDENCE-20260916-08', path: '2026-09-16/08-documentation-archive-lots.md', title: 'Consolidación y archivo documental', appliesTo: 'working-tree-on-c8e2efb3854caeca92e09a6a46912827775234b9', staging: 'not-deployed',
    handoff: ['Incremento documental: archivo histórico, lote 1 — 2026-09-16', 'Incremento documental: revisión del lote 2 — 2026-09-16', 'Incremento documental: diseño del lote 3 — 2026-09-16'],
    verification: ['2026-09-16 — archivo histórico, lote 1', '2026-09-16 — revisión documental del lote 2', '2026-09-16 — diseño de extracción del lote 3']
  }
];

function sourceBlock(map, heading, source) {
  const content = map.get(heading);
  if (!content) throw new Error(`Missing section ${source}#${heading}`);
  return { source, heading, content, sha256: hash(content) };
}

function renderBlocks(blocks) {
  if (!blocks.length) return '_Sin bloque en el archivo de origen._\n';
  return blocks.map(block => `<!-- source-block:${block.source}#${block.heading};sha256=${block.sha256} -->\n${block.content}<!-- end-source-block -->\n`).join('\n');
}

function copy() {
  const handoff = sections(handoffPath);
  const verification = sections(verificationPath);
  const assignedHandoff = new Set();
  const assignedVerification = new Set();
  const manifest = { generatedAt: new Date().toISOString(), mode: 'copy', sourceFiles: ['docs/HANDOFF.md', 'docs/VERIFICATION.md'], records: [], unassigned: {} };

  for (const record of records) {
    const handoffBlocks = record.handoff.map(heading => { assignedHandoff.add(heading); return sourceBlock(handoff, heading, 'docs/HANDOFF.md'); });
    const verificationBlocks = record.verification.map(heading => { assignedVerification.add(heading); return sourceBlock(verification, heading, 'docs/VERIFICATION.md'); });
    const sourceSections = [...handoffBlocks, ...verificationBlocks].map(block => `  - "${block.source}#${block.heading.replaceAll('"', '\\"')}"`).join('\n');
    const body = normalize(`---
document_id: ${record.id}
title: "${record.title}"
type: evidence
status: ${record.appliesTo.startsWith('working-tree') ? 'current-uncommitted' : 'historical'}
owner: integrator
updated_at: 2026-09-16
applies_to: ${record.appliesTo}
staging: ${record.staging}
source_sections:
${sourceSections}
---

# ${record.title}

Este registro conserva bloques extraídos mecánicamente. Los headings, cifras, SHA, comandos, resultados y límites dentro de cada bloque permanecen literales.

## Contexto y resultado

${renderBlocks(handoffBlocks)}
## Verificación ejecutada

${renderBlocks(verificationBlocks)}
## Relaciones

- [Índice de releases](../README.md)
- [Estado actual](../../../CURRENT-STATUS.md)
- [Verificación vigente](../../../VERIFICATION.md)
`);
    const target = join(outputRoot, record.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
    const checks = [...handoffBlocks, ...verificationBlocks].map(block => ({ source: block.source, heading: block.heading, sha256: block.sha256, embedded: body.includes(block.content) }));
    manifest.records.push({ id: record.id, path: `docs/07-evidence/releases/${record.path}`, checks, valid: checks.every(check => check.embedded) });
  }

  manifest.unassigned.handoff = [...handoff.keys()].filter(heading => !assignedHandoff.has(heading));
  manifest.unassigned.verification = [...verification.keys()].filter(heading => !assignedVerification.has(heading));
  manifest.retained = { handoff: [], verification: ['Pendientes de verificación'] };
  manifest.valid = manifest.records.every(record => record.valid)
    && manifest.unassigned.handoff.length === 0
    && manifest.unassigned.verification.length === 1
    && manifest.unassigned.verification[0] === 'Pendientes de verificación';
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  if (!manifest.valid) throw new Error(`Integrity manifest is not valid: ${manifestPath}`);
  process.stdout.write(JSON.stringify({ valid: manifest.valid, records: manifest.records.length, checks: manifest.records.flatMap(record => record.checks).length, unassigned: manifest.unassigned }, null, 2) + '\n');
}

function compact() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!manifest.valid || manifest.records.length !== records.length || manifest.records.some(record => !record.valid)) throw new Error('Valid copy manifest required before compaction.');
  const verification = sections(verificationPath);
  const pending = verification.get('Pendientes de verificación');
  if (!pending) throw new Error('Pending verification section missing.');

  const rows = records.map(record => `| ${record.id} | ${record.title} | \`${record.appliesTo}\` | [registro](07-evidence/releases/${record.path}) |`).join('\n');
  writeFileSync(handoffPath, normalize(`# Registro de handoff — actualizado 2026-09-16

El estado vigente está en [CURRENT-STATUS.md](CURRENT-STATUS.md) y el trabajo siguiente en [NEXT-TASK.md](NEXT-TASK.md). Este archivo es un índice compatible de continuidad; los bloques cronológicos fueron extraídos con integridad verificada a registros por incremento.

## Identidad de continuidad

- Rama documental: \`docs/ASTRA-documentation-baseline\`.
- Base de la rama: \`c8e2efb3854caeca92e09a6a46912827775234b9\`.
- Árbol documental/OpenAPI: verificado pero sin commit limpio atribuible.
- Staging observado: identidad API \`c8e2efb\`; los cambios locales no están desplegados.

## Registros por incremento

| ID | Incremento | Identidad declarada | Evidencia |
|---|---|---|---|
${rows}

## Lectura segura

- Un registro histórico no prueba el estado del runtime actual.
- Checkout, SHA verificado y SHA desplegado son identidades independientes.
- Ningún registro documental autoriza aplicar catálogo, modificar stock, mergear main o desplegar producción.
- Las cifras técnicas y equivalencias conservan sus límites originales y \`A_CONFIRMAR\` cuando corresponde.
`));

  writeFileSync(verificationPath, normalize(`# Verificación de ASTRA Maintenance

Actualizado: 2026-09-16. Este archivo conserva el estado verificable actual y enlaza la evidencia histórica por incremento. [CURRENT-STATUS.md](CURRENT-STATUS.md) distingue checkout, SHA probado y SHA desplegado.

## Estado verificable actual

- Base local: \`c8e2efb3854caeca92e09a6a46912827775234b9\`.
- Árbol documental/OpenAPI sin commit limpio: \`scripts/Verify.ps1 -SkipInstall\` PASS, cinco migraciones sin pendientes, typecheck API/web, 54/54 pruebas y build API/web.
- OpenAPI local: 35 operaciones cubiertas por prueba de paridad; cambios no desplegados.
- Staging observado: health ready y API version \`c8e2efb\`; footer no reverificado.
- Revisión visual de paginaciones y drag desktop: omitida por decisión del usuario, no ejecutada.

## Índice de evidencia

Consultar [07-evidence/verification-index.md](07-evidence/verification-index.md) para el resumen por fecha/SHA y [07-evidence/releases/README.md](07-evidence/releases/README.md) para los bloques literales extraídos.

${pending}
## Criterios de lectura

- “PASS” aplica únicamente al comando y árbol/SHA indicado.
- “Desplegado históricamente” no describe el runtime actual.
- Una comprobación API no equivale a aceptación visual.
- Datos sintéticos o corpus documental no validan equivalencias OEM, stock ni producción.
`));
  process.stdout.write(JSON.stringify({ compacted: true, records: records.length, retainedVerification: ['Pendientes de verificación'] }, null, 2) + '\n');
}

function verify() {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const checks = [];
  for (const record of manifest.records) {
    const content = readFileSync(join(root, record.path), 'utf8');
    const blocks = [...content.matchAll(/<!-- source-block:([^;]+);sha256=([a-f0-9]{64}) -->\r?\n([\s\S]*?)<!-- end-source-block -->/g)];
    for (const match of blocks) {
      const actual = hash(match[3]);
      checks.push({ record: record.path, source: match[1], expected: match[2], actual, valid: actual === match[2] });
    }
  }
  const expected = manifest.records.flatMap(record => record.checks).length;
  const valid = manifest.valid && checks.length === expected && checks.every(check => check.valid);
  if (!valid) throw new Error(`Extracted block verification failed: expected ${expected}, found ${checks.length}, invalid ${checks.filter(check => !check.valid).length}`);
  process.stdout.write(JSON.stringify({ valid, records: manifest.records.length, blocks: checks.length, invalid: 0 }, null, 2) + '\n');
}

if (mode === '--copy') copy();
else if (mode === '--compact') compact();
else if (mode === '--verify') verify();
else throw new Error('Use --copy, --compact or --verify.');
