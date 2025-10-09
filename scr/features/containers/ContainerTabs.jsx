export default function ContainerTabs({ active='overview', onChange }) {
  const tabs = [
    { id:'overview', label:'Visão geral' },
    { id:'tags',      label:'Tags' },
    { id:'triggers',  label:'Acionadores' },
    { id:'vars',      label:'Variáveis' },
    { id:'folders',   label:'Pastas' },
    { id:'templates', label:'Modelos' },
    { id:'versions',  label:'Versões' },
    { id:'admin',     label:'Administrador' },
  ];
  return (
    <div style={{ display:'flex', gap:8, margin:'10px 0 14px' }}>
      {tabs.map(t => (
        <button key={t.id}
          onClick={()=>onChange?.(t.id)}
          style={{
            padding:'6px 10px', borderRadius:10,
            border: active===t.id ? '1px solid #a78bfa' : '1px solid #e5e7eb',
            background: active===t.id ? '#ede9fe' : '#fff'
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
