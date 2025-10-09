import type { ContainerVersionSnapshot, Tag, Trigger } from './types';
import { evaluateTrigger } from './triggerEvaluator';
import { executeTag } from './tagExecutor';

export async function runEngine(
  event: any,
  snapshot: ContainerVersionSnapshot,
  runtime: { now: Date; env?: Record<string,string> }
) {
  const triggers: Trigger[] = snapshot?.triggers || [];
  const tags: Tag[] = snapshot?.tags || [];

  const fired = triggers.filter(t => evaluateTrigger(t, event)).map(t => t.trigger_id);
  const toRun = tags.filter(tg => tg.trigger_ids?.some(id => fired.includes(id)));

  const results = [];
  for (const tg of toRun) {
    const r = await executeTag(tg, event, runtime);
    results.push({ tag_id: tg.tag_id, result: r });
  }
  return { firedTriggers: fired, tagResults: results };
}
