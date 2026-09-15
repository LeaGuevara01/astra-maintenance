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

describe('document candidate regressions', () => {
  const existing = [{ code: 'FLT-01', name: 'Filtro de aceite', partNumber: 'OEM-123', unit: 'unidad' }];
  it('honors human rejection for new and existing parts', () => {
    for (const catalog of [[], existing]) {
      expect(dryRunCandidateImport([candidate({ confidence: 'RECHAZADO' })], catalog).results[0])
        .toMatchObject({ decision: 'REJECTED', reasons: expect.arrayContaining(['HUMAN_REJECTED']), stockEffect: 'NONE' });
    }
  });
  it.each([undefined, '', '  ', 'A_CONFIRMAR'])('preserves known part number for missing value %s', partNumber => {
    const result = dryRunCandidateImport([candidate({ partNumber })], existing);
    expect(result.results[0]).toMatchObject({ decision: 'UNCHANGED', proposed: { partNumber: 'OEM-123' } });
    expect(existing[0].partNumber).toBe('OEM-123');
  });
  it('preserves the part number while proposing another field update', () => {
    expect(dryRunCandidateImport([candidate({ name: 'Nombre revisado', partNumber: undefined })], existing).results[0])
      .toMatchObject({ decision: 'UPDATE', proposed: { name: 'Nombre revisado', partNumber: 'OEM-123' } });
    expect(dryRunCandidateImport([candidate({ partNumber: 'OEM-999' })], existing).results[0].decision).toBe('CONFLICT');
  });
  it.each(['A_CONFIRMAR', 'OEM-999'])('blocks every repeated code independently of ordering (%s)', partNumber => {
    const batch = [candidate(), candidate({ candidateId: 'CSV-2', code: ' flt-01 ', partNumber })];
    for (const rows of [batch, [...batch].reverse()]) {
      const result = dryRunCandidateImport(rows, []);
      expect(result.summary).toMatchObject({ add: 0, update: 0, conflict: 2 });
      for (const row of result.results) expect(row).toMatchObject({ decision: 'CONFLICT', stockEffect: 'NONE', reasons: ['DUPLICATE_CODE_IN_BATCH'] });
    }
  });
});
