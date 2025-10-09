// src/lib/auth.js
/**
 * Stub de autenticação/autorização (RBAC) para uso futuro.
 * Você poderá integrar JWT/cookies aqui.
 */

export function getCurrentUser() {
  // No futuro: ler cookie/sessão
  return { id: "u_demo", name: "Usuário Demo", role: "owner" };
}

export function can(action, resource, context = {}) {
  // Regras simples de exemplo:
  // owner pode tudo; viewer apenas leitura
  const user = getCurrentUser();
  if (user.role === "owner") return true;
  if (user.role === "viewer") {
    return action === "read";
  }
  return false;
}
