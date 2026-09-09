let csrfToken = '';
const requestKeys = new Map<string, string>();
export function setCsrf(token: string) { if (token !== csrfToken) requestKeys.clear(); csrfToken = token; }
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}
export async function api<T>(path: string, method = 'GET', body?: unknown, idempotent = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const signature = `${method}:${path}:${JSON.stringify(body)}`;
  if (idempotent) {
    // Keep the same key on transport failures so an uncertain request can be retried safely.
    const key = requestKeys.get(signature) || crypto.randomUUID();
    requestKeys.set(signature, key);
    headers['Idempotency-Key'] = key;
  }
  let response: Response;
  try { response = await fetch(`/api/v1${path}`, { method, headers, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw new ApiError(0, 'NETWORK_ERROR', 'No pudimos conectar con ASTRA. Revisá la conexión y reintentá; la operación conserva su identificador.'); }
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new ApiError(response.status, 'INVALID_RESPONSE', 'El servidor no devolvió una respuesta válida. Verificá que la API esté disponible.');
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/me') window.dispatchEvent(new Event('astra:session-expired'));
    // An explicit rejection can be corrected and submitted as a new operation.
    if (response.status >= 400 && response.status < 500) requestKeys.delete(signature);
    throw new ApiError(response.status, data.error?.code || 'API_ERROR', data.error?.message || 'No se pudo completar la operación.', data.error?.details);
  }
  if (idempotent) requestKeys.delete(signature);
  return data as T;
}
