import { createHash } from 'node:crypto';

export type CandidateDecision = 'ADD' | 'UPDATE' | 'UNCHANGED' | 'CONFLICT' | 'REJECTED';
export type CandidateConfidence = 'A_CONFIRMAR' | 'VALIDADO' | 'RECHAZADO';

export type CandidateProvenance = {
  sourceId: string;
  locator: string;
  sourceRevision?: string;
  importedAt?: string;
};

export type PartCandidate = {
  candidateId: string;
  code: string;
  name: string;
  partNumber?: string;
  unit: string;
  historicalQuantity?: number;
  equivalenceOf?: string;
  confidence?: CandidateConfidence;
  provenance: CandidateProvenance;
};

export type ExistingPart = {
  code: string;
  name: string;
  partNumber: string;
  unit: string;
};

export type CandidateResult = {
  candidateId: string;
  decision: CandidateDecision;
  reasons: string[];
  provenance: CandidateProvenance;
  proposed: { code: string; name: string; partNumber: string; unit: string };
  stockEffect: 'NONE';
  equivalence: 'NONE' | 'UNVALIDATED';
  fingerprint: string;
};

export type CandidateDryRun = {
  apply: false;
  results: CandidateResult[];
  summary: { add: number; update: number; unchanged: number; conflict: number; rejected: number };
};

const normalize = (value: string) => value.trim().toUpperCase();

function fingerprint(candidate: PartCandidate): string {
  return createHash('sha256').update(JSON.stringify({
    code: normalize(candidate.code),
    name: candidate.name.trim(),
    partNumber: candidate.partNumber?.trim() || 'A_CONFIRMAR',
    unit: normalize(candidate.unit),
    equivalenceOf: candidate.equivalenceOf || null,
    confidence: candidate.confidence || 'A_CONFIRMAR',
    provenance: candidate.provenance,
  })).digest('hex');
}

function validProvenance(provenance: CandidateProvenance): string[] {
  return [
    !provenance.sourceId.trim() ? 'SOURCE_ID_REQUIRED' : undefined,
    !provenance.locator.trim() ? 'SOURCE_LOCATOR_REQUIRED' : undefined,
  ].filter((reason): reason is string => Boolean(reason));
}

/**
 * Compares candidates with the current catalog. This is intentionally a pure
 * dry-run: historical quantities are evidence only and never affect stock.
 */
export function dryRunCandidateImport(candidates: PartCandidate[], existing: ExistingPart[]): CandidateDryRun {
  const byCode = new Map(existing.map(part => [normalize(part.code), part]));
  const codeCounts = new Map<string, number>();
  for (const candidate of candidates) {
    const code = normalize(candidate.code);
    codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
  }
  const results = candidates.map(candidate => {
    const proposed = {
      code: candidate.code.trim(),
      name: candidate.name.trim(),
      partNumber: candidate.partNumber?.trim() || 'A_CONFIRMAR',
      unit: candidate.unit.trim(),
    };
    const reasons: string[] = [];
    const provenanceErrors = validProvenance(candidate.provenance);
    const current = byCode.get(normalize(candidate.code));
    reasons.push(...provenanceErrors);
    if (candidate.confidence === 'RECHAZADO') reasons.push('HUMAN_REJECTED');
    if ((codeCounts.get(normalize(candidate.code)) ?? 0) > 1) reasons.push('DUPLICATE_CODE_IN_BATCH');
    if (current && normalize(proposed.partNumber) === 'A_CONFIRMAR') proposed.partNumber = current.partNumber;
    if (!proposed.code) reasons.push('CODE_REQUIRED');
    if (!proposed.name) reasons.push('NAME_REQUIRED');
    if (!proposed.unit) reasons.push('UNIT_REQUIRED');
    if (candidate.historicalQuantity !== undefined && (!Number.isFinite(candidate.historicalQuantity) || candidate.historicalQuantity < 0)) reasons.push('HISTORICAL_QUANTITY_INVALID');
    if (current && normalize(current.unit) !== normalize(proposed.unit)) reasons.push('UNIT_INCOMPATIBLE');
    if (current && current.partNumber !== 'A_CONFIRMAR' && proposed.partNumber !== 'A_CONFIRMAR' && current.partNumber !== proposed.partNumber) reasons.push('OEM_PART_NUMBER_CONFLICT');
    const equivalence: CandidateResult['equivalence'] = candidate.equivalenceOf ? 'UNVALIDATED' : 'NONE';
    if (equivalence === 'UNVALIDATED') reasons.push('EQUIVALENCE_REQUIRES_HUMAN_VALIDATION');
    const decision: CandidateDecision = reasons.some(reason => ['HUMAN_REJECTED', 'SOURCE_ID_REQUIRED', 'SOURCE_LOCATOR_REQUIRED', 'CODE_REQUIRED', 'NAME_REQUIRED', 'UNIT_REQUIRED', 'UNIT_INCOMPATIBLE', 'HISTORICAL_QUANTITY_INVALID'].includes(reason))
      ? 'REJECTED'
      : reasons.some(reason => ['OEM_PART_NUMBER_CONFLICT', 'DUPLICATE_CODE_IN_BATCH'].includes(reason)) ? 'CONFLICT'
      : current ? (current.name === proposed.name && current.partNumber === proposed.partNumber && normalize(current.unit) === normalize(proposed.unit) ? 'UNCHANGED' : 'UPDATE')
      : 'ADD';
    return { candidateId: candidate.candidateId, decision, reasons, provenance: candidate.provenance, proposed, stockEffect: 'NONE' as const, equivalence, fingerprint: fingerprint(candidate) };
  });
  const summary = {
    add: results.filter(result => result.decision === 'ADD').length,
    update: results.filter(result => result.decision === 'UPDATE').length,
    unchanged: results.filter(result => result.decision === 'UNCHANGED').length,
    conflict: results.filter(result => result.decision === 'CONFLICT').length,
    rejected: results.filter(result => result.decision === 'REJECTED').length,
  };
  return { apply: false, results, summary };
}
