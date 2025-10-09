// lib/api.js
// Wrapper de API (Next.js) – define content-type corretamente e serializa objetos.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'DEMO_KEY';

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const headers = { 'x-api-key': API_KEY, ...(options.headers || {}) };

  // Normaliza body e garante content-type
  let body = options.body;
  if (body !== undefined && body !== null) {
    if (typeof body === 'object') {
      headers['content-type'] = headers['content-type'] || 'application/json';
      body = JSON.stringify(body);
    } else if (typeof body === 'string') {
      headers['content-type'] = headers['content-type'] || 'application/json';
    }
  }

  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
    body,
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

/* Conveniências */

// Accounts
export const listAccounts   = () => api('/v1/accounts');
export const upsertAccount  = (payload) => api('/v1/accounts',   { method: 'PUT',  body: payload });
export const getAccount     = (id) => api(`/v1/accounts/${encodeURIComponent(id)}`);

// Containers
export const listContainers = (params) =>
  api(`/v1/containers${params?.account_id ? `?account_id=${encodeURIComponent(params.account_id)}` : ''}`);
export const upsertContainer = (payload) => api('/v1/containers', { method: 'PUT', body: payload });
export const getContainer    = (id) => api(`/v1/containers/${encodeURIComponent(id)}`);

// Analytics / Ingest
export const getOverview   = () => api('/v1/analytics/overview');
export const ingestEvent   = (evt) => api('/v1/ingest', { method: 'POST', body: evt });
