import { z } from 'zod';
import { EventBase } from './eventBase';

export const ScreenViewStart = EventBase.extend({
  event: z.literal('screen_view_start'),
  context: z.object({
    screen: z.string(),
  }).passthrough(),
});
export type ScreenViewStartType = z.infer<typeof ScreenViewStart>;

export const ScreenViewEnd = EventBase.extend({
  event: z.literal('screen_view_end'),
  context: z.object({
    screen: z.string(),
  }).passthrough(),
  duration_ms: z.number().int().nonnegative().optional(),
});
export type ScreenViewEndType = z.infer<typeof ScreenViewEnd>;
