// Small API wrapper for the console app (Next.js)
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'DEMO_KEY';

export async function api(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: Record<string,string> = {
    'x-api-key': API_KEY,
    ...(options.body && !(options as any).headers?.['content-type'] ? { 'content-type':'application/json' } : {}),
    ...((options.headers as any) || {}),
  };

  const res = await fetch(url, { ...options, headers, cache: 'no-store' });
  const text = await res.text();
  let data: any = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
