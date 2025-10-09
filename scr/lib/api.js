// Wrapper de API (front) — mantém o que você já usa, só movido para /src/lib
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'DEMO_KEY';

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const headers = {
    'x-api-key': API_KEY,
    ...(options.body &&
      typeof options.body === 'object' &&
      !(options.headers && options.headers['content-type'])
        ? { 'content-type': 'application/json' }
        : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { cache: 'no-store', ...options, headers });
  const raw = await res.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!res.ok) {
    const msg = typeof data === 'object' && data?.error ? data.error : `HTTP ${res.status}`;
    throw new Error(`API ${path}: ${msg}`);
  }
  return data;
}

/* Helpers convenientes */
export function listAccounts()   { return api('/v1/accounts'); }
export function upsertAccount(p) { return api('/v1/accounts',   { method:'PUT', body: JSON.stringify(p) }); }
export function getAccount(id)   { return api(`/v1/accounts/${encodeURIComponent(id)}`); }

export function listContainers(params) {
  const qs = params?.account_id ? `?account_id=${encodeURIComponent(params.account_id)}` : '';
  return api(`/v1/containers${qs}`);
}
export function upsertContainer(p){ return api('/v1/containers', { method:'PUT', body: JSON.stringify(p) }); }
export function getContainer(id)  { return api(`/v1/containers/${encodeURIComponent(id)}`); }

export function getOverview()     { return api('/v1/analytics/overview'); }
export function ingestEvent(evt)  { return api('/v1/ingest', { method:'POST', body: JSON.stringify(evt) }); }
