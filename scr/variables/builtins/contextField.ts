import { VariableResolver } from '../types';

type Cfg = { path: string }; // e.g., "context.screen" or "user.id"

export const contextFieldVar: VariableResolver<Cfg> = {
  type: 'contextField',
  resolve: (cfg, ctx) => {
    const path = (cfg?.path || '').split('.');
    return path.reduce<any>((acc, key) => (acc != null ? acc[key] : undefined), ctx.event);
  },
};
