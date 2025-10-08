// pages/containers/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ContainerLayout, { Card } from '../../components/ContainerLayout';
import { api } from '../../lib/api';

const EMPTY = {"container_id":"","name":"","version":1,"variables":[],"triggers":[],"tags":[],"folders":[],"models":[]};

export default function ContainerOverview() {
  const { query } = useRouter();
  const cid = query.id;
  const isNew = cid === 'new';

  const [json, setJson] = useState(JSON.stringify(EMPTY, null, 2));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cid) return;
    if (isNew) { setJson(JSON.stringify(EMPTY, null, 2)); return; }
    (async () => {
      setLoading(true);
      try { const c = await api(`/v1/containers/${encodeURIComponent(cid)}`); setJson(JSON.stringify({folders:[],models:[],...c}, null, 2)); }
      catch (e) { alert(e.message); }
      finally { setLoading(false); }
    })();
  }, [cid, isNew]);

  const save = async () => {
    let body; try { body = JSON.parse(json); } catch { return alert('JSON inválido.'); }
    if (!body.container_id || !body.name) return alert('Precisa de "container_id" e "name".');
    setSaving(true);
    try { await api('/v1/containers', { method:'PUT', body: JSON.stringify(body) }); alert('Salvo!'); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ContainerLayout cid={cid} active="overview">
      <Card title={`Container ${isNew ? '(novo)' : cid}`}>
        {loading && <div style={{opacity:.6}}>Carregando…</div>}
        <textarea value={json} onChange={e=>setJson(e.target.value)} style={{ width:'100%', height:340, fontFamily:'monospace', fontSize:12 }} />
        <div style={{ marginTop:8, display:'flex', gap:8 }}>
          <button onClick={save} disabled={saving} style={{ padding:'8px 12px', borderRadius:10, background:'#0f172a', color:'#fff', opacity:saving?0.7:1 }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button onClick={()=>setJson(JSON.stringify(EMPTY, null, 2))} style={{ padding:'8px 12px', borderRadius:10, background:'#eee' }}>Template</button>
        </div>
      </Card>
    </ContainerLayout>
  );
}
