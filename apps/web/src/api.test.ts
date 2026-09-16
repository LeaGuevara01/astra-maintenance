import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('API transport session isolation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('discards a response that belongs to an earlier session', async () => {
    let resolveFetch!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { resolveFetch = resolve; })));
    const { api, setCsrf } = await import('./api');

    setCsrf('session-a');
    const pending = api<{ assets: number }>('/dashboard');
    setCsrf('session-b');
    resolveFetch(jsonResponse({ assets: 99 }));

    await expect(pending).rejects.toMatchObject({ code: 'STALE_SESSION', status: 0 });
  });

  it('discards a late network failure after the session changes', async () => {
    let rejectFetch!: (error: Error) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((_resolve, reject) => { rejectFetch = reject; })));
    const { api, setCsrf } = await import('./api');

    setCsrf('session-a');
    const pending = api('/orders');
    setCsrf('session-b');
    rejectFetch(new Error('socket closed'));

    await expect(pending).rejects.toMatchObject({ code: 'STALE_SESSION', status: 0 });
  });

  it('does not reuse an uncertain idempotency key across sessions', async () => {
    const seenKeys: string[] = [];
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      seenKeys.push(new Headers(init?.headers).get('Idempotency-Key') ?? '');
      return Promise.reject(new Error('connection lost'));
    }));
    const { api, setCsrf } = await import('./api');

    setCsrf('session-a');
    await expect(api('/orders/generate', 'POST', { assetId: 'A', targetMeter: 600, actualMeter: 600 }, true)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    setCsrf('session-b');
    await expect(api('/orders/generate', 'POST', { assetId: 'A', targetMeter: 600, actualMeter: 600 }, true)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });

    expect(seenKeys).toHaveLength(2);
    expect(seenKeys[0]).not.toBe('');
    expect(seenKeys[1]).not.toBe(seenKeys[0]);
  });

  it('keeps the idempotency key for a same-session transport retry', async () => {
    const seenKeys: string[] = [];
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      seenKeys.push(new Headers(init?.headers).get('Idempotency-Key') ?? '');
      return Promise.reject(new Error('connection lost'));
    }));
    const { api, setCsrf } = await import('./api');

    setCsrf('session-a');
    const request = () => api('/orders/1/close', 'POST', { result: 'OPERATIVE' }, true);
    await expect(request()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    await expect(request()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });

    expect(seenKeys[1]).toBe(seenKeys[0]);
  });
});
