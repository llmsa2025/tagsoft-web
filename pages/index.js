// pages/containers/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import STMLayout, { Card } from '../../components/STMLayout'; // ajuste para "../../components/STMLayout" se sua pasta for "components"
import { api } from '../../lib/api';

export default function ContainersIndex() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal "Novo"
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ container_id: '', name: '', version: 1 });

  const load = async () => {
    setLoading(true);
    try { setItems(await api('/v1/containers')); }
    catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveNew = async () => {
    if (!form.container_id || !form.name) {
      alert('Preencha ID e Nome do container.');
      return;
    }
    setSaving(true);
    try {
      await api('/v1/containers', { method: 'PUT', body: JSON.stringify(form) });
      setShowNew(false);
      setForm({ container_id: '', name: '', version: 1 });
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <STMLayout active="containers">
      <Card
        title="Containers"
        right={
          <button
            onClick={() => setShowNew(true)}
            style={{ padding: '6px 10px', borderRadius: 8, background: '#eef2ff' }}
          >
            + Novo
          </button>
        }
      >
        {loading && <div style={{ opacity: .6 }}>Carregando…</div>}
        {!loading && items.length === 0 && <div style={{ opacity: .6 }}>Nenhum container ainda.</div>}

        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map(c => (
            <li key={c.container_id} style={{ marginTop: 6 }}>
              <Link href={`/containers/${encodeURIComponent(c.container_id)}`} style={{ textDecoration: 'none' }}>
                <b>{c.name}</b> v{c.version} — <code>{c.container_id}</code>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {showNew && (
        <div
          onClick={() => setShowNew(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: '94vw', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Novo container</h3>
              <button onClick={() => setShowNew(false)} style={{ borderRadius: 8, padding: '6px 10px' }}>Fechar</button>
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <label>ID do container</label>
              <input
                value={form.container_id}
                onChange={(e) => setForm({ ...form, container_id: e.target.value.trim() })}
                placeholder="ex.: ct_demo"
              />

              <label>Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ex.: Demo"
              />

              <label>Versão</label>
              <input
                type="number"
                min={1}
                value={form.version}
                onChange={(e) => setForm({ ...form, version: Number(e.target.value || 1) })}
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={saveNew}
                  disabled={saving}
                  style={{ padding: '8px 12px', borderRadius: 10, background: '#0f172a', color: '#fff', opacity: saving ? .7 : 1 }}
                >
                  {saving ? 'Salvando…' : 'Criar'}
                </button>
                <button
                  onClick={() => setForm({ container_id: 'ct_demo', name: 'Demo', version: 1 })}
                  style={{ padding: '8px 12px', borderRadius: 10, background: '#eee' }}
                >
                  Usar template
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: .75 }}>
              Dica: após criar, clique no item da lista para abrir a <b>Visão geral</b> do container.
            </div>
          </div>
        </div>
      )}
    </STMLayout>
  );
}
