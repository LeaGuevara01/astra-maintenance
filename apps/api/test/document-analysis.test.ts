import { describe, expect, it } from 'vitest';
import { analyzeDocumentSource } from '../src/document-analysis.js';

describe('document analysis dry-run', () => {
  it('extracts reviewable candidates without validating part numbers or stock', () => {
    const result = analyzeDocumentSource({
      id: 'SRC-JD',
      path: 'C:/docs/JOHN DEERE 6615 FILTRO.pdf',
      name: 'JOHN DEERE 6615 FILTRO.pdf',
      sha256: 'a'.repeat(64),
      kind: 'TECHNICAL_REFERENCE',
      extractionStatus: 'TEXT_EXTRACTED',
      pages: 3,
      pagesNeedingOCR: [],
    }, 'page:1 JOHN DEERE 6615 filtro aire motor ST350811 reemplazo visual.');
    expect(result.family).toBe('John Deere');
    expect(result.findings[0]).toMatchObject({
      code: 'ST350811',
      partNumber: 'A_CONFIRMAR',
      reviewStatus: 'A_CONFIRMAR',
      stockEffect: 'NONE',
      locator: 'page:1',
      applicability: 'John Deere',
    });
    expect(result.findings[0].evidence.sha256).toBe('a'.repeat(64));
    expect(result.findings[0].evidence).toMatchObject({ category: 'FILTRO', relevance: 'MEDIA', provenanceKind: 'TECHNICAL_REFERENCE', sourceTitle: 'JOHN DEERE 6615 FILTRO.pdf' });
    expect(result.findings[0].warnings).toContain('REVISION_HUMANA_REQUERIDA');
  });

  it('keeps equipment and manual references as useful document findings', () => {
    const result = analyzeDocumentSource({
      id: 'SRC-RICHIGER',
      path: 'C:/docs/MANUAL DE REPUESTOS RICHIGER EA350.pdf',
      name: 'MANUAL DE REPUESTOS RICHIGER EA350.pdf',
      sha256: 'd'.repeat(64),
      kind: 'MANUAL_OR_CATALOG',
      extractionStatus: 'TEXT_EXTRACTED',
      pages: 40,
      pagesNeedingOCR: [],
    }, 'page:1 RICHIGER EA-350 operator manual and spare parts catalog. page:35 Cover guard EX-18070C qty 1.');
    expect(result.findings.find(finding => finding.code === 'EA-350')).toMatchObject({
      kind: 'EQUIPMENT_REFERENCE',
      name: 'Referencia a equipo o manual EA-350',
      partNumber: 'A_CONFIRMAR',
      stockEffect: 'NONE',
    });
    expect(result.findings.find(finding => finding.code === 'EA-350')?.warnings).toContain('REFERENCIA_EQUIPO_MANUAL');
    expect(result.findings.find(finding => finding.code === 'EX-18070C')).toMatchObject({ kind: 'PART_CANDIDATE', evidence: { category: 'ESTRUCTURA_TRANSMISION', relevance: 'ALTA', provenanceKind: 'TABLA_REPUESTOS' } });
  });
  it('keeps OCR-only work as a blocking finding before candidate derivation', () => {
    const result = analyzeDocumentSource({
      id: 'SRC-OCR',
      path: 'C:/docs/manual.pdf',
      name: 'manual.pdf',
      sha256: 'b'.repeat(64),
      kind: 'MANUAL_OR_CATALOG',
      extractionStatus: 'OCR_REQUIRED',
      pages: 2,
      pagesNeedingOCR: [1, 2],
    }, '');
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      kind: 'OCR_REQUIRED',
      code: 'A_CONFIRMAR',
      partNumber: 'A_CONFIRMAR',
      confidence: 'ALTA',
      stockEffect: 'NONE',
    });
    expect(result.findings[0].warnings).toContain('OCR_REQUERIDO_ANTES_DE_CONFIRMAR');
  });

  it('limits repeated code findings in large catalog text', () => {
    const text = Array.from({ length: 20 }, (_, index) => `page:${index + 1} filtro AB${1000 + index}`).join('\n');
    const result = analyzeDocumentSource({ id: 'SRC-CAT', path: '/catalogo.pdf', sha256: 'c'.repeat(64), extractionStatus: 'TEXT_EXTRACTED' }, text, 5);
    expect(result.findings).toHaveLength(5);
    expect(new Set(result.findings.map(finding => finding.code)).size).toBe(5);
  });
});

