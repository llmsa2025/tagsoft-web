// src/features/containers/ContainerHeader.jsx
/**
 * Cabeçalho dentro do ambiente da container
 * - Botão voltar
 * - Dropdown para escolher container
 * - Campo de busca (somente UI)
 * - Avatar placeholder
 */
export default function ContainerHeader({
  containers = [],
  currentContainer,
  onBack,
  onSelectContainer,
}) {
  return (
    <div style={header}>
      <button onClick={onBack} style={btnBack}>← Voltar</button>

      <select
        value={currentContainer?.container_id || ""}
        onChange={(e) => onSelectContainer?.(e.target.value)}
        style={select}
      >
        {containers.map(ct => (
          <option key={ct.container_id} value={ct.container_id}>
            {ct.name} — {ct.type} • v{ct.version}
          </option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      <input placeholder="Pesquisar…" style={search} />
      <div style={avatar}>U</div>
    </div>
  );
}

const header = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};

const btnBack = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
};

const select = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "8px 10px",
  minWidth: 260,
};

const search = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "8px 10px",
  minWidth: 240,
};

const avatar = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "#111827",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};
