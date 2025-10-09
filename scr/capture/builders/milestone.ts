import { MilestoneEvent } from '../schemas/milestone';

export const buildMilestone = (p: Omit<Parameters<typeof MilestoneEvent.parse>[0], 'event'>) =>
  MilestoneEvent.parse({ event: 'milestone_completed', ...p });
