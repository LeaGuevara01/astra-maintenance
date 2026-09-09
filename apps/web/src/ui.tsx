import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Check, LoaderCircle, Search, X } from 'lucide-react';
import { ApiError } from './api';

export const number = (value: number | string) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(Number(value));
export const date = (value?: string, time = false) => value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', ...(time ? { timeStyle: 'short' as const } : {}) }).format(new Date(value)) : '—';
const labels: Record<string, string> = { OPEN: 'Abierta', IN_PROGRESS: 'En ejecución', CLOSED: 'Cerrada', PENDING: 'Pendiente', DONE: 'Realizada', DEFERRED: 'Diferida', NA: 'No aplica', PASS: 'Conforme', FAIL: 'No conforme', OPERATIVE: 'Operativo', OPERATIVE_WITH_NOTES: 'Con observaciones', NOT_OPERATIVE: 'No operativo', ACTIVE: 'Activo', DRAFT: 'Borrador', RELEASED: 'Vigente', ADMIN: 'Administrador', TECHNICIAN: 'Técnico', VIEWER: 'Consulta', SYNTHETIC: 'Demostración', A_CONFIRMAR: 'A confirmar' };
export const label = (value: string) => labels[value] || value.replaceAll('_', ' ');
export function Badge({ value, children, tone }: { value?: string; children?: ReactNode; tone?: string }) {
  const color = tone || (['DONE', 'PASS', 'CLOSED', 'OPERATIVE', 'ACTIVE', 'RELEASED'].includes(value || '') ? 'green' : ['FAIL', 'NOT_OPERATIVE'].includes(value || '') ? 'red' : ['DEFERRED', 'OPERATIVE_WITH_NOTES', 'A_CONFIRMAR'].includes(value || '') ? 'orange' : 'gray');
  return <span className={`badge badge-${color}`}><span className="badge-dot" />{children || label(value || '')}</span>;
}
export function ErrorBox({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  const details = error instanceof ApiError && error.details;
  return <div className="error-box" role="alert"><AlertTriangle size={18} /><div><strong>{message}</strong>{!!details && <details><summary>Ver detalle</summary><pre>{typeof details === 'string' ? details : JSON.stringify(details, null, 2)}</pre></details>}</div></div>;
}
export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty"><div className="empty-symbol">A</div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function Loading({ label: text = 'Cargando información…' }: { label?: string }) { return <div className="loading" role="status"><LoaderCircle className="spin" size={22} />{text}</div>; }
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="search-box"><Search size={17} /><span className="sr-only">{placeholder}</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button type="button" aria-label="Limpiar búsqueda" onClick={() => onChange('')}><X size={16} /></button>}</label>; }
export function SectionHeading({ title, caption, action }: { title: string; caption?: string; action?: ReactNode }) { return <div className="section-heading"><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{action}</div>; }
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="text-link" onClick={onClick}>{children}<ArrowRight size={16} /></button>; }
export function Field({ label: text, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="field"><span>{text}</span>{children}{hint && <small>{hint}</small>}</label>; }
export function Modal({ title, description, children, onClose, onSubmit, submitLabel = 'Guardar', danger = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; onSubmit: (data: FormData) => Promise<void>; submitLabel?: string; danger?: boolean }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { dialogRef.current?.showModal(); const dialog = dialogRef.current; return () => dialog?.close(); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    const data = new FormData(event.currentTarget); setSaving(true); setError(null);
    try { await onSubmit(data); onClose(); } catch (err) { setError(err); setSaving(false); }
  }
  return <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}><form onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">ASTRA / OPERACIÓN</span><h2 id={titleId}>{title}</h2></div><button type="button" className="icon-button" onClick={onClose} disabled={saving} aria-label="Cerrar ventana"><X size={20} /></button></div>{description && <p className="modal-description">{description}</p>}<div className="modal-body">{error ? <ErrorBox error={error} /> : null}{children}</div><div className="modal-footer"><button type="button" className="button secondary" disabled={saving} onClick={onClose}>Cancelar</button><button className={`button ${danger ? 'danger' : 'primary'}`} disabled={saving}>{saving ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}{saving ? 'Guardando…' : submitLabel}</button></div></form></dialog>;
}
