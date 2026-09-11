import path from 'node:path';

export type ExtractionStatus = 'TEXT_EXTRACTED' | 'PARTIAL' | 'OCR_REQUIRED' | 'VISUAL_REVIEW_REQUIRED' | 'ERROR' | 'DUPLICATE' | 'MISSING';
export type ReviewDecision = 'A_CONFIRMAR' | 'VALIDADO' | 'RECHAZADO';

export type SourceRecord = {
  id?: string;
  path: string;
  sourceRoot?: string;
  name?: string;
  ext?: string;
  bytes?: number;
  modified?: string;
  sha256?: string;
  kind?: string;
  extractionStatus?: ExtractionStatus | string;
  pages?: number;
  pagesNeedingOCR?: number[];
  textCharacters?: number;
  textFile?: string;
  error?: string;
  duplicateOf?: string;
};

export type Coverage = {
  totalPages: number | null;
  pagesWithText: number | null;
  pagesNeedingOCR: number[];
  percent: number | null;
  partial: boolean;
};

export type NormalizedSource = SourceRecord & {
  id: string;
  name: string;
  ext: string;
  kind: string;
  extractionStatus: ExtractionStatus;
  reviewStatus: 'PENDING' | 'IN_REVIEW' | 'DECIDED';
  reviewDecision: ReviewDecision;
  coverage: Coverage;
  warnings: string[];
  duplicateOf?: string;
  revisionStatus: 'CURRENT' | 'NEW_REVISION' | 'UNCHANGED';
};

export type ReviewItem = {
  sourceId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  candidate: { kind: string; title: string; technicalClaim: 'A_CONFIRMAR' };
  evidence: { sourceId: string; path: string; textFile?: string; locators: string[] };
  warnings: string[];
  decision: ReviewDecision;
};

export type NormalizedInventory = {
  sources: NormalizedSource[];
  ocrQueue: { sourceId: string; path: string; pages: number[]; reason: string; status: 'PENDING' }[];
  reviewQueue: ReviewItem[];
  summary: { sources: number; uniqueHashes: number; ocrPending: number; reviewPending: number; byExtractionStatus: Record<string, number> };
};

const knownStatuses = new Set<ExtractionStatus>(['TEXT_EXTRACTED', 'PARTIAL', 'OCR_REQUIRED', 'VISUAL_REVIEW_REQUIRED', 'ERROR', 'DUPLICATE', 'MISSING']);

