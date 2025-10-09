// tagsoft-web/lib/api.js
// Wrapper de API para o front (Next.js)

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'DEMO_KEY';

/**
 * Chamada genérica de API
 * - path: ex. "/v1/containers"
 * - options: mesmo shape do fetch (method, headers, body, etc.)
 */
export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const headers = {
    'x-api-key': API_KEY,
    // define JSON automaticamente se body for objeto e não tiver content-type
    ...(options.body &&
      typeof options.body === 'object' &&
      !(options.headers && options.headers['content-type'])
        ? { 'content-type': 'application/json' }
        : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
    // Se você for usar cookies/sessão na API, ative:
    // credentials: 'include',
  });

  const raw = await res.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!res.ok) {
    const msg = typeof data === 'object' && data?.error ? data.error : `HTTP ${res.status}`;
    throw new Error(`API ${path}: ${msg}`);
  }
  return data;
}

/* Conveniências (opcional) — usam o wrapper genérico acima */

// Accounts
export function listAccounts() {
  return api('/v1/accounts');
}
export function upsertAccount(payload) {
  return api('/v1/accounts', { method: 'PUT', body: JSON.stringify(payload) });
}
export function getAccount(id) {
  return api(`/v1/accounts/${encodeURIComponent(id)}`);
}

// Containers
export function listContainers(params) {
  const qs = params?.account_id ? `?account_id=${encodeURIComponent(params.account_id)}` : '';
  return api(`/v1/containers${qs}`);
}
export function upsertContainer(payload) {
  return api('/v1/containers', { method: 'PUT', body: JSON.stringify(payload) });
}
export function getContainer(id) {
  return api(`/v1/containers/${encodeURIComponent(id)}`);
}

// Analytics
export function getOverview() {
  return api('/v1/analytics/overview');
}

// Ingest (exemplo de envio de evento)
export function ingestEvent(evt) {
  return api('/v1/ingest', { method: 'POST', body: JSON.stringify(evt) });
}
