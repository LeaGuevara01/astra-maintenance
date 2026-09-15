import { useEffect, useState } from 'react';
import type { Role } from './types';
import { api } from './api';
import { Badge } from './ui';
type Candidate = { id: string; code: string; name: string; partNumber: string; unit: string; locator: string; applicability: string; version: number; revision: { sourceId: string; title: string; sha256: string }; reviews: { id: string; decision: string; reason: string; actorId: string; createdAt: string }[] };
type Result = { candidateId: string; decision: string; reasons: string[]; proposed: { partNumber: string }; stockEffect: string };
export default function DocumentReviewView({ role }: { role: Role }) {
  const [rows, setRows] = useState<Candidate[]>([]), [selected, select] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [reason, setReason] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const active = rows.find(r => r.id === selected);
  async function reload() { const data = await api<Candidate[]>('/document-candidates'); setRows(data); setResults([]); }
  useEffect(() => { let current = true; api<Candidate[]>('/document-candidates').then(data => { if (current) setRows(data); }).catch(e => { if (current) setError(e.message); }); return () => { current = false; }; }, []);
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); } finally { setBusy(false); } }
  async function decide(decision: string) { if (!active) return; await api(`/document-candidates/${active.id}/reviews`, 'POST', { version: active.version, decision, reason }, true); setReason(''); await reload(); }
  return <><div className="page-heading"><div><h1>Revisión documental</h1><p>Decisiones guardadas con fuente, revisión y responsable. Comparación con el catálogo vigente.</p></div><Badge tone="orange">Sin aplicación al catálogo ni stock</Badge></div>
    {error && <div role="alert" className="notice">{error}</div>}
    <button className="button secondary" disabled={busy} onClick={() => run(reload)}>Actualizar</button>
    {role === 'ADMIN' && <details className="panel panel-content"><summary>Registrar candidato</summary><form onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const body = Object.fromEntries(new FormData(form)); void run(async () => { const row = await api<Candidate>('/document-candidates', 'POST', body, true); await reload(); select(row.id); form.reset(); }); }}>
      {([['sourceId','Identificador de fuente'],['title','Título de fuente'],['sha256','SHA-256 de la revisión'],['locator','Página / sección'],['applicability','Aplicabilidad declarada (modelo, variante, serie)'],['code','Código de catálogo'],['name','Descripción'],['partNumber','Número de pieza o A_CONFIRMAR'],['unit','Unidad']] as const).map(([name,label]) => <label key={name} className="field">{label}<input name={name} required maxLength={name === 'applicability' ? 500 : name === 'title' || name === 'name' || name === 'locator' ? 200 : name === 'unit' ? 30 : 100} pattern={name === 'sha256' ? '[a-f0-9]{64}' : undefined} defaultValue={name === 'partNumber' ? 'A_CONFIRMAR' : undefined}/></label>)}
      <button className="button primary" disabled={busy}>Guardar candidato</button></form></details>}
    <div className="review-grid"><section className="panel panel-content"><h2>Candidatos recientes (máximo 200)</h2>{!rows.length && <p>No hay candidatos registrados.</p>}{rows.map(row => <button key={row.id} className="review-item" onClick={() => { select(row.id); setReason(''); }}><strong>{row.code} · {row.name}</strong><Badge value={row.reviews[0]?.decision ?? 'A_CONFIRMAR'}/></button>)}</section>
    {active && <section className="panel panel-content"><h2>{active.name}</h2><p>{active.partNumber} · {active.unit}</p><p>{active.revision.title} · {active.revision.sourceId}</p><p className="mono" style={{overflowWrap:'anywhere'}}>{active.revision.sha256}</p><p>{active.locator} · {active.applicability}</p>
      {role !== 'VIEWER' && <><label className="field">Motivo de la decisión<textarea value={reason} maxLength={1000} onChange={e => setReason(e.target.value)}/></label><div className="decision-buttons">{['A_CONFIRMAR','VALIDADO','RECHAZADO'].map(decision => <button className="button secondary" key={decision} disabled={busy || !reason.trim()} onClick={() => run(() => decide(decision))}>{decision}</button>)}</div></>}
      <h3>Historial de decisiones</h3>{active.reviews.map(review => <p key={review.id}><strong>{review.decision}</strong> · {review.reason}<small>{review.actorId} · {new Date(review.createdAt).toLocaleString()}</small></p>)}</section>}</div>
    <section className="panel panel-content"><h2>Comparación del lote visible con el catálogo</h2><p>Una decisión validada no aplica cambios. El resultado refleja el catálogo al consultar.</p><button className="button primary" disabled={busy || !rows.length} onClick={() => run(async () => { const report = await api<{results: Result[]}>('/document-candidates/dry-run','POST',{ids:rows.map(r=>r.id)}); setResults(report.results); })}>Comparar catálogo</button>{results.map(result => <p key={result.candidateId}><strong>{rows.find(r=>r.id===result.candidateId)?.code}: {result.decision}</strong> · PN propuesto: {result.proposed.partNumber}<small>{result.reasons.join(' · ') || 'Sin conflictos detectados'} · Stock: {result.stockEffect}</small></p>)}</section>
  </>;
}
