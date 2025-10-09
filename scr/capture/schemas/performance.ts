import { z } from 'zod';
import { EventBase } from './eventBase';

export const PerformanceEvent = EventBase.extend({
  event: z.literal('performance_timing'),
  lcp_ms: z.number().int().nonnegative().optional(),
  inp_ms: z.number().int().nonnegative().optional(),
  cls: z.number().nonnegative().optional(),
  ttfb_ms: z.number().int().nonnegative().optional(),
});
export type PerformanceEventType = z.infer<typeof PerformanceEvent>;
