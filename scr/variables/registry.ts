import { VariableResolver } from './types';
import { constantVar } from './builtins/constant';
import { contextFieldVar } from './builtins/contextField';
import { jsonPathVar } from './builtins/jsonPath';
import { envVar } from './builtins/envVar';
import { nowVar } from './builtins/now';
import { mathVar } from './builtins/math';
import { lookupTableVar } from './builtins/lookupTable';

const REGISTRY = new Map<string, VariableResolver>([
  [constantVar.type, constantVar],
  [contextFieldVar.type, contextFieldVar],
  [jsonPathVar.type, jsonPathVar],
  [envVar.type, envVar],
  [nowVar.type, nowVar],
  [mathVar.type, mathVar],
  [lookupTableVar.type, lookupTableVar],
]);

export function getVariableResolver(type: string): VariableResolver | undefined {
  return REGISTRY.get(type);
}

export function registerVariableResolver(v: VariableResolver) {
  REGISTRY.set(v.type, v);
}
