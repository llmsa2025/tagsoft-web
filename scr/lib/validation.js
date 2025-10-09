// src/lib/validation.js
/**
 * Se quiser, troque por zod/yup futuramente.
 * Por ora mantemos helpers simples.
 */

export function ensureNonEmpty(str, fieldName = "campo") {
  const v = String(str || "").trim();
  if (!v) throw new Error(`${fieldName} obrigatório`);
  return v;
}

export function ensureEnum(value, list, fieldName = "campo") {
  if (!list.includes(value)) {
    throw new Error(`${fieldName} inválido`);
  }
  return value;
}
