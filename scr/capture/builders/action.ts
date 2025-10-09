import { ActionEvent } from '../schemas/action';

export const buildAction = (p: Omit<Parameters<typeof ActionEvent.parse>[0], 'event'>) =>
  ActionEvent.parse({ event: 'action_performed', ...p });
