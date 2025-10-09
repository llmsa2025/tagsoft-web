import { z } from 'zod';

export function safeParse<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  const msg = r.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
  return { ok: false, error: msg };
}
