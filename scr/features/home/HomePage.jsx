// src/features/home/HomePage.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { listAccounts, upsertAccount, upsertContainer } from "@/lib/api";
import CreateAccountSlide from "@/features/accounts/CreateAccountSlide";
import CreateContainerSlide from "@/features/accounts/CreateContainerSlide";

/**
 * HomePage: lista contas e seus containers.
 * - Botão "Criar conta": abre slide para criar conta + 1º container
 * - Ação "Novo container": abre slide para criar container naquela conta
 * - Link/btn "Abrir": navega para a tela da container
 */
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [showAccSlide, setShowAccSlide] = useState(false);
  const [showCtSlideForAcc, setShowCtSlideForAcc] = useState(null); // account_id ou null

  async function load() {
    setLoading(true);
    try {
      const data = await listAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message || "Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Contas</h1>
        <button
          onClick={() => setShowAccSlide(true)}
          style={btnPrimary}
        >
          Criar conta
        </button>
      </div>

      {loading && <div style={{ opacity: .6 }}>Carregando…</div>}

      {!loading && accounts.map(acc => (
        <div key={acc.account_id} style={card}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            {acc.name} <span style={{ color: "#6b7280" }}>— {acc.account_id}</span>
          </div>

          {(acc.containers || []).length === 0 && (
            <div style={{ opacity: .7, fontStyle: "italic", marginBottom: 8 }}>
              Nenhum container ainda.
            </div>
          )}

          {(acc.containers || []).map(ct => (
            <div key={ct.container_id} style={row}>
              <div>
                <a
                  href={`/containers/${encodeURIComponent(ct.container_id)}`}
                  style={{ color: "#5b21b6", textDecoration: "none", fontWeight: 700 }}
                >
                  {ct.name}
                </a>{" "}
                — <span style={{ color: "#6b7280" }}>{ct.container_id}</span>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  Tipo: {ct.type} • v{ct.version}
                </div>
              </div>
              <button
                onClick={() => router.push(`/containers/${encodeURIComponent(ct.container_id)}`)}
                style={btnGhost}
              >
                Abrir
              </button>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setShowCtSlideForAcc(acc.account_id)}
              style={btnLight}
            >
              + Novo container
            </button>
          </div>
        </div>
      ))}

      {/* Slide: criar conta + primeiro container */}
      {showAccSlide && (
        <CreateAccountSlide
          onClose={() => setShowAccSlide(false)}
          onCreated={async ({ account, container }) => {
            // redireciona diretamente para a container criada
            setShowAccSlide(false);
            router.push(`/containers/${encodeURIComponent(container.container_id)}`);
          }}
        />
      )}

      {/* Slide: criar container extra em uma conta existente */}
      {showCtSlideForAcc && (
        <CreateContainerSlide
          accountId={showCtSlideForAcc}
          onClose={() => setShowCtSlideForAcc(null)}
          onCreated={(ct) => {
            setShowCtSlideForAcc(null);
            router.push(`/containers/${encodeURIComponent(ct.container_id)}`);
          }}
        />
      )}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  background: "#fff",
};

const row = {
  border: "1px solid #ede9fe",
  borderRadius: 10,
  padding: "10px 12px",
  margin: "8px 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#faf5ff",
};

const btnPrimary = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};

const btnGhost = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
};

const btnLight = {
  border: "1px dashed #c7d2fe",
  background: "#eef2ff",
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
};
