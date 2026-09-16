import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';

const root = process.cwd();
const auditDir = 'docs/documentation-audit';
const runtimeDir = '.runtime/documentation-audit';
const extensions = new Set(['.md', '.mdx', '.txt', '.rst', '.adoc', '.json', '.yaml', '.yml', '.toml', '.csv', '.sql', '.drawio', '.puml', '.mermaid', '.pdf', '.prisma']);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const csv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const words = text => (text.match(/[\p{L}\p{N}_-]+/gu) || []).length;
const title = (path, text) => text.match(/^#\s+(.+)$/m)?.[1]?.trim() || basename(path, extname(path));
const sha = text => createHash('sha256').update(text).digest('hex');
const rel = path => path.replaceAll('\\', '/');

const canonical = new Set([
  'README.md', 'AGENTS.md', 'docs/README.md', 'docs/CURRENT-STATUS.md', 'docs/PRODUCT.md', 'docs/API-CONTRACT.md', 'docs/ADR-001-architecture.md',
  'docs/01-architecture/domain-model.md', 'docs/01-architecture/state-machines.md', 'docs/01-architecture/invariants.md', 'docs/08-reference/permissions-matrix.md',
  'docs/03-interfaces/backend-architecture.md', 'docs/03-interfaces/frontend-architecture.md', 'docs/08-reference/environment-variables.md', 'docs/08-reference/openapi-parity.md',
  'docs/00-overview/documentation-policy.md', 'docs/01-architecture/adr/README.md', 'docs/07-evidence/verification-index.md', 'docs/02-domains/technical-information/corpus-policy.md',
  'docs/04-operations/local-development.md', 'docs/04-operations/verification.md', 'docs/04-operations/staging.md', 'docs/04-operations/backup-restore.md', 'docs/04-operations/rollback.md',
  'docs/07-evidence/capability-matrix.md', 'docs/archive/README.md',
  'docs/ADR-002-document-review.md', 'docs/AGENT-OPERATING-MODEL.md', 'docs/DEFINITION-OF-DONE.md',
  'docs/OPERATIONS.md', 'docs/VERIFICATION.md', 'docs/HANDOFF.md', 'prisma/schema.prisma'
]);
const historical = /^(docs\/(?:archive\/tasks\/(?:ASTRA-006|ASTRA-007(?:-REVIEW)?|TASK-ASTRA-001)|07-evidence\/releases\/2026-09-(?:15|16)\/[^/]+)\.md)$/;
const partial = new Set(['docs/NEXT-TASK.md', 'docs/PLAN-STATUS.md', 'docs/ROADMAP-EXTENDED.md', 'docs/DOCUMENT-AI-REVIEW-PLAN.md', 'docs/UI-ARCHITECTURE-MIGRATION-PLAN.md', 'docs/CORPUS-ANALYSIS.md', 'docs/TECHNICAL-REFERENCE.md', 'docs/documentation-audit/ARCHIVE-MIGRATION-PLAN.md', 'docs/documentation-audit/LOT-3-EXTRACTION-DESIGN.md']);

function classify(path) {
  const e = extname(path).toLowerCase();
  let documentType = 'configuration';
  let domain = 'development';
  let module = 'repository';
  let scope = 'system';
  let status = 'vigente';
  if (e === '.md' || e === '.mdx' || e === '.rst' || e === '.adoc' || e === '.txt') documentType = 'narrative-document';
  if (path.includes('/migrations/')) [documentType, domain, module] = ['migration', 'data', 'persistence'];
  else if (path === 'prisma/schema.prisma') [documentType, domain, module] = ['schema', 'data', 'persistence'];
  else if (path.includes('.github/workflows/')) [documentType, domain, module] = ['automation', 'development', 'ci'];
  else if (path.includes('.github/')) [documentType, domain, module] = ['governance', 'development', 'coordination'];
  else if (/API-CONTRACT/.test(path)) [documentType, domain, module] = ['contract', 'architecture', 'api'];
  else if (/PRODUCT/.test(path)) [documentType, domain, module] = ['product-contract', 'product', 'preventive-maintenance'];
  else if (/ADR-/.test(path)) [documentType, domain, module] = ['decision-record', 'architecture', 'cross-cutting'];
  else if (/OPERATIONS|compose|Dockerfile|images\.lock/.test(path)) [documentType, domain, module] = ['operations', 'operations', 'deployment'];
  else if (/VERIFICATION|07-evidence\/releases\//.test(path)) [documentType, domain, module] = ['verification-record', 'quality', 'verification'];
  else if (/HANDOFF/.test(path)) [documentType, domain, module] = ['handoff', 'development', 'coordination'];
  else if (/ROADMAP|NEXT-TASK|PLAN-STATUS|AUTONOMOUS/.test(path)) [documentType, domain, module] = ['plan', 'planning', 'roadmap'];
  else if (/CORPUS|TECHNICAL-REFERENCE|DOCUMENT-AI|ASTRA-006|ASTRA-007/.test(path)) [documentType, domain, module] = ['design-or-evidence', 'technical-information', 'document-intelligence'];
  else if (/UI-ARCHITECTURE/.test(path)) [documentType, domain, module] = ['design-plan', 'frontend', 'ui'];
  else if (/README/.test(path)) [documentType, domain, module] = ['readme', path.startsWith('apps/api') ? 'backend' : path.startsWith('apps/web') ? 'frontend' : 'overview', 'onboarding'];
  if (historical.test(path)) status = 'historico';
  else if (partial.has(path)) status = 'parcialmente-vigente';
  return { documentType, domain, module, scope, status };
}

const versioned = new Set(git('ls-files').split(/\r?\n/).filter(Boolean).map(rel));
const tracked = git('ls-files', '--cached', '--others', '--exclude-standard').split(/\r?\n/).filter(Boolean).map(rel);
const generatedOutputs = new Set([`${auditDir}/system-inventory.csv`, `${auditDir}/overlap-candidates.csv`, `${auditDir}/summary.json`]);
const eligible = tracked.filter(path => existsSync(path) && extensions.has(extname(path).toLowerCase()) && !generatedOutputs.has(path));
const rows = eligible.map((path, index) => {
  const text = readFileSync(path, 'utf8');
  const meta = classify(path);
  const log = git('log', '-1', '--format=%H|%aI|%an', '--', path).split('|');
  const created = git('log', '--follow', '--format=%aI', '--', path).split(/\r?\n/).filter(Boolean).at(-1) || '';
  const headings = (text.match(/^#{1,6}\s+/gm) || []).length;
  const links = (text.match(/\[[^\]]+\]\([^)]+\)|https?:\/\/\S+/g) || []).length;
  const codeBlocks = Math.floor((text.match(/^```/gm) || []).length / 2);
  const id = `SYS-${String(index + 1).padStart(3, '0')}`;
  return {
    document_id: id, path, filename: basename(path), extension: extname(path).toLowerCase(), title: title(path, text),
    document_type: meta.documentType, domain: meta.domain, module: meta.module, scope: meta.scope,
    version: path.includes('API-CONTRACT') ? 'v1' : path.includes('AGENT-OPERATING') ? 'v1' : 'sin-version-explicita',
    status: meta.status, created_at: created, updated_at: log[1] || '', author_if_known: log[2] || '', source: versioned.has(path) ? 'git-tracked' : 'working-tree-new',
    canonical: canonical.has(path) ? 'yes' : 'no', duplicate_of: '', supersedes: '', superseded_by: '', related_documents: '',
    related_code: path.includes('API-CONTRACT') ? 'apps/api/src/app.ts;apps/api/src/document-review.ts' : path === 'prisma/schema.prisma' ? 'apps/api/src/**' : '',
    related_entities: '', technical_corpus_reference: /CORPUS|TECHNICAL-REFERENCE|DOCUMENT-AI|ASTRA-006|ASTRA-007/.test(path) ? 'yes-reference-only' : 'no',
    notes: historical.test(path) ? 'Conservar como evidencia histórica; no usar como contrato vigente.' : '',
    word_count: words(text), line_count: text.split(/\r?\n/).length, size: statSync(path).size, heading_count: headings,
    link_count: links, code_block_count: codeBlocks, last_git_change: log[0] || '', content_sha256: sha(text)
  };
});

const keys = Object.keys(rows[0]);
mkdirSync(auditDir, { recursive: true });
mkdirSync(runtimeDir, { recursive: true });
writeFileSync(`${auditDir}/system-inventory.csv`, [keys.map(csv).join(','), ...rows.map(row => keys.map(key => csv(row[key])).join(','))].join('\n') + '\n');

const textRows = rows.filter(row => ['.md', '.mdx', '.txt', '.rst', '.adoc'].includes(row.extension));
const tokens = path => new Set(readFileSync(path, 'utf8').toLowerCase().replace(/```[\s\S]*?```/g, ' ').match(/[a-záéíóúñ0-9_-]{4,}/g) || []);
const tokenMap = new Map(textRows.map(row => [row.path, tokens(row.path)]));
const pairs = [];
for (let i = 0; i < textRows.length; i++) for (let j = i + 1; j < textRows.length; j++) {
  if (textRows[i].path.includes('docs/07-evidence/releases/') || textRows[j].path.includes('docs/07-evidence/releases/')) continue;
  const a = tokenMap.get(textRows[i].path), b = tokenMap.get(textRows[j].path);
  const intersection = [...a].filter(value => b.has(value)).length;
  const similarity = intersection / new Set([...a, ...b]).size;
  if (similarity >= 0.18) pairs.push({ document_a: textRows[i].path, document_b: textRows[j].path, similarity: similarity.toFixed(3), classification: similarity >= 0.8 ? 'Near duplicate' : similarity >= 0.5 ? 'Partial overlap' : 'Complementary document', review: 'human-review-required' });
}
const pairKeys = Object.keys(pairs[0] || { document_a: '', document_b: '', similarity: '', classification: '', review: '' });
writeFileSync(`${auditDir}/overlap-candidates.csv`, [pairKeys.map(csv).join(','), ...pairs.sort((a,b) => b.similarity.localeCompare(a.similarity)).map(row => pairKeys.map(key => csv(row[key])).join(','))].join('\n') + '\n');

const countBy = field => Object.fromEntries([...new Set(rows.map(row => row[field]))].sort().map(value => [value, rows.filter(row => row[field] === value).length]));
const summary = {
  generatedAt: new Date().toISOString(), head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'),
  versionedFiles: versioned.size, discoveredWorkingTreeFiles: tracked.length, inventoriedSystemArtifacts: rows.length, narrativeDocuments: textRows.length,
  canonical: rows.filter(row => row.canonical === 'yes').length, historical: rows.filter(row => row.status === 'historico').length,
  current: rows.filter(row => row.status === 'vigente').length, partiallyCurrent: rows.filter(row => row.status === 'parcialmente-vigente').length,
  obsolete: 0, exactDuplicates: rows.length - new Set(rows.map(row => row.content_sha256)).size, unclassified: 0, withoutExplicitVersion: rows.filter(row => row.version === 'sin-version-explicita').length,
  withoutClearOwner: rows.length, withoutGitAuthor: rows.filter(row => !row.author_if_known).length, overlapCandidates: pairs.length,
  byDomain: countBy('domain'), byModule: countBy('module'), byType: countBy('document_type'), byExtension: countBy('extension'), byStatus: countBy('status')
};
writeFileSync(`${auditDir}/summary.json`, JSON.stringify(summary, null, 2) + '\n');

const corpusIndex = '.runtime/sources/index.json';
if (existsSync(corpusIndex)) {
  const sources = JSON.parse(readFileSync(corpusIndex, 'utf8'));
  const corpusRows = sources.map(source => ({
    document_id: source.id, path: '', filename: source.name, extension: source.ext, title: source.name,
    document_type: source.kind, domain: source.kind === 'COMMERCIAL_HISTORY' ? 'commercial-history' : source.kind === 'INTERNAL_WORKFLOW' ? 'classification-review-required' : 'technical-information',
    module: 'external-corpus', scope: source.kind === 'INTERNAL_WORKFLOW' ? 'classification-review-required' : 'technical-corpus',
    version: source.sha256, status: source.reviewStatus, created_at: '', updated_at: source.modified, author_if_known: '', source: 'local-external-corpus',
    canonical: 'no', duplicate_of: source.extractionStatus === 'DUPLICATE' ? 'same-sha256-source' : '', supersedes: '', superseded_by: '',
    related_documents: '', related_code: '', related_entities: 'DocumentRevision', technical_corpus_reference: 'self',
    notes: 'External evidence only; not a system contract and not technical validation.', word_count: '', line_count: '', size: source.bytes,
    heading_count: '', link_count: '', code_block_count: '', last_git_change: '', content_sha256: source.sha256,
    extraction_status: source.extractionStatus, pages: source.pages, pages_needing_ocr: (source.pagesNeedingOCR || []).join(';'), text_characters: source.textCharacters
  }));
  const corpusKeys = Object.keys(corpusRows[0]);
  writeFileSync(`${runtimeDir}/technical-corpus-inventory.csv`, [corpusKeys.map(csv).join(','), ...corpusRows.map(row => corpusKeys.map(key => csv(row[key])).join(','))].join('\n') + '\n');
  const corpusSummary = {
    generatedAt: new Date().toISOString(), selected: sources.length, uniqueHashes: new Set(sources.map(source => source.sha256)).size,
    duplicateRows: sources.length - new Set(sources.map(source => source.sha256)).size,
    byKind: Object.fromEntries([...new Set(sources.map(source => source.kind))].sort().map(kind => [kind, sources.filter(source => source.kind === kind).length])),
    byExtractionStatus: Object.fromEntries([...new Set(sources.map(source => source.extractionStatus))].sort().map(status => [status, sources.filter(source => source.extractionStatus === status).length])),
    note: 'Inventario local separado. No implica validación técnica, equivalencia OEM ni autorización transaccional.'
  };
  writeFileSync(`${runtimeDir}/technical-corpus-summary.json`, JSON.stringify(corpusSummary, null, 2) + '\n');
}

console.log(JSON.stringify(summary, null, 2));
