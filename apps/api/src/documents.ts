import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import type { orderView } from './db.js';
import { assert } from './errors.js';

type OrderView = ReturnType<typeof orderView>;
type Row = { text: string; heading?: boolean; warning?: boolean };
const mm = 72 / 25.4;
const cardWidth = 105 * mm;
const cardHeight = 148 * mm;
const innerWidth = cardWidth - 24;
const text = (value: unknown) => String(value ?? 'A_CONFIRMAR');
const labels: Record<string, string> = { OPEN: 'ABIERTA', CLOSED: 'CERRADA', PENDING: 'PENDIENTE', DONE: 'HECHA', DEFERRED: 'DIFERIDA', PASS: 'OK', FAIL: 'FALLO', NA: 'N/A', OPERATIVE: 'OPERATIVO', OPERATIVE_WITH_NOTES: 'OPERATIVO CON OBS.', NOT_OPERATIVE: 'NO OPERATIVO' };
const label = (value: string | null) => value ? labels[value] ?? value : 'A_CONFIRMAR';
const escapeHtml = (value: unknown) => text(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const date = (value: string | null) => value ? value.slice(0, 10) : '-';

export function cardData(order: OrderView) {
  const asset = order.asset as { code: string; name: string };
  const plan = order.plan as { name: string; revision: number };
  const rows: Row[] = [
    { text: `${asset.code} | ${asset.name}`, heading: true },
    { text: `${plan.name} - Rev. ${plan.revision}` },
    { text: `Objetivo ${order.targetMeter} h | Real ${order.actualMeter} h | Próximo ${order.nextServiceMeter} h` },
    { text: `Estado: ${label(order.status)} | Resultado: ${label(order.result)}` },
    { text: 'TAREAS', heading: true },
  ];
  for (const task of order.tasks) {
    rows.push({ text: `${label(task.status)} | ${task.description} (${task.frequency} h)`, warning: task.status === 'DEFERRED' });
    if (task.status === 'DEFERRED') rows.push({ text: `Motivo: ${task.deferredReason} | ${task.deferredBy} | ${date(task.deferredUntil)}`, warning: true });
  }
  rows.push({ text: 'MATERIALES / CONSUMO REAL', heading: true });
  for (const material of order.materials) {
    const part = material.part as { name: string; partNumber: string; unit: string };
    rows.push({ text: `${part.name} | PN ${part.partNumber}` });
    rows.push({ text: `Plan ${material.quantityPlanned} / Reserva ${material.quantityReserved} / Usado ${material.quantityUsed} ${part.unit} / Falta ${material.shortage}`, warning: material.shortage > 0 });
  }
  if (!order.materials.length) rows.push({ text: 'Sin materiales planificados.' });
  rows.push({ text: 'VERIFICACIÓN FINAL', heading: true });
  for (const checkpoint of order.checkpoints) rows.push({ text: `${checkpoint.critical ? 'CRÍTICO ' : ''}${label(checkpoint.result)} | ${checkpoint.label}`, warning: checkpoint.critical && checkpoint.result !== 'PASS' });
  if (order.notes) rows.push({ text: `Observaciones: ${order.notes}` });
  rows.push({ text: `Emitida ${date(order.createdAt)} | Cierre ${date(order.closedAt)}` });
  rows.push({ text: 'Procedencia: DEMOSTRACIÓN SINTÉTICA. No es una recomendación OEM.', warning: true });
  return { code: order.code, rows };
}

function cardFontSize(rows: Row[]): number {
  // Share the same legibility/capacity limit across both printable representations.
  const measureDoc = new PDFDocument({ size: [cardWidth, cardHeight], margin: 0 });
  measureDoc.resume();
  try {
    for (const fontSize of [7.7, 7.5, 7.3, 7.1, 6.9, 6.7]) {
      const height = rows.reduce((sum, row) => {
        measureDoc.font(row.heading ? 'Helvetica-Bold' : 'Helvetica').fontSize(row.heading ? fontSize + 0.5 : fontSize);
        return sum + measureDoc.heightOfString(row.text, { width: innerWidth, lineGap: 0.5 }) + (row.heading ? 6 : 3);
      }, 0);
      if (height <= cardHeight - 102) return fontSize;
    }
    assert(false, 422, 'CARD_CAPACITY', 'El detalle excede la capacidad legible A6. Consulte el registro digital; reduzca el alcance de la próxima OT.');
  } finally { measureDoc.end(); }
}

export async function renderCardHtml(order: OrderView, format: 'a6' | 'a4', origin: string) {
  const card = cardData(order);
  const fontSize = cardFontSize(card.rows);
  const qr = await QRCode.toDataURL(`${origin}/orders/${encodeURIComponent(order.id)}`, { margin: 1, width: 150 });
  const markup = `<article class="card"><header><div><strong>ASTRA / MANTENIMIENTO</strong><h1>${escapeHtml(card.code)}</h1><small>DATOS SINTÉTICOS</small></div><img alt="QR al detalle digital" src="${qr}" /></header><main>${card.rows.map(row => `<p class="${row.heading ? 'heading' : ''} ${row.warning ? 'warning' : ''}">${escapeHtml(row.text)}</p>`).join('')}</main><footer>Registro digital completo en QR · Impresión ${format.toUpperCase()}</footer></article>`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(card.code)} - ASTRA</title><style>
  *{box-sizing:border-box}body{margin:0;background:#e7ecf0;color:#142c3f;font-family:Arial,sans-serif}.sheet{display:grid;grid-template-columns:${format === 'a4' ? '105mm 105mm' : '105mm'};width:${format === 'a4' ? '210' : '105'}mm;margin:16px auto;background:white}.card{width:105mm;min-height:148mm;padding:4mm;border:.2mm dashed #9aafba;break-inside:avoid;display:flex;flex-direction:column}header{display:flex;justify-content:space-between;border-bottom:1mm solid #19a799;padding-bottom:2mm}header strong{font-size:8pt}h1{margin:1mm 0;font-size:17pt}header small{font-size:7pt;color:#b4402f;font-weight:bold}header img{width:17mm;height:17mm}main{flex:1}p{font-size:7.2pt;line-height:1.24;margin:1.1mm 0;overflow-wrap:anywhere}.heading{font-size:7.8pt;font-weight:bold;border-bottom:.2mm solid #cbd9de;padding-top:1mm}.warning{color:#984c19}footer{font-size:6.5pt;color:#617782;border-top:.2mm solid #cbd9de;padding-top:2mm}.toolbar{text-align:center;padding:12px}button{padding:10px 18px;border:0;border-radius:8px;background:#142c3f;color:white;cursor:pointer}@media print{@page{size:${format === 'a4' ? 'A4' : 'A6'};margin:0}body{background:white}.sheet{margin:0}.toolbar{display:none}.card{height:148mm;min-height:148mm}}
  p{font-size:${fontSize}pt;line-height:1.05;margin:3pt 0}.heading{font-size:${fontSize + 0.5}pt;padding-top:0;margin:6pt 0}
  </style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir ${format.toUpperCase()}</button></div><section class="sheet">${markup.repeat(format === 'a4' ? 4 : 1)}</section></body></html>`;
}

export async function renderCardPdf(order: OrderView, format: 'a6' | 'a4', origin: string): Promise<Buffer> {
  const card = cardData(order);
  const fontSize = cardFontSize(card.rows);
  const doc = new PDFDocument({ size: format === 'a4' ? 'A4' : [cardWidth, cardHeight], margin: 0, autoFirstPage: true,
    info: { Title: `${card.code} - ASTRA - Datos sintéticos`, Author: 'ASTRA Maintenance', CreationDate: new Date(order.createdAt), ModDate: new Date(order.closedAt ?? order.createdAt) } });
  const chunks: Buffer[] = [];
  const completed = new Promise<Buffer>((resolve, reject) => { doc.on('data', chunk => chunks.push(chunk)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });
  const qr = await QRCode.toBuffer(`${origin}/orders/${encodeURIComponent(order.id)}`, { margin: 1, width: 180 });
  const count = format === 'a4' ? 4 : 1;
  for (let i = 0; i < count; i++) {
    const x = (i % 2) * cardWidth;
    const y = Math.floor(i / 2) * cardHeight + (format === 'a4' ? mm / 2 : 0);
    doc.save();
    doc.lineWidth(0.3).strokeColor('#B1C2CA').dash(2, { space: 2 }).rect(x, y, cardWidth, cardHeight).stroke().undash();
    doc.rect(x + 12, y + 12, innerWidth, 3).fill('#12A897');
    doc.fillColor('#142C3F').font('Helvetica-Bold').fontSize(8).text('ASTRA / MANTENIMIENTO', x + 12, y + 22, { width: innerWidth - 50 });
    doc.fontSize(17).text(card.code, x + 12, y + 36, { width: innerWidth - 50 });
    doc.fillColor('#B4402F').fontSize(6.8).text('DATOS SINTÉTICOS', x + 12, y + 57);
    doc.image(qr, x + cardWidth - 57, y + 20, { width: 45, height: 45 });
    let cursor = y + 75;
    for (const row of card.rows) {
      doc.font(row.heading ? 'Helvetica-Bold' : 'Helvetica').fontSize(row.heading ? fontSize + 0.5 : fontSize).fillColor(row.warning ? '#984C19' : '#142C3F');
      const height = doc.heightOfString(row.text, { width: innerWidth, lineGap: 0.5 });
      doc.text(row.text, x + 12, cursor, { width: innerWidth, lineGap: 0.5 });
      cursor += height + (row.heading ? 6 : 3);
    }
    doc.fillColor('#617782').font('Helvetica').fontSize(6).text(`Registro completo en QR | ${format.toUpperCase()} | ASTRA v0.1`, x + 12, y + cardHeight - 17, { width: innerWidth });
    doc.restore();
  }
  doc.end();
  return completed;
}