export function isWithinRoot(root: string, candidate: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`);
}

function statusOf(record: SourceRecord, pagesNeedingOCR: number[], totalPages: number | null, unsafePath: boolean): ExtractionStatus {
  if (unsafePath) return 'ERROR';
  if (!record.sha256 || record.error) return record.error ? 'ERROR' : 'MISSING';
  if (record.extractionStatus === 'DUPLICATE') return 'DUPLICATE';
  if (pagesNeedingOCR.length && totalPages && pagesNeedingOCR.length < totalPages) return 'PARTIAL';
  if (pagesNeedingOCR.length) return 'OCR_REQUIRED';
  if (knownStatuses.has(record.extractionStatus as ExtractionStatus)) return record.extractionStatus as ExtractionStatus;
  return record.textCharacters && record.textCharacters > 0 ? 'TEXT_EXTRACTED' : 'VISUAL_REVIEW_REQUIRED';
}

function priorityOf(record: NormalizedSource): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (record.kind === 'MANUAL_OR_CATALOG' || record.extractionStatus === 'OCR_REQUIRED' || record.extractionStatus === 'PARTIAL') return 'HIGH';
  if (record.kind === 'TECHNICAL_REFERENCE' || record.extractionStatus === 'VISUAL_REVIEW_REQUIRED') return 'MEDIUM';
  return 'LOW';
}

export function normalizeInventory(records: SourceRecord[], previous: SourceRecord[] = []): NormalizedInventory {
  const previousByPath = new Map(previous.map(record => [path.resolve(record.path), record]));
  const firstByHash = new Map<string, string>();
  const sources: NormalizedSource[] = records.map((record, index) => {
    const pagesNeedingOCR = [...new Set((record.pagesNeedingOCR ?? []).filter(page => Number.isInteger(page) && page > 0))].sort((a, b) => a - b);
    const totalPages = Number.isInteger(record.pages) && (record.pages as number) > 0 ? record.pages as number : null;
    const unsafePath = Boolean(record.sourceRoot && !isWithinRoot(record.sourceRoot, record.path));
    const status = statusOf(record, pagesNeedingOCR, totalPages, unsafePath);
    const pagesWithText = totalPages === null ? null : Math.max(0, totalPages - pagesNeedingOCR.length);
    const warnings = [...(status === 'PARTIAL' ? ['EXTRACCION_PARCIAL'] : []), ...(status === 'OCR_REQUIRED' ? ['OCR_PENDIENTE'] : []), ...(status === 'VISUAL_REVIEW_REQUIRED' ? ['REVISION_VISUAL_PENDIENTE'] : []), ...(record.error ? [`ERROR_EXTRACCION: ${record.error}`] : []), ...(unsafePath ? ['RUTA_FUERA_DE_SOURCE_ROOT'] : [])];
    const id = record.id ?? `SRC-UNIDENTIFIED-${index + 1}`;
    const previousRecord = previousByPath.get(path.resolve(record.path));
    const revisionStatus = previousRecord && previousRecord.sha256 !== record.sha256 ? 'NEW_REVISION' : previousRecord ? 'UNCHANGED' : 'CURRENT';
    const duplicateOf = record.sha256 && firstByHash.has(record.sha256) ? firstByHash.get(record.sha256) : record.duplicateOf;
    if (record.sha256 && !firstByHash.has(record.sha256)) firstByHash.set(record.sha256, id);
    return { ...record, id, name: record.name ?? path.basename(record.path), ext: record.ext ?? path.extname(record.path).toLowerCase(), kind: record.kind ?? 'UNCLASSIFIED', extractionStatus: duplicateOf && duplicateOf !== id ? 'DUPLICATE' : status, reviewStatus: 'PENDING', reviewDecision: 'A_CONFIRMAR', coverage: { totalPages, pagesWithText, pagesNeedingOCR, percent: totalPages === null ? null : Math.round((pagesWithText! / totalPages) * 100), partial: status === 'PARTIAL' }, warnings: duplicateOf && duplicateOf !== id ? [...warnings, `DUPLICADO_DE: ${duplicateOf}`] : warnings, ...(duplicateOf && duplicateOf !== id ? { duplicateOf } : {}), revisionStatus };
  });
  const ocrQueue = sources.filter(source => source.extractionStatus === 'OCR_REQUIRED' || source.extractionStatus === 'PARTIAL').map(source => ({ sourceId: source.id, path: source.path, pages: source.coverage.pagesNeedingOCR, reason: source.extractionStatus === 'PARTIAL' ? 'Páginas sin texto en una fuente parcialmente extraída.' : 'La fuente no tiene texto extraíble.', status: 'PENDING' as const }));
  const reviewQueue = sources.filter(source => source.extractionStatus !== 'DUPLICATE' && source.extractionStatus !== 'ERROR' && source.extractionStatus !== 'MISSING').map(source => ({ sourceId: source.id, priority: priorityOf(source), candidate: { kind: source.kind, title: source.name, technicalClaim: 'A_CONFIRMAR' as const }, evidence: { sourceId: source.id, path: source.path, ...(source.textFile ? { textFile: source.textFile } : {}), locators: source.coverage.totalPages ? source.coverage.pagesNeedingOCR.map(page => `page:${page}`) : [] }, warnings: source.warnings, decision: 'A_CONFIRMAR' as const }));
  const byExtractionStatus = Object.fromEntries([...new Set(sources.map(source => source.extractionStatus))].map(status => [status, sources.filter(source => source.extractionStatus === status).length]));
  return { sources, ocrQueue, reviewQueue, summary: { sources: sources.length, uniqueHashes: firstByHash.size, ocrPending: ocrQueue.length, reviewPending: reviewQueue.length, byExtractionStatus } };
}
