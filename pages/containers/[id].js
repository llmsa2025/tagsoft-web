// pages/containers/[id].js
// Tela da Container com Topbar + Tabs horizontais.
// Comentários pt-BR.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import STMLayout, { Card } from '../../components/STMLayout';
import ContainerTopbar from '../../components/ContainerTopbar';
import { getContainer } from '../../lib/api';

const TABS = [
  { key:'overview',    label:'Visão geral' },
  { key:'tags',        label:'Tags' },
  { key:'triggers',    label:'Acionadores' },
  { key:'variables',   label:'Variáveis' },
  { key:'folders',     label:'Pastas' },
  { key:'models',      label:'Modelos' },
  { key:'versions',    label:'Versões' },
  { key:'admin',       label:'Administrador' },
];

export default function ContainerScreen() {
  const router = useRouter();
  const { id, tab } = router.query;
  const [ct, setCt] = useState(null);
  const activeTab = useMemo(
    () => (typeof tab === 'string' && TABS.find(t => t.key === tab)?.key) || 'overview',
    [tab]
  );

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getContainer(id);
        if (mounted) setCt(data);
      } catch (e) {
        alert(e.message || 'Erro ao carregar container');
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const goTab = (k) => {
    router.replace({ pathname: `/containers/${id}`, query: { tab: k } }, undefined, { shallow:true });
  };

  return (
    <STMLayout active="containers">
      {/* Topbar estilo GTM com dropdown */}
      <ContainerTopbar activeId={id} />

      <Card title={ct ? `${ct.name} — v${ct.version}` : 'Carregando…'}>
        {/* Tabs horizontais */}
        <div style={{ display:'flex', gap:8, borderBottom:'1px solid #eee', marginBottom:12 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={()=>goTab(t.key)}
              style={{
                padding:'8px 12px',
                border:'1px solid #eee',
                borderBottom: activeTab===t.key ? '2px solid #111' : '1px solid #eee',
                borderRadius:8,
                background: activeTab===t.key ? '#f8fafc' : '#fff',
                cursor:'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo por aba (placeholders por enquanto) */}
        {!ct && <div style={{ opacity:.6 }}>Carregando container…</div>}
        {ct && activeTab === 'overview' && (
          <div>
            <div><b>ID:</b> {ct.container_id}</div>
            <div><b>Nome:</b> {ct.name}</div>
            <div><b>Versão:</b> {ct.version}</div>
            <div style={{ marginTop:10 }}>
              <b>Resumo</b>
              <ul>
                <li>Variáveis: {ct.variables?.length || 0}</li>
                <li>Tags: {ct.tags?.length || 0}</li>
                <li>Acionadores: {ct.triggers?.length || 0}</li>
              </ul>
            </div>
          </div>
        )}

        {ct && activeTab === 'tags' && (
          <div>Em breve: gerenciamento de Tags aqui.</div>
        )}
        {ct && activeTab === 'triggers' && (
          <div>Em breve: gerenciamento de Acionadores aqui.</div>
        )}
        {ct && activeTab === 'variables' && (
          <div>Em breve: Variáveis (incorporadas + definidas pelo usuário).</div>
        )}
        {ct && activeTab === 'folders' && <div>Em breve: Pastas.</div>}
        {ct && activeTab === 'models' && <div>Em breve: Modelos (galeria desativada por enquanto).</div>}
        {ct && activeTab === 'versions' && <div>Em breve: Versões.</div>}
        {ct && activeTab === 'admin' && <div>Em breve: Administração da container.</div>}
      </Card>
    </STMLayout>
  );
}
