// src/features/accounts/CreateAccountSlide.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { upsertAccount, upsertContainer } from "@/lib/api";

/**
 * Slide lateral para criar uma nova conta e o 1º container.
 */
export default function CreateAccountSlide({ onClose, onCreated }) {
  const router = useRouter();
  const [name, setName] = useState("Minha empresa");
  const [containerName, setContainerName] = useState("Minha Container");
  const [type, setType] = useState("web");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const account_id = `acc_${Math.random().toString(36).slice(2, 8)}`;
      await upsertAccount({ account_id, name });

      const container_id = `ct_${Math.random().toString(36).slice(2, 10)}`;
      await upsertContainer({
        container_id,
        name: containerName,
        account_id,
        type, // 'web' | 'server'
        version: 1,
      });

      onCreated?.({
        account: { account_id, name },
        container: { container_id, name: containerName, account_id, type, version: 1 },
      });
    } catch (e) {
      alert(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside style={slideRoot}>
      <div style={slidePanel}>
        <div style={slideHeader}>
          <b>Nova conta / contêiner</b>
          <button onClick={onClose} style={iconBtn}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={label}>
            Nome da conta
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={input}
              placeholder="Ex.: Minha empresa"
            />
          </label>

          <label style={label}>
            Nome do contêiner
            <input
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              style={input}
              placeholder="Ex.: Site principal"
            />
          </label>

          <label style={label}>
            Tipo do contêiner
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={input}
            >
              <option value="web">Web</option>
              <option value="server">Server</option>
            </select>
          </label>
        </div>

        <div style={slideFooter}>
          <button onClick={onClose} style={btnGhost}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </aside>
  );
}

const slideRoot = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.25)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 50,
};

const slidePanel = {
  width: 420,
  background: "#fff",
  height: "100%",
  padding: 20,
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: 16,
  boxShadow: "-8px 0 20px rgba(0,0,0,.08)",
};

const slideHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const iconBtn = {
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const label = { display: "grid", gap: 6, fontWeight: 600, color: "#111827" };
const input = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "10px 12px",
};

const slideFooter = { display: "flex", justifyContent: "flex-end", gap: 8 };
const btnGhost = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
};
const btnPrimary = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
};
