import { useEffect, useState } from 'react';
import type { Role } from './types';
import { api } from './api';
import { Badge } from './ui';
type Candidate = { id: string; code: string; name: string; partNumber: string; unit: string; locator: string; applicability: string; version: number; revision: { sourceId: string; title: string; sha256: string }; reviews: { id: string; decision: string; reason: string; actorId: string; createdAt: string }[] };
type CandidatePage = { items: Candidate[]; nextCursor: string | null };
type SourceQueueItem = { id: string; sourceId: string; title: string; sha256: string; kind: string; extractionStatus: string; pages: number | null; pagesNeedingOCR: number[]; reviewStatus: string; family: string; priority: string; hasCandidates: boolean };
type SourceQueuePage = { items: SourceQueueItem[]; nextCursor: string | null };
type Result = { candidateId: string; decision: string; reasons: string[]; proposed: { partNumber: string }; stockEffect: string };
type ReviewPage = { items: { id: string; decision: string; reason: string; actorId: string; actorName: string | null; createdAt: string }[]; nextCursor: number | null };
type Finding = { id: string; kind: string; code: string; name: string; partNumber: string; unit: string; locator: string; applicability: string; confidence: string; reviewStatus: string; stockEffect: string; evidence: { sourceId?: string; sha256?: string; textLocator?: string; snippet?: string; category?: string; relevance?: string; provenanceKind?: string; sourceTitle?: string }; warnings: string[]; createdAt: string; run: { analyzerId: string; analyzerVersion: string; revision: { sourceId: string; title: string; sha256: string } }; reviews: { id: string; decision: string; reason: string; actorId: string; createdAt: string }[] };
type FindingPage = { items: Finding[]; nextCursor: string | null };
function ReviewHistory({ candidateId }: { candidateId: string }) {
  const [page, setPage] = useState<ReviewPage>({ items: [], nextCursor: null });
  const [cursor, setCursor] = useState<number | null>(null), [previous, setPrevious] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    setLoading(true); setError(''); setPage({ items: [], nextCursor: null });
    api<ReviewPage>(`/document-candidates/${encodeURIComponent(candidateId)}/reviews?limit=25${cursor === null ? '' : `&cursor=${cursor}`}`)
      .then(data => { if (current) setPage(data); })
      .catch(e => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [candidateId, cursor, retry]);
  return <><h3>Historial de decisiones · página {previous.length + 1}</h3><p>El responsable se muestra con su nombre actual.</p>
    {loading && <p role="status">Cargando historial…</p>}
    {error && <div role="alert">{error} <button className="button secondary" onClick={() => setRetry(retry + 1)}>Reintentar historial</button></div>}
    {!loading && !error && !page.items.length && <p>Sin decisiones registradas.</p>}
    {page.items.map(review => <p key={review.id}><strong>{review.decision}</strong> · {review.reason}<small>{review.actorName ?? 'Responsable no disponible'} · {new Date(review.createdAt).toLocaleString()}</small></p>)}
    <div className="decision-buttons"><button className="button secondary" disabled={loading || !previous.length} onClick={() => { setCursor(previous[previous.length - 1]); setPrevious(previous.slice(0, -1)); }}>Decisiones más recientes</button>
    <button className="button secondary" disabled={loading || page.nextCursor === null} onClick={() => { setPrevious([...previous, cursor]); setCursor(page.nextCursor); }}>Decisiones anteriores</button></div>
  </>;
}
const sourceStatuses = ['TEXT_EXTRACTED', 'OCR_REQUIRED', 'VISUAL_REVIEW_REQUIRED', 'DUPLICATE', 'A_CONFIRMAR'];
const priorities = ['ALTA', 'MEDIA', 'BAJA'];
function SourceQueue() {
  const [rows, setRows] = useState<SourceQueueItem[]>([]), [selected, select] = useState('');
  const [status, setStatus] = useState(''), [family, setFamily] = useState(''), [priority, setPriority] = useState('');
  const [cursor, setCursor] = useState<string | null>(null), [nextCursor, setNextCursor] = useState<string | null>(null), [previous, setPrevious] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const path = (value: string | null) => {
    const params = new URLSearchParams({ limit: '25' });
    if (value) params.set('cursor', value);
    if (status) params.set('extractionStatus', status);
    if (family.trim()) params.set('family', family.trim());
    if (priority) params.set('priority', priority);
    return `/document-candidates/sources/page?${params.toString()}`;
  };
  useEffect(() => {
    let current = true;
    setLoading(true); setError(''); setRows([]); setNextCursor(null); select('');
    api<SourceQueuePage>(path(cursor)).then(data => {
      if (current) { setRows(data.items); setNextCursor(data.nextCursor); select(data.items[0]?.id ?? ''); }
    }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [cursor, status, family, priority]);
  const active = rows.find(row => row.id === selected);
  function resetFilters() { setPrevious([]); setCursor(null); }
  return <section className="panel panel-content source-queue"><div className="section-heading"><div><h2>Cola de revisión por fuente</h2><p>Las fuentes se revisan antes de crear candidatos. Todo queda A_CONFIRMAR hasta validar página, hash y aplicabilidad.</p></div><Badge tone="orange">Sin derivar repuestos</Badge></div>
    <div className="source-filters">
      <label className="field">Estado de extracción<select value={status} onChange={e => { resetFilters(); setStatus(e.target.value); }}><option value="">Todos</option>{sourceStatuses.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="field">Familia / equipo<input value={family} onChange={e => { resetFilters(); setFamily(e.target.value); }} placeholder="John Deere, Hilux, siembra…" /></label>
      <label className="field">Prioridad<select value={priority} onChange={e => { resetFilters(); setPriority(e.target.value); }}><option value="">Todas</option>{priorities.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
    </div>
    {error && <div role="alert" className="notice">{error}</div>}
    <div className="review-grid"><div><h3>Fuentes · página {previous.length + 1}</h3>{loading && <p role="status">Cargando fuentes…</p>}{!loading && !rows.length && <p>No hay fuentes con estos filtros.</p>}{rows.map(row => <button key={row.id} className={`review-item ${row.id === selected ? 'active' : ''}`} onClick={() => select(row.id)}><div><strong>{row.title}</strong><small>{row.family} · {row.extractionStatus}</small></div><Badge tone={row.priority === 'ALTA' ? 'orange' : row.priority === 'BAJA' ? 'gray' : 'green'}>{row.priority}</Badge></button>)}
      <div className="decision-buttons"><button className="button secondary" disabled={loading || !previous.length} onClick={() => { setCursor(previous[previous.length - 1]); setPrevious(previous.slice(0, -1)); }}>Anterior</button><button className="button secondary" disabled={loading || !nextCursor} onClick={() => { setPrevious([...previous, cursor]); setCursor(nextCursor); }}>Siguiente</button></div></div>
      {active && <div className="review-detail"><h3>{active.sourceId}</h3><h2>{active.title}</h2><div className="evidence-card"><div><span>Estado</span><strong>{active.extractionStatus}</strong></div><div><span>Familia / equipo</span><strong>{active.family}</strong></div><div><span>Prioridad</span><strong>{active.priority}</strong></div><div><span>Páginas</span><strong>{active.pages ?? 'A_CONFIRMAR'}</strong></div><div><span>OCR pendiente</span><strong>{active.pagesNeedingOCR.length ? active.pagesNeedingOCR.join(', ') : 'Sin páginas declaradas'}</strong></div><div><span>Candidatos</span><strong>{active.hasCandidates ? 'Ya derivados' : 'Sin derivar'}</strong></div></div><p className="mono" style={{ overflowWrap: 'anywhere' }}>{active.sha256}</p><p className="notice">Para derivar un candidato: mantener PN desconocido como A_CONFIRMAR, registrar locator de página/hoja, hash de esta revisión y aplicabilidad de modelo o variante.</p></div>}
    </div>
  </section>;
}

const findingDecisions = ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'];
function FindingQueue({ role, onCandidateCreated }: { role: Role; onCandidateCreated: () => Promise<void> }) {
  const [rows, setRows] = useState<Finding[]>([]), [selected, select] = useState('');
  const [decision, setDecision] = useState('A_CONFIRMAR'), [kind, setKind] = useState(''), [sourceId, setSourceId] = useState(''), [confidence, setConfidence] = useState('');
  const [category, setCategory] = useState(''), [relevance, setRelevance] = useState(''), [provenanceKind, setProvenanceKind] = useState('');
  const [reason, setReason] = useState(''), [cursor, setCursor] = useState<string | null>(null), [nextCursor, setNextCursor] = useState<string | null>(null), [previous, setPrevious] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const path = (value: string | null) => {
    const params = new URLSearchParams({ limit: '25' });
    if (value) params.set('cursor', value);
    if (decision) params.set('decision', decision);
    if (kind.trim()) params.set('kind', kind.trim());
    if (sourceId.trim()) params.set('sourceId', sourceId.trim());
    if (confidence.trim()) params.set('confidence', confidence.trim());
    if (category.trim()) params.set('category', category.trim());
    if (relevance.trim()) params.set('relevance', relevance.trim());
    if (provenanceKind.trim()) params.set('provenanceKind', provenanceKind.trim());
    return `/document-candidates/findings/page?${params.toString()}`;
  };
  async function load(value: string | null) { const data = await api<FindingPage>(path(value)); setRows(data.items); setNextCursor(data.nextCursor); select(data.items[0]?.id ?? ''); }
  useEffect(() => { let current = true; setLoading(true); setError(''); setRows([]); setNextCursor(null); select(''); api<FindingPage>(path(cursor)).then(data => { if (current) { setRows(data.items); setNextCursor(data.nextCursor); select(data.items[0]?.id ?? ''); } }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setLoading(false); }); return () => { current = false; }; }, [cursor, decision, kind, sourceId, confidence, category, relevance, provenanceKind]);
  function resetFilters() { setPrevious([]); setCursor(null); }
  const active = rows.find(row => row.id === selected);
  async function decideFinding(value: string) {
    if (!active) return;
    setBusy(true); setError('');
    try { await api(`/document-candidates/findings/${encodeURIComponent(active.id)}/reviews`, 'POST', { decision: value, reason }, true); setReason(''); await load(cursor); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); }
    finally { setBusy(false); }
  }
  async function deriveCandidate() {
    if (!active) return;
    setBusy(true); setError('');
    try { await api(`/document-candidates/findings/${encodeURIComponent(active.id)}/candidate`, 'POST', { reason: reason.trim() || undefined }, true); setReason(''); await load(cursor); await onCandidateCreated(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); }
    finally { setBusy(false); }
  }
  return <section className="panel panel-content source-queue"><div className="section-heading"><div><h2>Hallazgos asistidos por IA</h2><p>Propuestas extraídas del corpus con fuente, hash, locator y estado humano. Crear candidato queda como paso explícito posterior.</p></div><Badge tone="orange">A_CONFIRMAR / stock NONE</Badge></div>
    <div className="source-filters"><label className="field">Decisión<select value={decision} onChange={e => { resetFilters(); setDecision(e.target.value); }}>{findingDecisions.map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className="field">Tipo<input value={kind} onChange={e => { resetFilters(); setKind(e.target.value); }} placeholder="PART_CANDIDATE, OCR_REQUIRED…" /></label><label className="field">Fuente<input value={sourceId} onChange={e => { resetFilters(); setSourceId(e.target.value); }} placeholder="SRC-…" /></label><label className="field">Confianza<input value={confidence} onChange={e => { resetFilters(); setConfidence(e.target.value); }} placeholder="ALTA, MEDIA, BAJA" /></label><label className="field">Categoría<input value={category} onChange={e => { resetFilters(); setCategory(e.target.value); }} placeholder="FILTRO, RODAMIENTO…" /></label><label className="field">Relevancia<input value={relevance} onChange={e => { resetFilters(); setRelevance(e.target.value); }} placeholder="ALTA, MEDIA, BAJA" /></label><label className="field">Procedencia<input value={provenanceKind} onChange={e => { resetFilters(); setProvenanceKind(e.target.value); }} placeholder="TABLA_REPUESTOS…" /></label></div>
    {error && <div role="alert" className="notice">{error}</div>}
    <div className="review-grid"><div><h3>Hallazgos · página {previous.length + 1}</h3>{loading && <p role="status">Cargando hallazgos…</p>}{!loading && !rows.length && <p>No hay hallazgos persistidos con estos filtros.</p>}{rows.map(row => <button key={row.id} className={`review-item ${row.id === selected ? 'active' : ''}`} onClick={() => { select(row.id); setReason(''); }}><div><strong>{row.code} · {row.name}</strong><small>{row.run.revision.sourceId} · {row.locator} · {row.evidence?.category ?? row.kind} · {row.evidence?.relevance ?? row.confidence}</small></div><Badge value={row.reviewStatus} /></button>)}<div className="decision-buttons"><button className="button secondary" disabled={loading || !previous.length} onClick={() => { setCursor(previous[previous.length - 1]); setPrevious(previous.slice(0, -1)); }}>Anterior</button><button className="button secondary" disabled={loading || !nextCursor} onClick={() => { setPrevious([...previous, cursor]); setCursor(nextCursor); }}>Siguiente</button></div></div>
      {active && <div className="review-detail"><h3>{active.kind}</h3><h2>{active.name}</h2><div className="evidence-card"><div><span>Código</span><strong>{active.code}</strong></div><div><span>PN</span><strong>{active.partNumber}</strong></div><div><span>Locator</span><strong>{active.locator}</strong></div><div><span>Aplicabilidad</span><strong>{active.applicability}</strong></div><div><span>Confianza</span><strong>{active.confidence}</strong></div><div><span>Categoría</span><strong>{active.evidence?.category ?? 'A_CONFIRMAR'}</strong></div><div><span>Relevancia</span><strong>{active.evidence?.relevance ?? 'A_CONFIRMAR'}</strong></div><div><span>Procedencia</span><strong>{active.evidence?.provenanceKind ?? 'A_CONFIRMAR'}</strong></div><div><span>Stock</span><strong>{active.stockEffect}</strong></div></div><p>{active.run.revision.title}</p><p className="mono" style={{ overflowWrap: 'anywhere' }}>{active.run.revision.sha256}</p>{active.evidence?.snippet && <p className="notice">{active.evidence.snippet}</p>}<p><strong>Advertencias:</strong> {active.warnings?.length ? active.warnings.join(' · ') : 'Sin advertencias adicionales'}</p>{active.reviews[0] && <p><strong>Última revisión:</strong> {active.reviews[0].decision} · {active.reviews[0].reason}</p>}{role !== 'VIEWER' && <><label className="field">Motivo<textarea value={reason} maxLength={1000} onChange={e => setReason(e.target.value)} /></label><div className="decision-buttons">{active.kind === 'PART_CANDIDATE' && role === 'ADMIN' && <button className="button primary" disabled={busy} onClick={deriveCandidate}>Derivar candidato</button>}{findingDecisions.map(value => <button key={value} className="button secondary" disabled={busy || !reason.trim()} onClick={() => decideFinding(value)}>{value}</button>)}</div></>}</div>}
    </div>
  </section>;
}

export default function DocumentReviewView({ role }: { role: Role }) {
  const [rows, setRows] = useState<Candidate[]>([]), [selected, select] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [reason, setReason] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [cursor, setCursor] = useState<string | null>(null), [nextCursor, setNextCursor] = useState<string | null>(null), [previous, setPrevious] = useState<(string | null)[]>([]);
  const pagePath = (value: string | null) => '/document-candidates/page?limit=25' + (value ? '&cursor=' + encodeURIComponent(value) : '');
  const active = rows.find(r => r.id === selected);
  async function reload() { const data = await api<CandidatePage>(pagePath(cursor)); setRows(data.items); setNextCursor(data.nextCursor); setResults([]); }
  useEffect(() => { let current = true; setBusy(true); setError(''); setRows([]); setNextCursor(null); setResults([]); select(''); api<CandidatePage>(pagePath(cursor)).then(data => { if (current) { setRows(data.items); setNextCursor(data.nextCursor); setResults([]); select(''); } }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setBusy(false); }); return () => { current = false; }; }, [cursor]);
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); } finally { setBusy(false); } }
  async function decide(decision: string) { if (!active) return; await api(`/document-candidates/${active.id}/reviews`, 'POST', { version: active.version, decision, reason }, true); setReason(''); await reload(); }
  return <><div className="page-heading"><div><h1>Revisión documental</h1><p>Decisiones guardadas con fuente, revisión y responsable. Comparación con el catálogo vigente.</p></div><Badge tone="orange">Sin aplicación al catálogo ni stock</Badge></div>
    {error && <div role="alert" className="notice">{error}</div>}
    <button className="button secondary" disabled={busy} onClick={() => run(reload)}>Actualizar</button>
    <SourceQueue />
    <FindingQueue role={role} onCandidateCreated={reload} />
    {role === 'ADMIN' && <details className="panel panel-content"><summary>Registrar candidato</summary><form onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const body = Object.fromEntries(new FormData(form)); void run(async () => { const row = await api<Candidate>('/document-candidates', 'POST', body, true); if (cursor !== null) { setPrevious([]); setCursor(null); } else { await reload(); select(row.id); } form.reset(); }); }}>
      {([['sourceId','Identificador de fuente'],['title','Título de fuente'],['sha256','SHA-256 de la revisión'],['locator','Página / sección'],['applicability','Aplicabilidad declarada (modelo, variante, serie)'],['code','Código de catálogo'],['name','Descripción'],['partNumber','Número de pieza o A_CONFIRMAR'],['unit','Unidad']] as const).map(([name,label]) => <label key={name} className="field">{label}<input name={name} required maxLength={name === 'applicability' ? 500 : name === 'title' || name === 'name' || name === 'locator' ? 200 : name === 'unit' ? 30 : 100} pattern={name === 'sha256' ? '[a-f0-9]{64}' : undefined} defaultValue={name === 'partNumber' ? 'A_CONFIRMAR' : undefined}/></label>)}
      <button className="button primary" disabled={busy}>Guardar candidato</button></form></details>}
    <div className="review-grid"><section className="panel panel-content"><h2>Candidatos · página {previous.length + 1}</h2>{!rows.length && <p>No hay candidatos registrados.</p>}{rows.map(row => <button key={row.id} className="review-item" onClick={() => { select(row.id); setReason(''); }}><strong>{row.code} · {row.name}</strong><Badge value={row.reviews[0]?.decision ?? 'A_CONFIRMAR'}/></button>)}<div className="decision-buttons"><button className="button secondary" disabled={busy || !previous.length} onClick={() => { setCursor(previous[previous.length-1]); setPrevious(previous.slice(0,-1)); }}>Anterior</button><button className="button secondary" disabled={busy || !nextCursor} onClick={() => { setPrevious([...previous,cursor]); setCursor(nextCursor); }}>Siguiente</button></div><p>{rows.length} candidatos en esta página. {nextCursor ? 'Hay más resultados.' : 'Fin de la lista.'}</p></section>
    {active && <section className="panel panel-content"><h2>{active.name}</h2><p>{active.partNumber} · {active.unit}</p><p>{active.revision.title} · {active.revision.sourceId}</p><p className="mono" style={{overflowWrap:'anywhere'}}>{active.revision.sha256}</p><p>{active.locator} · {active.applicability}</p>
      {role !== 'VIEWER' && <><label className="field">Motivo de la decisión<textarea value={reason} maxLength={1000} onChange={e => setReason(e.target.value)}/></label><div className="decision-buttons">{['A_CONFIRMAR','VALIDADO','RECHAZADO'].map(decision => <button className="button secondary" key={decision} disabled={busy || !reason.trim()} onClick={() => run(() => decide(decision))}>{decision}</button>)}</div></>}
      <ReviewHistory key={`${active.id}:${active.version}`} candidateId={active.id}/></section>}</div>
    <section className="panel panel-content"><h2>Comparación del lote visible con el catálogo</h2><p>Una decisión validada no aplica cambios. El resultado refleja el catálogo al consultar.</p><button className="button primary" disabled={busy || !rows.length} onClick={() => run(async () => { const report = await api<{results: Result[]}>('/document-candidates/dry-run','POST',{ids:rows.map(r=>r.id)}); setResults(report.results); })}>Comparar catálogo</button>{results.map(result => <p key={result.candidateId}><strong>{rows.find(r=>r.id===result.candidateId)?.code}: {result.decision}</strong> · PN propuesto: {result.proposed.partNumber}<small>{result.reasons.join(' · ') || 'Sin conflictos detectados'} · Stock: {result.stockEffect}</small></p>)}</section>
  </>;
}
