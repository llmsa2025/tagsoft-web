export default function ContainerOverview({ container }) {
  return (
    <div style={{ border:'1px solid #eee', borderRadius:12, padding:16, background:'#fff' }}>
      <h2 style={{ marginTop:0 }}>Minha Container — v{container?.version}</h2>
      <div style={{ marginTop:6 }}>
        <div><b>ID:</b> {container?.container_id}</div>
        <div><b>Nome:</b> {container?.name}</div>
        <div><b>Versão:</b> {container?.version}</div>
      </div>

      <div style={{ marginTop:14 }}>
        <b>Resumo</b>
        <ul>
          <li>Variáveis: 0</li>
          <li>Tags: 0</li>
          <li>Acionadores: 0</li>
        </ul>
      </div>
    </div>
  );
}
