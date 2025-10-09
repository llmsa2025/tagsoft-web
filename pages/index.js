// pages/index.js
// Tela inicial: lista de Contas e permite criar uma nova.
// Observação: mantemos tudo bem simples (prompt). Depois dá para trocar por modal/form.

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function AccountsHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api("/v1/accounts");
      setItems(res || []);
    } catch (e) {
      alert(e.message || "Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createAccount() {
    const name = prompt("Nome da conta (ex.: Minha Empresa):");
    if (!name) return;
    try {
      await api("/v1/accounts", {
        method: "PUT",
        body: JSON.stringify({ account_id: slugify(name), name })
      });
      await load();
      alert("Conta criada!");
    } catch (e) {
      alert(e.message || "Erro ao criar conta");
    }
  }

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Contas</h2>
        <button onClick={createAccount} style={btnPrimary}>Criar conta</button>
      </div>

      {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
      {!loading && items.length === 0 && (
        <div style={emptyBox}>Nenhuma conta ainda. Crie a primeira.</div>
      )}

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        {items.map((acc) => (
          <div key={acc.account_id} style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                <Link href={`/accounts/${encodeURIComponent(acc.account_id)}`} style={{ textDecoration: "none" }}>
                  {acc.name}
                </Link>
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                ID: <code>{acc.account_id}</code>
              </div>
            </div>
            <div style={{ width: 260, fontSize: 13, color: "#444" }}>
              {/* resumos simples; servidor e web são contados no backend por convenção futura */}
              Tipos de contêiner: Web / Servidor
            </div>
            <div>
              <Link href={`/accounts/${encodeURIComponent(acc.account_id)}`} style={btnGhost}>
                Abrir
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function slugify(s) {
  return (s || "")
    .toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// estilos inline simples
const btnPrimary = { padding: "8px 12px", borderRadius: 10, background: "#111", color: "#fff", border: "1px solid #111", cursor: "pointer" };
const btnGhost   = { padding: "6px 10px", borderRadius: 10, background: "#f3f4f6", color: "#111", border: "1px solid #e5e7eb", textDecoration: "none" };
const emptyBox   = { padding: 16, borderRadius: 12, border: "1px dashed #ddd", background: "#fff", marginTop: 8 };
const row        = { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderTop: "1px solid #f1f5f9" };
