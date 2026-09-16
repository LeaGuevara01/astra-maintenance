// Public contract, served verbatim at /api/v1/openapi.json.
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const string = { type: 'string' };
const number = { type: 'number' };
const integer = { type: 'integer' };
const boolean = { type: 'boolean' };
const nullableString = { type: ['string', 'null'] };
const object = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: 'object', properties, required });
const array = (items: unknown) => ({ type: 'array', items });
const json = (schema: unknown) => ({ 'application/json': { schema } });
const success = (schema: unknown, status = '200') => ({ [status]: { description: 'Success', content: json(schema) }, default: { description: 'API error', content: json(ref('Error')) } });
const body = (schema: unknown) => ({ required: true, content: json(schema) });
const identifier = (name = 'id') => ({ name, in: 'path', required: true, schema: string });
const query = (name: string, schema: unknown, description?: string) => ({ name, in: 'query', required: false, schema, ...(description ? { description } : {}) });
const csrf = { name: 'X-CSRF-Token', in: 'header', required: true, schema: string, description: 'Token returned by login/me. The Origin header must match APP_ORIGIN.' };
const key = { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', minLength: 8, maxLength: 160, pattern: '^[A-Za-z0-9._:-]+$' } };
const role = (allowed: string) => `Requires ${allowed}. Other authenticated roles receive 403.`;
const get = (summary: string, schema: unknown, params: unknown[] = []) => ({ summary, parameters: params, responses: success(schema) });
const post = (summary: string, schema: unknown, response: unknown, params: unknown[] = [], status = '200') => ({ summary, parameters: [csrf, ...params], requestBody: body(schema), responses: success(response, status) });
const amount = { type: 'number', exclusiveMinimum: 0, maximum: 1000000, multipleOf: 0.001 };
const meter = { type: 'integer', minimum: 0, maximum: 100000000 };

export const openapi = {
  openapi: '3.1.0',
  info: { title: 'ASTRA Maintenance API', version: '0.1.0', description: 'Synthetic pilot. No OEM recommendations. Nominal maintenance, immutable snapshots, transactional stock and server sessions. All dates are ISO 8601; quantities have up to three decimal places.' },
  servers: [{ url: '/api/v1' }],
  security: [{ session: [] }],
  paths: {
    '/auth/login': { post: { summary: 'Create an 8-hour server session', security: [], parameters: [{ name: 'Origin', in: 'header', required: true, schema: string }], requestBody: body(object({ email: { type: 'string', format: 'email' }, password: string })), responses: success(ref('Auth')) } },
    '/auth/me': { get: get('Read current identity and CSRF token', ref('Auth')) },
    '/auth/logout': { post: { summary: 'Invalidate this session', parameters: [csrf], responses: { '204': { description: 'Session invalidated' }, default: { description: 'API error', content: json(ref('Error')) } } } },
    '/dashboard': { get: get('Read operational indicators', object({ assets: integer, openOrders: integer, overdue: integer, lowStock: integer })) },
    '/assets': {
      get: get('List assets and assigned plans', array(ref('Asset'))),
      post: post(role('ADMIN') + ' Create an asset.', object({ code: string, name: string, family: string, meter, planId: string }, ['code', 'name', 'family', 'meter']), ref('Asset'), [], '201'),
    },
    '/assets/{id}/readings': { post: post(role('ADMIN or TECHNICIAN') + ' Record a monotonic reading.', object({ value: meter }), ref('Asset'), [identifier()]) },
    '/plans': { get: get('List versioned plans and technical provenance', array(ref('Plan'))) },
    '/inventory': { get: get('List stock and free quantities', array(ref('Part'))) },
    '/inventory/{id}/receive': { post: post(role('ADMIN') + ' Receive stock; reference is unique per part and retry safe.', object({ quantity: amount, reference: string }), ref('Part'), [identifier()]) },
    '/orders': { get: get('List operational snapshots', array(ref('Order'))) },
    '/orders/generate': { post: post(role('ADMIN') + ' Generate due tasks by frequency divisibility. Asset/plan/target also deduplicates requests.', object({ assetId: string, targetMeter: { ...meter, minimum: 1 }, actualMeter: meter }), ref('Order'), [key], '201') },
    '/orders/{id}': { get: get('Read an order, snapshots and audit trail', ref('Order'), [identifier()]) },
    '/orders/{id}/reserve': { post: { summary: role('ADMIN or TECHNICIAN') + ' Reserve available stock; shortages remain visible.', parameters: [csrf, identifier(), key], responses: success(ref('Order')) } },
    '/orders/{id}/consume': { post: post(role('ADMIN or TECHNICIAN') + ' Consume own reservations/free stock without stealing other reservations.', object({ materialId: string, quantity: amount }), ref('Order'), [identifier(), key]) },
    '/orders/{id}/tasks/{taskId}': { patch: post(role('ADMIN or TECHNICIAN') + ' Update an open task; deferral requires reason and a future/today date.', object({ status: { enum: ['PENDING', 'DONE', 'DEFERRED', 'NA'] }, deferredReason: string, deferredUntil: { type: 'string', format: 'date' } }, ['status']), ref('Order'), [identifier(), identifier('taskId')]) },
    '/orders/{id}/checkpoints/{checkpointId}': { patch: post(role('ADMIN or TECHNICIAN') + ' Record verification; critical checkpoints cannot be NA.', object({ result: { enum: ['PASS', 'FAIL', 'NA'] } }), ref('Order'), [identifier(), identifier('checkpointId')]) },
    '/orders/{id}/close': { post: post(role('ADMIN or TECHNICIAN') + ' Close atomically. Failed/pending critical checkpoints block every close result, including NOT_OPERATIVE. Mandatory tasks must be resolved, and DONE material tasks require real consumption.', object({ result: { enum: ['OPERATIVE', 'OPERATIVE_WITH_NOTES', 'NOT_OPERATIVE'] }, notes: string }, ['result']), ref('Order'), [identifier(), key]) },
    '/orders/{id}/card': { get: { summary: 'Print identical snapshots as A6 or four cards on A4', parameters: [identifier(), { name: 'format', in: 'query', schema: { enum: ['a6', 'a4'], default: 'a6' } }], responses: { '200': { description: 'Printable HTML', content: { 'text/html': { schema: string } } }, default: { description: 'API error', content: json(ref('Error')) } } } },
    '/orders/{id}/pdf': { get: { summary: 'Selectable-text PDF with a QR linking to the same digital order', parameters: [identifier(), { name: 'format', in: 'query', schema: { enum: ['a6', 'a4'], default: 'a6' } }], responses: { '200': { description: 'PDF (A6 or A4)', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } }, '422': { description: 'Card would exceed legible A6 capacity', content: json(ref('Error')) }, default: { description: 'API error', content: json(ref('Error')) } } } },
    '/audit': { get: get('Latest 500 audit records', array(ref('Audit'))) },
    '/document-candidates': {
      get: get('List the latest 200 document candidates with complete review history', array(ref('DocumentCandidate'))),
      post: post(role('ADMIN') + ' Register a candidate and its immutable source revision.', ref('DocumentCandidateInput'), ref('DocumentCandidate'), [key], '201'),
    },
    '/document-candidates/page': {
      get: get('Page candidates in stable createdAt/id order, including only the latest review', ref('DocumentCandidatePage'), [query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 25 }), query('cursor', string)]),
    },
    '/document-candidates/{id}/reviews': {
      get: get('Page immutable candidate reviews by descending version', ref('DocumentReviewPage'), [identifier(), query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 25 }), query('cursor', { type: 'integer', minimum: 1 })]),
      post: post(role('ADMIN or TECHNICIAN') + ' Append a version-checked human decision.', object({ version: { type: 'integer', minimum: 0 }, decision: { enum: ['A_CONFIRMAR', 'VALIDADO', 'RECHAZADO'] }, reason: string }), ref('DocumentCandidate'), [identifier(), key]),
    },
    '/document-candidates/dry-run': {
      post: post('Compare 1-200 unique persisted candidates with the catalog. Available to every authenticated role; never applies changes.', object({ ids: { type: 'array', minItems: 1, maxItems: 200, uniqueItems: true, items: string } }), ref('CandidateDryRun')),
    },
    '/document-candidates/sources/page': {
      get: get('Page source revisions before candidate derivation', ref('DocumentSourcePage'), [
        query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 25 }), query('cursor', string),
        query('extractionStatus', { enum: ['TEXT_EXTRACTED', 'OCR_REQUIRED', 'VISUAL_REVIEW_REQUIRED', 'DUPLICATE', 'A_CONFIRMAR'] }),
        query('family', { type: 'string', maxLength: 80 }), query('priority', { enum: ['ALTA', 'MEDIA', 'BAJA'] }),
      ]),
    },
    '/document-candidates/findings/page': {
      get: get('Page assisted findings and their latest human review', ref('DocumentFindingPage'), [
        query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 25 }), query('cursor', string),
        query('decision', { enum: ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'] }),
        query('kind', { type: 'string', maxLength: 80 }), query('sourceId', { type: 'string', maxLength: 120 }),
        query('confidence', { type: 'string', maxLength: 30 }), query('category', { type: 'string', maxLength: 80 }),
        query('relevance', { type: 'string', maxLength: 30 }), query('provenanceKind', { type: 'string', maxLength: 80 }),
      ]),
    },
    '/document-candidates/findings/{id}/reviews': {
      post: post(role('ADMIN or TECHNICIAN') + ' Append a human finding decision; no catalog or stock effect.', object({ decision: { enum: ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'] }, reason: string }), ref('DocumentFinding'), [identifier(), key]),
    },
    '/document-candidates/findings/{id}/candidate': {
      post: {
        summary: role('ADMIN') + ' Derive a PART_CANDIDATE explicitly; preserves A_CONFIRMAR and never applies catalog or stock.',
        parameters: [csrf, identifier(), key],
        requestBody: { required: false, content: json(object({ reason: string }, [])) },
        responses: success(ref('DocumentCandidate'), '201'),
      },
    },
    '/version': { get: { ...get('Identify the deployed artifact', object({ version: string, commit: string, environment: string })), security: [] } },
    '/openapi.json': { get: { summary: 'Read this contract', security: [], responses: success({ type: 'object' }) } },
    '/health/live': { servers: [{ url: '/' }], get: { summary: 'Process liveness', security: [], responses: success(object({ status: { const: 'ok' } })) } },
    '/health/ready': { servers: [{ url: '/' }], get: { summary: 'Database and schema readiness', security: [], responses: { ...success(object({ status: { const: 'ready' } })), '503': { description: 'Database/schema unavailable' } } } },
  },
  components: {
    securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'astra_session', description: 'HttpOnly opaque session; SameSite=Strict, Secure outside explicitly configured loopback staging/development.' } },
    schemas: {
      Error: object({ error: object({ code: string, message: string, details: {} }, ['code', 'message']) }),
      User: object({ id: string, name: string, email: string, role: { enum: ['ADMIN', 'TECHNICIAN', 'VIEWER'] } }),
      Auth: object({ user: ref('User'), csrfToken: string }),
      Asset: object({ id: string, code: string, name: string, family: string, meter, operatingStatus: string, planId: nullableString, plan: { anyOf: [ref('Plan'), { type: 'null' }] } }, ['id', 'code', 'name', 'family', 'meter', 'operatingStatus']),
      Plan: object({ id: string, code: string, name: string, revision: integer, status: string, tasks: array(ref('PlanTask')) }),
      PlanTask: object({ id: string, code: string, description: string, frequency: integer, mandatory: boolean, blocking: boolean, sourceType: string, sourceReference: string, partId: nullableString, quantity: { type: ['number', 'null'] } }, ['id', 'code', 'description', 'frequency', 'mandatory', 'blocking', 'sourceType', 'sourceReference']),
      Part: object({ id: string, code: string, name: string, partNumber: string, unit: string, onHand: number, reserved: number, available: number }),
      Order: object({ id: string, code: string, status: { enum: ['OPEN', 'CLOSED'] }, targetMeter: meter, actualMeter: meter, nextServiceMeter: meter, createdAt: { type: 'string', format: 'date-time' }, closedAt: nullableString, result: nullableString, notes: nullableString, asset: ref('Asset'), plan: object({ id: string, name: string, revision: integer }), tasks: array(ref('OrderTask')), materials: array(ref('OrderMaterial')), checkpoints: array(ref('Checkpoint')), audit: array(ref('Audit')) }, ['id', 'code', 'status', 'targetMeter', 'actualMeter', 'nextServiceMeter', 'createdAt', 'asset', 'plan', 'tasks', 'materials', 'checkpoints']),
      OrderTask: { allOf: [ref('PlanTask'), object({ status: { enum: ['PENDING', 'DONE', 'DEFERRED', 'NA'] }, deferredReason: nullableString, deferredUntil: nullableString, deferredBy: nullableString }, ['status'])] },
      OrderMaterial: object({ id: string, partId: string, part: object({ code: string, name: string, partNumber: string, unit: string }), quantityPlanned: number, quantityReserved: number, quantityUsed: number, shortage: number }),
      Checkpoint: object({ id: string, code: string, label: string, critical: boolean, result: { enum: ['PENDING', 'PASS', 'FAIL', 'NA'] } }),
      Audit: object({ id: string, createdAt: { type: 'string', format: 'date-time' }, actorName: string, action: string, entityId: string, details: {} }),
      DocumentRevision: object({ id: string, sourceId: string, title: string, sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' }, createdAt: { type: 'string', format: 'date-time' } }),
      DocumentReview: object({ id: string, candidateId: string, version: { type: 'integer', minimum: 1 }, decision: { enum: ['A_CONFIRMAR', 'VALIDADO', 'RECHAZADO'] }, reason: string, actorId: string, createdAt: { type: 'string', format: 'date-time' }, actorName: nullableString }, ['id', 'candidateId', 'version', 'decision', 'reason', 'actorId', 'createdAt']),
      DocumentCandidate: object({ id: string, revisionId: string, revision: ref('DocumentRevision'), code: string, name: string, partNumber: string, unit: string, locator: string, applicability: string, version: { type: 'integer', minimum: 0 }, createdAt: { type: 'string', format: 'date-time' }, reviews: array(ref('DocumentReview')) }, ['id', 'revisionId', 'revision', 'code', 'name', 'partNumber', 'unit', 'locator', 'applicability', 'version', 'createdAt', 'reviews']),
      DocumentCandidateInput: object({ sourceId: string, title: string, sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' }, code: string, name: string, partNumber: { type: 'string', default: 'A_CONFIRMAR' }, unit: string, locator: string, applicability: string }, ['sourceId', 'title', 'sha256', 'code', 'name', 'unit', 'locator', 'applicability']),
      DocumentCandidatePage: object({ items: array(ref('DocumentCandidate')), nextCursor: nullableString }),
      DocumentReviewPage: object({ items: array(ref('DocumentReview')), nextCursor: { type: ['integer', 'null'] } }),
      DocumentSource: object({ id: string, sourceId: string, title: string, sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' }, createdAt: { type: 'string', format: 'date-time' }, kind: string, extractionStatus: string, pages: { type: ['integer', 'null'] }, pagesNeedingOCR: array(integer), reviewStatus: string, family: string, priority: { enum: ['ALTA', 'MEDIA', 'BAJA'] }, hasCandidates: boolean }),
      DocumentSourcePage: object({ items: array(ref('DocumentSource')), nextCursor: nullableString }),
      DocumentFindingReview: object({ id: string, findingId: string, decision: { enum: ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'] }, reason: string, actorId: string, createdAt: { type: 'string', format: 'date-time' } }),
      DocumentFinding: object({ id: string, runId: string, kind: string, code: string, name: string, partNumber: string, unit: string, locator: string, applicability: string, confidence: string, reviewStatus: { enum: ['A_CONFIRMAR', 'CREATE_CANDIDATE', 'REJECTED', 'OCR_REQUIRED', 'CONFLICT'] }, stockEffect: { const: 'NONE' }, evidence: {}, warnings: array(string), createdAt: { type: 'string', format: 'date-time' }, run: {}, reviews: array(ref('DocumentFindingReview')) }, ['id', 'runId', 'kind', 'code', 'name', 'partNumber', 'unit', 'locator', 'applicability', 'confidence', 'reviewStatus', 'stockEffect', 'evidence', 'warnings', 'createdAt']),
      DocumentFindingPage: object({ items: array(ref('DocumentFinding')), nextCursor: nullableString }),
      CandidateDryRunResult: object({ candidateId: string, decision: { enum: ['ADD', 'UPDATE', 'UNCHANGED', 'CONFLICT', 'REJECTED'] }, reasons: array(string), proposed: object({ code: string, name: string, partNumber: string, unit: string }), provenance: object({ sourceId: string, locator: string, sourceRevision: string }, ['sourceId', 'locator']), stockEffect: { const: 'NONE' }, equivalence: { enum: ['NONE', 'UNVALIDATED'] }, fingerprint: { type: 'string', pattern: '^[a-f0-9]{64}$' } }),
      CandidateDryRun: object({ apply: { const: false }, results: array(ref('CandidateDryRunResult')), summary: object({ add: integer, update: integer, unchanged: integer, conflict: integer, rejected: integer }) }),
    },
  },
};
