import { z } from 'zod';
import { EventBase } from './eventBase';

export const MilestoneEvent = EventBase.extend({
  event: z.literal('milestone_completed'),
  milestone: z.string(),
  ttfv_seconds: z.number().int().nonnegative().optional(),
});
export type MilestoneEventType = z.infer<typeof MilestoneEvent>;
