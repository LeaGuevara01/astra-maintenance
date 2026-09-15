import { describe, expect, it } from 'vitest';
import { isWithinRoot, normalizeInventory } from '../src/document-intelligence.js';

describe('ASTRA-006 document intelligence', () => {
  it('normalizes partial extraction and creates page-scoped OCR work', () => {
    const result = normalizeInventory([{ id: 'SRC-1', path: 'C:/docs/manual.pdf', sha256: 'a', kind: 'MANUAL_OR_CATALOG', pages: 4, pagesNeedingOCR: [2, 4], textCharacters: 200 }]);
    expect(result.sources[0].extractionStatus).toBe('PARTIAL');
    expect(result.sources[0].coverage).toEqual({ totalPages: 4, pagesWithText: 2, pagesNeedingOCR: [2, 4], percent: 50, partial: true });
    expect(result.ocrQueue).toEqual([{ sourceId: 'SRC-1', path: 'C:/docs/manual.pdf', pages: [2, 4], reason: 'Páginas sin texto en una fuente parcialmente extraída.', status: 'PENDING' }]);
    expect(result.reviewQueue[0].candidate.technicalClaim).toBe('A_CONFIRMAR');
  });

  it('keeps duplicate evidence and detects a changed revision without validating it', () => {
    const result = normalizeInventory([{ id: 'SRC-1', path: '/docs/filter.pdf', sha256: 'same', extractionStatus: 'TEXT_EXTRACTED', textCharacters: 12 }, { id: 'SRC-2', path: '/docs/copy.pdf', sha256: 'same', extractionStatus: 'TEXT_EXTRACTED', textCharacters: 12 }, { id: 'SRC-3', path: '/docs/filter.pdf', sha256: 'new', extractionStatus: 'TEXT_EXTRACTED', textCharacters: 12 }], [{ id: 'OLD', path: '/docs/filter.pdf', sha256: 'old' }]);
    expect(result.sources[1].extractionStatus).toBe('DUPLICATE');
    expect(result.sources[1].duplicateOf).toBe('SRC-1');
    expect(result.sources[2].revisionStatus).toBe('NEW_REVISION');
    expect(result.sources[2].reviewDecision).toBe('A_CONFIRMAR');
  });

  it('rejects paths outside a configured local source root', () => {
    expect(isWithinRoot('/docs', '/docs/manual.pdf')).toBe(true);
    expect(isWithinRoot('/docs', '/docs-archive/manual.pdf')).toBe(false);
    expect(isWithinRoot('/docs', '/docs/../secret.pdf')).toBe(false);
  });
});

describe('coverage evidence regressions', () => {
  it.each(['OCR_REQUIRED', 'PARTIAL', 'TEXT_EXTRACTED'])('keeps missing page evidence unknown for %s', extractionStatus => {
    const result = normalizeInventory([{ path: '/docs/manual.pdf', sha256: 'a', pages: 4, textCharacters: 0, extractionStatus }]);
    expect(result.sources[0].coverage).toMatchObject({ pagesWithText: null, percent: null });
    expect(result.sources[0].warnings).toContain('COBERTURA_DESCONOCIDA');
    if (extractionStatus !== 'TEXT_EXTRACTED') expect(result.ocrQueue[0].reason).toContain('Cobertura desconocida');
  });
  it('does not treat an empty OCR list as complete extraction when OCR is required', () => {
    expect(normalizeInventory([{ path: '/docs/a.pdf', sha256: 'a', pages: 4, extractionStatus: 'OCR_REQUIRED', pagesNeedingOCR: [] }]).sources[0].coverage.percent).toBeNull();
  });
  it('retains explicit complete and zero coverage', () => {
    for (const [pagesNeedingOCR, extractionStatus, percent] of [[[], 'TEXT_EXTRACTED', 100], [[1, 2], 'OCR_REQUIRED', 0]] as const) {
      expect(normalizeInventory([{ path: '/docs/a.pdf', sha256: 'a', pages: 2, extractionStatus, pagesNeedingOCR: [...pagesNeedingOCR] }]).sources[0].coverage.percent).toBe(percent);
    }
  });
  it('does not compute coverage from invalid page evidence or unknown total', () => {
    for (const pages of [2, undefined]) {
      const source = normalizeInventory([{ path: '/docs/a.pdf', sha256: 'a', pages, extractionStatus: 'OCR_REQUIRED', pagesNeedingOCR: [0, 3] }]).sources[0];
      expect(source.coverage.percent).toBeNull();
      expect(source.warnings).toContain('COBERTURA_DESCONOCIDA');
    }
  });
});
