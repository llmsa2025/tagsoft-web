import { VariableResolver } from '../types';

type Cfg = { value: any };

export const constantVar: VariableResolver<Cfg> = {
  type: 'constant',
  resolve: (cfg) => cfg?.value,
};
