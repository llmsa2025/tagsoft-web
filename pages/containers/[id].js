// pages/containers/[id].js
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  getContainer,
  listContainers,
} from '../../lib/api';

const TABS = [
  { key:'overview', label:'Visão geral' },
  { key:'tags', label:'Tags' },
  { key:'triggers', label:'Acionadores' },
  { key:'variables', label:'Variáveis' },
  { key:'folders', label:'Pastas' },
  { key:'templates', label:'Modelos' },
  { key:'versions', label:'Versões' },
  { key:'admin', label:'Administrador' },
];

export default function ContainerView() {
  const router = useRouter();
  const { id, tab } = router.query;

  const [loading, setLoading] = useState(true);
  const [container, setContainer] = useState(null);
  const [others, setOthers] = useState([]); // containers da mesma conta

  const currentTab = useMemo(() => {
    const k = typeof tab === 'string' ? tab : 'overview';
    return TABS.find(t => t.key === k) ? k : 'overview';
  }, [tab]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const c = await getContainer(id);
        setContainer(c);

        // carrega lista para o dropdown (mesma conta)
        if (c?.account_id) {
          const cs = await listContainers({ account_id: c.account_id });
          setOthers(cs || []);
        } else {
          setOthers([]);
        }
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function goTab(k) {
    router.push(`/containers/${id}?tab=${k}`);
  }

  function goBack() {
    // volta para a home de contas (a “grande”)
    router.push('/accounts');
  }

  function onChangeContainer(e) {
    const nextId = e.target.value;
    if (nextId) {
      router.push(`/containers/${nextId}?tab=overview`);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Barra superior (sem menu lateral) */}
      <div style={{
        display:'grid', gridTemplateColumns:'120px 1fr 320px 40px', gap:12,
        alignItems:'center', marginBottom:14
      }}>
        <button onClick={goBack}
          style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb' }}>
          ← Voltar
        </button>

        <select value={container?.container_id || ''} onChange={onChangeContainer}
                style={{ padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}>
          {(others || []).map(c => (
            <option key={c.container_id} value={c.container_id}>
              {c.name} — {c.type} • v{c.version || 1}
            </option>
          ))}
        </select>

        <input placeholder="Pesquisar…"
               style={{ padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }} />

        <div style={{ width:36, height:36, borderRadius:'50%', background:'#111827', color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          U
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key}
                  onClick={()=>goTab(t.key)}
                  style={{
                    padding:'8px 10px', borderRadius:8,
                    border: currentTab===t.key ? '1px solid #a78bfa' : '1px solid #e5e7eb',
                    background: currentTab===t.key ? '#ede9fe' : '#fff'
                  }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da Tab */}
      <div style={{ border:'1px solid #eee', borderRadius:12, padding:16, background:'#fff' }}>
        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}

        {!loading && currentTab === 'overview' && container && (
          <Overview c={container} />
        )}

        {!loading && currentTab !== 'overview' && (
          <div style={{ opacity:.65 }}>Tela “{TABS.find(t=>t.key===currentTab)?.label}” pronta para implementações.</div>
        )}
      </div>
    </div>
  );
}

function Overview({ c }) {
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:20, marginBottom:8 }}>
        {c.name} — v{c.version || 1}
      </div>
      <div style={{ marginBottom:10 }}>
        <div><b>ID:</b> {c.container_id}</div>
        <div><b>Nome:</b> {c.name}</div>
        <div><b>Versão:</b> {c.version || 1}</div>
      </div>
      <div>
        <div style={{ fontWeight:700, marginBottom:6 }}>Resumo</div>
        <ul style={{ margin:'0 0 0 18px', padding:0 }}>
          <li>Variáveis: {c.variables?.length || 0}</li>
          <li>Tags: {c.tags?.length || 0}</li>
          <li>Acionadores: {c.triggers?.length || 0}</li>
        </ul>
      </div>
    </div>
  );
}
