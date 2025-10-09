// pages/accounts/[id].js
// Mostra a conta e os contêineres desta conta. Permite criar novos (Web / Servidor).

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

export default function AccountDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [account, setAccount] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const acc = await api(`/v1/accounts/${encodeURIComponent(id)}`);
      const list = await api(`/v1/containers?account_id=${encodeURIComponent(id)}`);
      setAccount(acc || null);
      setContainers(list || []);
    } catch (e) {
      alert(e.message || "Erro ao carregar conta");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function createContainer(type) {
    if (!account) return;
    const name = prompt(`Nome do contêiner ${type === "web" ? "Web (SaaS)" : "Servidor (ERP)"}:`);
    if (!name) return;

    try {
      const body = {
        container_id: `${account.account_id}__${slugify(name)}`,
        name,
        version: 1,
        account_id: account.account_id,
        type,                       // "web" | "server"
        variables: [],
        triggers: [],
        tags: []
      };
      await api("/v1/containers", { method: "PUT", body: JSON.stringify(body) });
      await load();
      alert("Contêiner criado!");
    } catch (e) {
      alert(e.message || "Erro ao criar contêiner");
    }
  }

  return (
    <section>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Conta</div>
          <h2 style={{ margin: 0 }}>{account?.name || "…"}</h2>
          {account && <div style={{ fontSize: 12, color: "#6b7280" }}>ID: <code>{account.account_id}</code></div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => createContainer("web")} style={btnPrimary}>Novo contêiner Web (SaaS)</button>
          <button onClick={() => createContainer("server")} style={btnPrimaryLight}>Novo contêiner Servidor (ERP)</button>
        </div>
      </div>

      {loading && <div style={{ opacity:.6 }}>Carregando…</div>}

      {!loading && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: "10px 16px", fontWeight: 600, background: "#f8fafc", borderBottom: "1px solid #eef2f7" }}>
            Contêineres
          </div>

          {containers.length === 0 && <div style={{ padding: 16, opacity: .7 }}>Nenhum contêiner ainda.</div>}

          {containers.map((c) => (
            <div key={c.container_id} style={row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  <Link href={`/containers/${encodeURIComponent(c.container_id)}`} style={{ textDecoration:"none" }}>
                    {c.name}
                  </Link>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Tipo: <b>{c.type === "server" ? "Servidor" : "Web"}</b> · Versão: v{c.version} · ID: <code>{c.container_id}</code>
                </div>
              </div>
              <div>
                <Link href={`/containers/${encodeURIComponent(c.container_id)}`} style={btnGhost}>Abrir</Link>
              </div>
            </div>
          ))}
        </div>
      )}
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

const btnPrimary     = { padding: "8px 12px", borderRadius: 10, background: "#111", color: "#fff", border: "1px solid #111", cursor:"pointer" };
const btnPrimaryLight= { padding: "8px 12px", borderRadius: 10, background: "#0ea5e9", color: "#fff", border: "1px solid #0284c7", cursor:"pointer" };
const btnGhost       = { padding: "6px 10px", borderRadius: 10, background: "#f3f4f6", color: "#111", border: "1px solid #e5e7eb", textDecoration:"none" };
const row            = { display: "flex", alignItems:"center", gap: 12, padding: "14px 16px", borderTop: "1px solid #f1f5f9" };
