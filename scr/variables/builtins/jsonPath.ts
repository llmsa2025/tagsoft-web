import { VariableResolver } from '../types';
import { JSONPath } from 'jsonpath-plus';

type Cfg = { expr: string }; // e.g., "$.biz.value"

export const jsonPathVar: VariableResolver<Cfg> = {
  type: 'jsonpath',
  resolve: (cfg, ctx) => {
    const out = JSONPath({ path: cfg?.expr || '$', json: ctx.event }) as any[];
    return Array.isArray(out) ? (out.length ? out[0] : undefined) : out;
  },
};
