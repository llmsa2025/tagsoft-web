import { useRouter } from 'next/router';

/** Cabeçalho do contêiner (voltar, dropdown, busca, avatar fake) */
export default function ContainerHeader({ container }) {
  const router = useRouter();

  return (
    <div style={{
      display:'flex', gap:10, alignItems:'center', padding:8,
      border:'1px solid #eee', borderRadius:12, background:'#fff'
    }}>
      <button onClick={()=>router.push('/')}
              style={{ padding:'6px 10px', borderRadius:10, background:'#f3f4f6', border:'1px solid #e5e7eb' }}>
        ← Voltar
      </button>

      <select
        value={container?.name ? `${container.name} — ${container.type} • v${container.version}` : ''}
        onChange={()=>{}}
        style={{ padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:10, minWidth:260 }}
      >
        <option>{container?.name} — {container?.type} • v{container?.version}</option>
      </select>

      <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
        <input placeholder="Pesquisar…" style={{ padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:10, width:240 }}/>
        <div style={{
          width:32, height:32, borderRadius:'50%', background:'#111827', color:'#fff',
          display:'grid', placeItems:'center', fontSize:12
        }}>U</div>
      </div>
    </div>
  );
}
