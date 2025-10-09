import { VariableResolver } from '../types';
import { JSONPath } from 'jsonpath-plus';

type Operand = number | string; // number or JSONPath ("$.biz.value")
type Cfg = { op: 'add' | 'sub' | 'mul' | 'div'; a: Operand; b: Operand; };

function valueOf(o: Operand, event: any): number {
  if (typeof o === 'number') return o;
  if (typeof o === 'string' && o.startsWith('$.')) {
    const out = JSONPath({ path: o, json: event }) as any[];
    const v = Array.isArray(out) ? out[0] : out;
    return Number(v ?? 0);
  }
  return Number(o);
}

export const mathVar: VariableResolver<Cfg> = {
  type: 'math',
  resolve: (cfg, ctx) => {
    const a = valueOf(cfg.a, ctx.event);
    const b = valueOf(cfg.b, ctx.event);
    switch (cfg.op) {
      case 'add': return a + b;
      case 'sub': return a - b;
      case 'mul': return a * b;
      case 'div': return b !== 0 ? a / b : null;
      default: return null;
    }
  },
};
