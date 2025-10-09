// src/features/containers/ContainerTabs.jsx
/**
 * Abas de navegação dentro da container.
 * A navegação é externa (pai controla a URL), então aqui apenas renderizamos os botões.
 */
export default function ContainerTabs({ tabs, active, onChange }) {
  return (
    <div style={tabsWrap}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange?.(t.key)}
          style={{ ...tabBtn, ...(active === t.key ? tabBtnActive : {}) }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

const tabsWrap = { display: "flex", gap: 8, marginTop: 12 };
const tabBtn = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
};
const tabBtnActive = {
  background: "#111827",
  color: "#fff",
  borderColor: "#111827",
};
