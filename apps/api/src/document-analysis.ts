import path from 'node:path';
import type { SourceRecord } from './document-intelligence.js';

export type FindingKind = 'PART_CANDIDATE' | 'MAINTENANCE_TOPIC' | 'OCR_REQUIRED' | 'VISUAL_REVIEW_REQUIRED';
export type FindingConfidence = 'ALTA' | 'MEDIA' | 'BAJA';

export type DocumentFinding = {
  id: string;
  sourceId: string;
  kind: FindingKind;
  title: string;
  code: string;
  name: string;
  partNumber: string;
  unit: string;
  locator: string;
  applicability: string;
  confidence: FindingConfidence;
  reviewStatus: 'A_CONFIRMAR';
  stockEffect: 'NONE';
  evidence: { sourceId: string; sha256: string; textLocator: string; snippet: string };
  warnings: string[];
};

export type DocumentAnalysis = {
  sourceId: string;
  title: string;
  sha256: string;
  documentType: string;
  family: string;
  extractionStatus: string;
  pages: number | null;
  pagesNeedingOCR: number[];
  findings: DocumentFinding[];
  warnings: string[];
};

const familyRules = [
  ['John Deere', /\b(john\s*deere|jd|[as]t\d{5,6}|an\d{6})\b/i],
  ['Case IH / Puma', /\b(case\s*ih|puma|cnh)\b/i],
  ['Toyota Hilux', /\b(hilux|toyota)\b/i],
  ['STIHL', /\bstihl\b/i],
  ['Husqvarna / MZ', /\b(husqvarna|mz54)\b/i],
  ['Siembra / PLA / MXY', /\b(pla|mxy|siembra|dosificador|richiger)\b/i],
  ['Filtros y equivalencias', /\b(filtro|equivalenc)\b/i],
  ['Rodamientos y retenes', /\b(rodamiento|reten|ret[eé]n)\b/i],
  ['Lubricantes y seguridad', /\b(gulf|lubric|aceite|hoja[_\s-]*seguridad|ficha[_\s-]*t[eé]cnica)\b/i],
  ['Herramientas y taller', /\b(herramienta|taller|bremen|tecnomax)\b/i],
  ['Eléctrico / Kalop', /\b(kalop|cable|fotocontrol|grampa)\b/i],
] as const;

const partLikePattern = /\b(?:[A-Z]{1,5}[-\s]?\d{3,8}[A-Z0-9-]*|\d{5,8}[A-Z]?)\b/g;
const stopCodes = new Set(['2023', '2024', '2025', '2026']);
const rejectedCodePrefixes = /^(?:ISO|SAE|DIN|IRAM|DEERE|JOHN|CASE|HILUX|TOYOTA)\d+/;

