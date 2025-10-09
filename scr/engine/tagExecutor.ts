import { JSONPath } from 'jsonpath-plus';
import { getVariableResolver } from '@/variables/registry';
import type { Tag } from './types';

async function applyBindings(
  template: any,
  bindings: NonNullable<Tag['variableBindings']>,
  event: any,
  runtime: any
) {
  const out = JSON.parse(JSON.stringify(template ?? {}));
  for (const b of bindings) {
    const resolver = b.variable?.type && getVariableResolver(b.variable.type);
    if (!resolver) continue;
    const value = await resolver.resolve(b.variable.config, { event, runtime });
    JSONPath({ path: b.targetPath || '$', json: out, callback: (payload, ty, full) => {
      // replace target with resolved value
      const parent = full.parent;
      if (parent && full.parentProperty !== undefined) {
        parent[full.parentProperty] = value;
      }
      return payload;
    }});
  }
  return out;
}

export async function executeTag(tag: Tag, event: any, runtime: any) {
  // Only http_webhook implemented in MVP
  if (tag.type === 'http_webhook') {
    const body = await applyBindings(tag.bodyTemplate ?? {}, tag.variableBindings ?? [], event, runtime);
    const res = await fetch(tag.endpoint!, {
      method: tag.method || 'POST',
      headers: { 'content-type': 'application/json', ...(tag.headers || {}) },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  }

  if (tag.type === 'pixel') {
    const qp = await applyBindings(tag.queryParamsTemplate ?? {}, tag.variableBindings ?? [], event, runtime);
    const url = new URL(tag.endpoint!);
    Object.entries(qp || {}).forEach(([k,v]) => url.searchParams.set(k, String(v)));
    // fire-and-forget; still await for status in node/edge
    const res = await fetch(url.toString(), { method: 'GET' });
    return { ok: res.ok, status: res.status };
  }

  // Future: ga4, queue
  return { ok: false, skipped: true };
}
