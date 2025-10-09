import { VariableResolver } from '../types';

type Cfg = { format?: 'iso' | 'epoch' };

export const nowVar: VariableResolver<Cfg> = {
  type: 'now',
  resolve: (cfg, ctx) => {
    const d = ctx.runtime.now ?? new Date();
    return cfg?.format === 'epoch' ? Math.floor(d.getTime() / 1000) : d.toISOString();
  },
};
