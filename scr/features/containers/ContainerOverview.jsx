// src/features/containers/ContainerOverview.jsx
/**
 * Overview simplificado — apenas placeholder de contagens.
 * Você pode conectar ao endpoint de analytics conforme evoluirmos.
 */
export default function ContainerOverview({ container }) {
  return (
    <div style={panel}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
        {container?.name} — v{container?.version}
      </div>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        ID: {container?.container_id} • Tipo: {container?.type}
      </div>

      <div style={{ fontWeight: 700, marginBottom: 6 }}>Resumo</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li>Variáveis: 0</li>
        <li>Tags: 0</li>
        <li>Acionadores: 0</li>
      </ul>
    </div>
  );
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};
