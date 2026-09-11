import { describe, expect, it } from 'vitest';
import { dryRunCandidateImport, type PartCandidate } from '../src/candidate-import.js';

const candidate = (overrides: Partial<PartCandidate> = {}): PartCandidate => ({
  candidateId: 'CSV-1', code: 'FLT-01', name: 'Filtro de aceite', partNumber: 'A_CONFIRMAR', unit: 'unidad', historicalQuantity: 4,
  provenance: { sourceId: 'SRC-1', locator: 'page:4' }, ...overrides,
});

describe('candidate import dry-run', () => {
  it('reports an add without applying historical quantity to stock', () => {
    const result = dryRunCandidateImport([candidate()], []);
    expect(result).toMatchObject({ apply: false, summary: { add: 1 } });
    expect(result.results[0]).toMatchObject({ decision: 'ADD', stockEffect: 'NONE', proposed: { partNumber: 'A_CONFIRMAR' } });
  });

  it('requires provenance and rejects incompatible units', () => {
    const result = dryRunCandidateImport([
      candidate({ candidateId: 'missing-source', provenance: { sourceId: '', locator: '' } }),
      candidate({ candidateId: 'bad-unit', unit: 'litro' }),
    ], [{ code: 'FLT-01', name: 'Filtro de aceite', partNumber: 'A_CONFIRMAR', unit: 'unidad' }]);
    expect(result.results[0].decision).toBe('REJECTED');
    expect(result.results[0].reasons).toEqual(expect.arrayContaining(['SOURCE_ID_REQUIRED', 'SOURCE_LOCATOR_REQUIRED']));
    expect(result.results[1]).toMatchObject({ decision: 'REJECTED', reasons: expect.arrayContaining(['UNIT_INCOMPATIBLE']) });
  });

  it('keeps unvalidated equivalence separate and is idempotent for an identical catalog row', () => {
    const existing = [{ code: 'FLT-01', name: 'Filtro de aceite', partNumber: 'A_CONFIRMAR', unit: 'unidad' }];
    const first = dryRunCandidateImport([candidate({ equivalenceOf: 'OEM-FLT-OLD' })], existing);
    const second = dryRunCandidateImport([candidate({ equivalenceOf: 'OEM-FLT-OLD' })], existing);
    expect(first.results[0]).toMatchObject({ decision: 'UNCHANGED', equivalence: 'UNVALIDATED' });
    expect(first.results[0].reasons).toContain('EQUIVALENCE_REQUIRES_HUMAN_VALIDATION');
    expect(second).toEqual(first);
    expect(existing[0]).toEqual({ code: 'FLT-01', name: 'Filtro de aceite', partNumber: 'A_CONFIRMAR', unit: 'unidad' });
  });
});
