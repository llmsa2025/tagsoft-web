// Lugar para schemas (zod/yup) no futuro.
// Por enquanto, validações simples utilitárias:
export function required(v, msg='Campo obrigatório') {
  if (!v || String(v).trim() === '') throw new Error(msg);
}
