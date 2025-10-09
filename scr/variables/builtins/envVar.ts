import { VariableResolver } from '../types';

type Cfg = { name: string; fallback?: any };

export const envVar: VariableResolver<Cfg> = {
  type: 'envVar',
  resolve: (cfg, ctx) => {
    return (ctx.runtime.env && ctx.runtime.env[cfg.name]) ?? cfg.fallback;
  },
};
