import { VariableResolver } from '../types';
import { JSONPath } from 'jsonpath-plus';

type Cfg = { keyPath: string; table: Record<string, any>; default?: any };

export const lookupTableVar: VariableResolver<Cfg> = {
  type: 'lookupTable',
  resolve: (cfg, ctx) => {
    const out = JSONPath({ path: cfg.keyPath, json: ctx.event }) as any[];
    const key = Array.isArray(out) ? out[0] : out;
    return cfg.table?.[String(key)] ?? cfg.default;
  },
};
