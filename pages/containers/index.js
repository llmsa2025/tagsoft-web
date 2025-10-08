// pages/containers/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import STMLayout, { Card } from '../../components/STMLayout';
import { api } from '../../lib/api';

export default function ContainersList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api('/v1/containers');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      alert('Erro ao carregar containers: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <STMLayout active="containers">
      <Card
        title="Containers"
        right={
          // esta rota /containers/new pode ser criada depois
          <Link href="/containers/new" style={{ padding: '6px 10px', borderRadius: 8, background: '#eef2ff', textDecoration: 'none' }}>
            + Novo
          </Link>
        }
      >
        {loading && <div style={{ opacity: 0.6 }}>Carregando…</div>}
        {!loading && items.length === 0 && <div style={{ opacity: 0.6 }}>Nenhum container ainda.</div>}

        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((c) => (
            <li key={c.container_id} style={{ marginTop: 6 }}>
              <Link href={`/containers/${encodeURIComponent(c.container_id)}`} style={{ textDecoration: 'none' }}>
                <b>{c.name}</b> v{c.version} — <code>{c.container_id}</code>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </STMLayout>
  );
}
