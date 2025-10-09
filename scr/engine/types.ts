export type Condition = {
  field: string; // "$.event", "$.module_key", "$.biz.value"
  op: 'eq' | 'neq' | 'contains' | 'gte' | 'lte' | 'in';
  value: any;
};

export type Trigger = {
  trigger_id: string;
  name: string;
  conditions: Condition[]; // AND semantics for MVP
};

export type VariableBinding = {
  targetPath: string;                 // JSONPath in the tag payload (e.g., "$.customer.id")
  variable: { type: string; config: any };
};

export type Tag = {
  tag_id: string;
  type: 'http_webhook' | 'pixel' | 'ga4' | 'queue';
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  bodyTemplate?: any;
  variableBindings?: VariableBinding[];
  trigger_ids: string[];
};

export type ContainerVersionSnapshot = {
  version: number;
  triggers: Trigger[];
  tags: Tag[];
};