function familyOf(source: SourceRecord, text: string) {
  const title = `${source.name ?? ''} ${source.path}`;
  const byTitle = familyRules.find(([, pattern]) => pattern.test(title))?.[0];
  if (byTitle) return byTitle;
  return familyRules.find(([, pattern]) => pattern.test(text.slice(0, 800)))?.[0] ?? 'A clasificar';
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function snippetAround(text: string, index: number, size = 160) {
  const start = Math.max(0, index - size);
  const end = Math.min(text.length, index + size);
  return cleanText(text.slice(start, end));
}

function locatorFor(text: string, index: number) {
  const before = text.slice(0, index);
  const pageMatch = [...before.matchAll(/\bpage[:\s]+(\d+)\b/gi)].at(-1);
  if (pageMatch) return `page:${pageMatch[1]}`;
  const line = before.split(/\r?\n/).length;
  return `text-line:${line}`;
}

function contextName(snippet: string, code: string) {
  const lower = snippet.toLocaleLowerCase('es-AR');
  if (lower.includes('filtro')) return `Posible filtro asociado a ${code}`;
  if (lower.includes('reten') || lower.includes('retén')) return `Posible retén asociado a ${code}`;
  if (lower.includes('rodamiento')) return `Posible rodamiento asociado a ${code}`;
  if (lower.includes('aceite') || lower.includes('lubric')) return `Posible lubricante o insumo asociado a ${code}`;
  if (lower.includes('correa')) return `Posible correa asociada a ${code}`;
  return `Posible identificador técnico ${code}`;
}

function confidenceFor(source: SourceRecord, snippet: string): FindingConfidence {
  if (source.extractionStatus === 'TEXT_EXTRACTED' && /\b(filtro|ret[eé]n|rodamiento|correa|pieza|repuesto)\b/i.test(snippet)) return 'MEDIA';
  if (source.extractionStatus === 'TEXT_EXTRACTED') return 'BAJA';
  return 'BAJA';
}

function sourceWarnings(source: SourceRecord) {
  return [
    ...(source.pagesNeedingOCR?.length ? ['OCR_PARCIAL_PENDIENTE'] : []),
    ...(!source.sha256 ? ['SHA256_FALTANTE'] : []),
    ...(source.extractionStatus && source.extractionStatus !== 'TEXT_EXTRACTED' ? [`EXTRACCION_${source.extractionStatus}`] : []),
  ];
}

export function analyzeDocumentSource(source: SourceRecord, text: string, limit = 8): DocumentAnalysis {
  const sourceId = source.id ?? path.basename(source.path);
  const sha256 = source.sha256 ?? 'A_CONFIRMAR';
  const warnings = sourceWarnings(source);
  const findings: DocumentFinding[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(partLikePattern)) {
    const raw = match[0];
    const code = raw.replace(/\s+/g, '').toUpperCase();
    if (stopCodes.has(code) || rejectedCodePrefixes.test(code) || seen.has(code) || code.length < 4) continue;
    seen.add(code);
    const index = match.index ?? 0;
    const snippet = snippetAround(text, index);
    const locator = locatorFor(text, index);
    findings.push({
      id: `${sourceId}:${code}:${locator}`,
      sourceId,
      kind: 'PART_CANDIDATE',
      title: source.name ?? path.basename(source.path),
      code,
      name: contextName(snippet, code),
      partNumber: 'A_CONFIRMAR',
      unit: 'u',
      locator,
      applicability: familyOf(source, text),
      confidence: confidenceFor(source, snippet),
      reviewStatus: 'A_CONFIRMAR',
      stockEffect: 'NONE',
      evidence: { sourceId, sha256, textLocator: locator, snippet },
      warnings: [...warnings, 'REVISION_HUMANA_REQUERIDA', 'PN_NO_CONFIRMADO'],
    });
    if (findings.length >= limit) break;
  }
  if (!findings.length && source.pagesNeedingOCR?.length) {
    findings.push({
      id: `${sourceId}:OCR:${source.pagesNeedingOCR.join('-')}`,
      sourceId,
      kind: 'OCR_REQUIRED',
      title: source.name ?? path.basename(source.path),
      code: 'A_CONFIRMAR',
      name: 'Páginas pendientes de OCR antes de derivar candidatos',
      partNumber: 'A_CONFIRMAR',
      unit: 'u',
      locator: source.pagesNeedingOCR.map(page => `page:${page}`).join(','),
      applicability: familyOf(source, text),
      confidence: 'ALTA',
      reviewStatus: 'A_CONFIRMAR',
      stockEffect: 'NONE',
      evidence: { sourceId, sha256, textLocator: source.pagesNeedingOCR.map(page => `page:${page}`).join(','), snippet: '' },
      warnings: [...warnings, 'OCR_REQUERIDO_ANTES_DE_CONFIRMAR'],
    });
  }
  return {
    sourceId,
    title: source.name ?? path.basename(source.path),
    sha256,
    documentType: source.kind ?? 'UNCLASSIFIED',
    family: familyOf(source, text),
    extractionStatus: source.extractionStatus ?? 'A_CONFIRMAR',
    pages: source.pages ?? null,
    pagesNeedingOCR: source.pagesNeedingOCR ?? [],
    findings,
    warnings,
  };
}
