import type { DragEvent, ReactNode } from 'react';
import { Badge, label } from './ui';

export type EntityKind = 'document_finding' | 'document_candidate';
export type BadgeCategory = 'identity' | 'classification' | 'state' | 'quantity' | 'provenance' | 'relation' | 'risk' | 'schedule';
export type BadgeSemanticType = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'unknown' | 'critical';

export interface EntityBadgeSpec {
  key: string;
  label: string;
  value: string | number | boolean | null;
  category: BadgeCategory;
  semanticType: BadgeSemanticType;
  priority: 1 | 2 | 3;
  sourceField: string;
  unit?: string;
}

export interface EntityViewModel {
  ref: { kind: EntityKind; id: string };
  identity: { code?: string; name: string; subtitle?: string };
  classification: { domain: string; family?: string; type?: string; category?: string };
  badges: EntityBadgeSpec[];
}

const badgeTone: Record<BadgeSemanticType, string> = {
  neutral: 'gray', info: 'gray', success: 'green', warning: 'orange', danger: 'red', unknown: 'orange', critical: 'red'
};

export function EntityBadge({ badge }: { badge: EntityBadgeSpec }) {
  const value = badge.value === null || badge.value === '' ? 'A_CONFIRMAR' : String(badge.value);
  return <Badge tone={badgeTone[badge.semanticType]}><span className="sr-only">{badge.label}: </span>{label(value)}{badge.unit ? ` ${badge.unit}` : ''}</Badge>;
}

export function EntityBadgeGroup({ badges, limit = 5 }: { badges: EntityBadgeSpec[]; limit?: number }) {
  const visible = [...badges].sort((a, b) => a.priority - b.priority).slice(0, limit);
  const remaining = Math.max(0, badges.length - visible.length);
  return <div className="entity-badge-group">{visible.map(badge => <EntityBadge key={badge.key} badge={badge} />)}{remaining > 0 && <Badge tone="gray">+{remaining}</Badge>}</div>;
}

export function EntityRow({ entity, selected, draggable = false, onSelect, onDragStart, onDragEnd, trailing }: {
  entity: EntityViewModel;
  selected?: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
  trailing?: ReactNode;
}) {
  return <button type="button" className={`entity-row ${selected ? 'active' : ''}`} aria-pressed={selected} draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onSelect}>
    <span className="entity-row-main"><span className="entity-row-title"><strong>{entity.identity.code ? `${entity.identity.code} · ` : ''}{entity.identity.name}</strong>{draggable && <span className="drag-hint" aria-hidden="true">Arrastrable</span>}</span>{entity.identity.subtitle && <small>{entity.identity.subtitle}</small>}<EntityBadgeGroup badges={entity.badges} /></span>
    {trailing && <span className="entity-row-trailing">{trailing}</span>}
  </button>;
}

export function DropZone({ active, disabled, children, onDropEntity }: {
  active: boolean;
  disabled?: boolean;
  children: ReactNode;
  onDropEntity: (id: string) => void;
}) {
  return <div className={`entity-drop-zone ${active ? 'compatible' : ''} ${disabled ? 'disabled' : ''}`}
    onDragOver={event => { if (!disabled && event.dataTransfer.types.includes('application/x-astra-entity')) event.preventDefault(); }}
    onDrop={event => { if (disabled) return; event.preventDefault(); const id = event.dataTransfer.getData('application/x-astra-entity'); if (id) onDropEntity(id); }}>
    {children}
  </div>;
}
