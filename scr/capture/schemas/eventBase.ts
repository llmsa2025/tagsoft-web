// Base schema for every event
import { z } from 'zod';

export const EventBase = z.object({
  event: z.string(),
  timestamp: z.string().datetime().optional(), // server can fill
  account_id: z.string(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  module_key: z.string().optional(),
  feature_key: z.string().optional(),
  context: z.record(z.any()).optional(),
  biz: z.record(z.any()).optional(),
  source: z.enum(['web', 'server', 'ios', 'android']).optional(),
  app_version: z.string().optional(),
  device: z.string().optional(),
  os: z.string().optional(),
  lang: z.string().optional(),
  plan: z.string().optional(),
});
export type EventBaseType = z.infer<typeof EventBase>;
