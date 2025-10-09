// pages/containers/[id].js
// Detalhe da container em tela cheia (sem menu lateral).
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import STMLayout, { Card } from '../../components/STMLayout';
import { getContainer, listContainers } from '../../lib/api';

const TABS = [
  { key:'overview',  label:'Visão geral' },
  { key:'tags',      label:'Tags' },
  { key:'triggers',  label:'Acionadores' },
  { key:'variables', label:'Variáveis' },
  { key:'folders',   label:'Pastas' },
  { key:'models',    label:'Modelos' },
  { key:'versions',  label:'Versões' },
  { key:'admin',     label:'Administrador' },
];

export default function ContainerScreen() {
  const router = useRouter();
  const { id, tab } = router.query;

  const [container, setContainer] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentTab = useMemo(() => {
    const k = (tab || 'overview').toString();
    return TABS.find(t => t.key === k) ? k : 'overview';
  }, [tab]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [c, list] = await Promise.all([
          getContainer(id),
          listContainers()
        ]);
        if (mounted) { setContainer(c); setAll(list); }
      } catch (e) {
        alert(e.message || 'Falha ao carregar container');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  function goToTab(next) {
    router.replace(
      { pathname: `/containers/${encodeURIComponent(id)}`, query: { tab: next } },
      undefined,
      { shallow: true }
    );
  }

  return (
    <STMLayout active="containers" noSidebar>
      {/* Barra superior */}
      <div
        style={{
          display:'flex', gap:12, alignItems:'center',
          marginBottom:14, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12
        }}
      >
        <button
          onClick={() => router.push('/accounts')}
          style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #000', background:'#f1f5f9' }}
        >
          ← Voltar
        </button>

        <select
          value={container?.container_id || ''}
          onChange={(e) => router.push(`/containers/${encodeURIComponent(e.target.value)}?tab=${currentTab}`)}
          style={{ minWidth:280, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 }}
        >
          {all.map(c => (
            <option key={c.container_id} value={c.container_id}>
              {c.name} — {c.type} • v{c.version}
            </option>
          ))}
        </select>

        <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center' }}>
          <input
            placeholder="Pesquisar…"
            style={{ padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8, width:260 }}
          />
          <div
            style={{
              width:32, height:32, borderRadius:'9999px', background:'#0f172a',
              color:'#fff', display:'grid', placeItems:'center', fontWeight:700
            }}
          >
            U
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => goToTab(t.key)}
            style={{
              padding:'8px 12px', borderRadius:10, border:'1px solid #e5e7eb',
              background: currentTab === t.key ? '#0f172a' : '#fff',
              color: currentTab === t.key ? '#fff' : '#0f172a',
              fontWeight:500
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <Card title={container ? `${container.name} — v${container.version}` : 'Carregando…'}>
        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
        {!loading && !container && <div style={{ opacity:.6 }}>Contêiner não encontrado.</div>}

        {!!container && currentTab === 'overview' && (
          <div>
            <div><b>ID:</b> {container.container_id}</div>
            <div><b>Nome:</b> {container.name}</div>
            <div><b>Versão:</b> {container.version}</div>

            <h4 style={{ marginTop:12 }}>Resumo</h4>
            <ul>
              <li><b>Variáveis:</b> {container.variables?.length || 0}</li>
              <li><b>Tags:</b> {container.tags?.length || 0}</li>
              <li><b>Acionadores:</b> {container.triggers?.length || 0}</li>
            </ul>
          </div>
        )}

        {!!container && currentTab !== 'overview' && (
          <div style={{ opacity:.7 }}>
            <i>Em breve: conteúdo da aba “{TABS.find(t=>t.key===currentTab)?.label}”.</i>
          </div>
        )}
      </Card>
    </STMLayout>
  );
}
