// pages/containers/[id].js
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import STMLayout, { Card } from '../../components/STMLayout';
import { api } from '../../lib/api';

const EMPTY = {"container_id":"","name":"","version":1,"variables":[],"triggers":[],"tags":[]};

function TabBtn({ t, cur, set }) {
  const active = cur===t;
  return (
    <button onClick={()=>set(t)} style={{
      padding:'6px 10px', borderRadius:10, border:'1px solid #e5e7eb',
      background: active ? '#0f172a' : '#fff', color: active ? '#fff' : '#0f172a'
    }}>
      {t}
    </button>
  );
}

export default function ContainerDetail() {
  const { query } = useRouter();
  const cid = useMemo(() => query.id, [query.id]);

  const [tab, setTab] = useState('Visão geral');
  const [json, setJson] = useState(JSON.stringify(EMPTY));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isNew = cid === 'new';

  const load = async () => {
    if (isNew || !cid) { setJson(JSON.stringify({ ...EMPTY, container_id: '', name: '' })); return; }
    setLoading(true);
    try {
      const c = await api(`/v1/containers/${encodeURIComponent(cid)}`);
      setJson(JSON.stringify(c, null, 2));
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cid]);

  const save = async () => {
    let body = null;
    try { body = JSON.parse(json); } catch { return alert('JSON inválido.'); }
    if (!body.container_id || !body.name) return alert('Campos obrigatórios: "container_id" e "name".');
    setSaving(true);
    try {
      await api('/v1/containers', { method:'PUT', body: JSON.stringify(body) });
      alert('Container salvo!');
    } catch (e) {
      alert(e.message);
    } finally { setSaving(false); }
  };

  return (
    <STMLayout active="containers">
      <Card title={`Container ${isNew ? '(novo)' : cid || ''}`}
        right={<div style={{ display:'flex', gap:8 }}>
          {['Visão geral','Tags','Acionadores','Variáveis','Pastas','Modelos','Versões','Administrador'].map(t =>
            <TabBtn key={t} t={t} cur={tab} set={setTab} />
          )}
        </div>}
      >
        {tab === 'Visão geral' && (
          <>
            {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
            <textarea
              value={json}
              onChange={e=>setJson(e.target.value)}
              placeholder='{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}'
              style={{ width:'100%', height:280, fontFamily:'monospace', fontSize:12 }}
            />
            <div style={{ marginTop:8, display:'flex', gap:8 }}>
              <button onClick={save} disabled={saving} style={{ padding:'8px 12px', borderRadius:10, background:'#0f172a', color:'#fff', opacity: saving?0.7:1 }}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
              <button onClick={()=>setJson(JSON.stringify(EMPTY, null, 2))} style={{ padding:'8px 12px', borderRadius:10, background:'#eee' }}>
                Template
              </button>
            </div>
          </>
        )}

        {tab === 'Tags' && (
          <div style={{ opacity:.9 }}>
            <p>MVP: aqui listaremos/editaríamos as <b>tags</b> do container. Por enquanto, edite no JSON da aba “Visão geral”.</p>
          </div>
        )}

        {tab === 'Acionadores' && <p>MVP: cadastro/edição de <b>triggers</b> (condições).</p>}
        {tab === 'Variáveis'   && <p>MVP: cadastro/edição de <b>variáveis</b>.</p>}
        {tab === 'Pastas'      && <p>MVP: organização em <b>pastas</b>.</p>}
        {tab === 'Modelos'     && <p>MVP: <b>modelos de tag/variável</b> reutilizáveis.</p>}
        {tab === 'Versões'     && <p>MVP: histórico de <b>versões</b> do container.</p>}
        {tab === 'Administrador'&& <p>MVP: permissões, import/export, etc.</p>}
      </Card>
    </STMLayout>
  );
}
