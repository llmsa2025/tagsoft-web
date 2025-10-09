import { PerformanceEvent } from '../schemas/performance';

export const buildPerformance = (p: Omit<Parameters<typeof PerformanceEvent.parse>[0], 'event'>) =>
  PerformanceEvent.parse({ event: 'performance_timing', ...p });
