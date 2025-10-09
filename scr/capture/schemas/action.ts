import { z } from 'zod';
import { EventBase } from './eventBase';

export const ActionEvent = EventBase.extend({
  event: z.literal('action_performed'),
  action: z.string(),
  object: z.string().optional(),
  object_id: z.string().optional(),
  success: z.boolean().optional(),
  latency_ms: z.number().int().nonnegative().optional(),
});
export type ActionEventType = z.infer<typeof ActionEvent>;
