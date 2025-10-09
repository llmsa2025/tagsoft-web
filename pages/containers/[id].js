// pages/containers/[id].js
// Página do contêiner em tela cheia (sem menu lateral).
//
// - Botão Voltar => /accounts
// - Seletor de contêiner (placeholder por enquanto)
// - Tabs locais: overview/tags/acionadores/variáveis/pastas/modelos/versões/admin
//
// Comentários e rótulos em PT-BR; código em EN.

import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import STMLayout, { Card } from '../../components/STMLayout';
import { getContainer } from '../../lib/api'; // garante que o path está correto

const TABS = [
  { key:'overview',   label:'Visão geral' },
  { key:'tags',       label:'Tags' },
  { key:'triggers',   label:'Acionadores' },
  { key:'variables',  label:'Variáveis' },
  { key:'folders',    label:'Pastas' },
  { key:'models',     label:'Modelos' },
  { key:'versions',   label:'Versões' },
  { key:'admin',      label:'Administrador' },
];

export default function ContainerPage() {
  const router = useRouter();
  const { id, tab } = router.query;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeTab = useMemo(() => {
    const k = typeof tab === 'string' ? tab : 'overview';
    return TABS.some(t => t.key === k) ? k : 'overview';
  }, [tab]);

  // Carrega dados do contêiner
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getContainer(id);
        setItem(data);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Troca de aba (mantém a rota atual com ?tab=)
  const goTab = (k) => {
    router.replace({ pathname: `/containers/${id}`, query: { tab:k } }, undefined, { shallow:true });
  };

  return (
    <STMLayout active="containers" hideSidebar>
      {/* Toolbar superior */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <button
          onClick={()=>router.push('/accounts')}
          style={{
            padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff',
            cursor:'pointer'
          }}
          title="Voltar para Contas"
        >
          ← Voltar
        </button>

        {/* Seletor de contêiner (placeholder) */}
        <select
          value={id || ''}
          onChange={(e)=>router.push(`/containers/${e.target.value}?tab=${activeTab}`)}
          style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8, minWidth:260 }}
        >
          <option value={id || ''}>
            {item ? `${item.name} — ${item.type} • v${item.version}` : 'Carregando…'}
          </option>
          {/* No futuro: popular com outros contêineres da conta */}
        </select>

        {/* Busca local (placeholder) */}
        <input
          placeholder="Pesquisar…"
          style={{ flex:'1 1 260px', minWidth:260, padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8 }}
        />

        {/* Avatar do usuário (placeholder) */}
        <div style={{
          width:34, height:34, borderRadius:'50%', background:'#0f172a', color:'#fff',
          display:'grid', placeItems:'center', fontWeight:700
        }}>U</div>
      </div>

      {/* Tabs locais */}
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={()=>goTab(t.key)}
            style={{
              padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:8,
              background: activeTab === t.key ? '#0f172a' : '#fff',
              color: activeTab === t.key ? '#fff' : '#000', cursor:'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo principal */}
      <Card>
        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
        {!loading && !item && <div style={{ opacity:.6 }}>Contêiner não encontrado.</div>}

        {!loading && item && activeTab === 'overview' && (
          <div>
            <div style={{ fontWeight:800, marginBottom:12 }}>
              {item.name} — v{item.version}
            </div>
            <div><b>ID:</b> {item.container_id}</div>
            <div><b>Nome:</b> {item.name}</div>
            <div><b>Versão:</b> {item.version}</div>
            <div style={{ marginTop:12, fontWeight:700 }}>Resumo</div>
            <ul>
              <li><b>Variáveis:</b> {item.variables?.length || 0}</li>
              <li><b>Tags:</b> {item.tags?.length || 0}</li>
              <li><b>Acionadores:</b> {item.triggers?.length || 0}</li>
            </ul>
          </div>
        )}

        {!loading && item && activeTab !== 'overview' && (
          <div style={{ opacity:.8 }}>
            TODO: conteúdo da aba <b>{TABS.find(t=>t.key===activeTab)?.label}</b>.
          </div>
        )}
      </Card>
    </STMLayout>
  );
}
