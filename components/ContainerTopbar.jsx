// components/ContainerTopbar.jsx
// Topbar da tela de Container (com dropdown para trocar de container)
// Labels pt-BR, código em inglês.

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { listContainers, getContainer } from '../lib/api';

export default function ContainerTopbar({ activeId }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(null);
  const [search, setSearch] = useState('');

  // Carrega lista de containers + container atual
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [all, cur] = await Promise.all([
          listContainers(),          // opcional: passe account_id se quiser filtrar
          getContainer(activeId),
        ]);
        if (!mounted) return;
        setItems(all);
        setCurrent(cur);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => (mounted = false);
  }, [activeId]);

  const handleChange = (e) => {
    const id = e.target.value;
    if (!id) return;
    router.push(`/containers/${encodeURIComponent(id)}`);
  };

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'10px 12px', borderRadius:12, border:'1px solid #eee',
      background:'#fff', marginBottom:12
    }}>
      {/* Voltar para Contas/Containers */}
      <Link href="/containers" style={{ textDecoration:'none', padding:'6px 10px', borderRadius:8, background:'#f5f5f5' }}>
        ← Voltar
      </Link>

      {/* Dropdown de containers */}
      <select
        aria-label="Selecionar container"
        value={current?.container_id || activeId}
        onChange={handleChange}
        style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', minWidth:260 }}
      >
        {items.map(ct => (
          <option key={ct.container_id} value={ct.container_id}>
            {ct.name} — {ct.type} • v{ct.version}
          </option>
        ))}
      </select>

      {/* Espaço flexível */}
      <div style={{ flex:1 }} />

      {/* Campo de busca (placeholder) */}
      <input
        aria-label="Pesquisar na container"
        placeholder="Pesquisar…"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #ddd', width:260 }}
      />

      {/* Avatar / usuário (placeholder) */}
      <div
        title="Minha conta"
        style={{
          width:32, height:32, borderRadius:'50%', background:'#111', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:12
        }}
      >
        U
      </div>
    </div>
  );
}
