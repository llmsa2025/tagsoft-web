import { z } from 'zod';
import { EventBase } from './eventBase';

export const SessionStart = EventBase.extend({
  event: z.literal('session_start'),
});
export type SessionStartType = z.infer<typeof SessionStart>;

export const SessionEnd = EventBase.extend({
  event: z.literal('session_end'),
  duration_ms: z.number().int().nonnegative().optional(),
});
export type SessionEndType = z.infer<typeof SessionEnd>;
