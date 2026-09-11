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
