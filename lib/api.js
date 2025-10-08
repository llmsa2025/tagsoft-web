// lib/api.js
export function normalizeBaseUrl(u) {
  const s = (u || '').trim();
  if (!s) return 'http://localhost:8787';
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  return withProto.replace(/\/+$/, '');
}

export const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
export const API_URL = normalizeBaseUrl(RAW_API_URL);
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'DEMO_KEY';

export function mask(key) {
  if (!key) return '';
  if (key.length <= 6) return '*'.repeat(key.length);
  return key.slice(0, 3) + '…' + key.slice(-3);
}

export async function health() {
  const url = `${API_URL}/v1/health`;
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Health não-JSON em ${url}: ${text?.slice(0,120)}`); }
}

export async function api(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const headers = { 'x-api-key': API_KEY, ...(opts.headers || {}) };
  if (opts.body && !headers['content-type']) headers['content-type'] = 'application/json';
  const res = await fetch(url, { ...opts, headers, cache: 'no-store', mode: 'cors', credentials: 'omit' });
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!ct.includes('application/json')) throw new Error(`Resposta não-JSON da API em ${url}: ${text?.slice(0,120)}`);
  const data = text ? JSON.parse(text) : null;
  if (!res.ok || (data && data.error)) throw new Error(data?.error || `${res.status} ${res.statusText}`);
  return data;
}
