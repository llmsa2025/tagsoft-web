// src/lib/cache.js
/**
 * Abstração simples de cache em memória (para MVP).
 * Trocar por Redis mais à frente.
 */

const memory = new Map();

export function cacheGet(key) {
  const it = memory.get(key);
  if (!it) return null;
  if (it.exp && Date.now() > it.exp) {
    memory.delete(key);
    return null;
  }
  return it.value;
}

export function cacheSet(key, value, ttlMs = 0) {
  memory.set(key, { value, exp: ttlMs ? Date.now() + ttlMs : 0 });
}
