export type VariableContext = {
  event: any; // validated event payload
  runtime: {
    now: Date;
    env?: Record<string, string>;
    cacheGet?: (k: string) => any;
    cacheSet?: (k: string, v: any, ttlMs?: number) => void;
  };
};

export interface VariableResolver<Cfg = any> {
  type: string; // unique type name (e.g., "constant")
  resolve: (cfg: Cfg, ctx: VariableContext) => any | Promise<any>;
}
