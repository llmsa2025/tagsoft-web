import { ErrorEvent } from '../schemas/error';

export const buildError = (p: Omit<Parameters<typeof ErrorEvent.parse>[0], 'event'>) =>
  ErrorEvent.parse({ event: 'error', ...p });
