import { z } from 'zod';
import { EventBase } from './eventBase';

export const ErrorEvent = EventBase.extend({
  event: z.literal('error'),
  code: z.string(),
  message_hash: z.string().optional(),
  severity: z.enum(['warn', 'error', 'fatal']).default('error'),
  retry_count: z.number().int().nonnegative().optional(),
});
export type ErrorEventType = z.infer<typeof ErrorEvent>;
