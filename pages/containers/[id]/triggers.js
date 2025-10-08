import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ContainerLayout, { Card } from '../../../components/ContainerLayout';
import { api } from '../../../lib/api';

export default function Triggers() {
  const { query } = useRouter();
  const cid = query.id;
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id:'tr_'+Date.now(), name:'Novo acionador', expr:"event == 'page_view'" });

  const load = async () => {
    setLoading(true);
    try { const data = await api(`/v1/containers/${encodeURIComponent(cid)}`); setC({ folders:[], models:[], ...data }); }
    catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (cid) load(); }, [cid]);

  const add = () => {
    const t = { id: form.id, name: form.name, conditions: [{ expr: form.expr }] };
    const next = { ...(c||{}), triggers: [...(c?.triggers||[]), t] };
    setC(next);
  };

  const save = async () => {
    setSaving(true);
    try { await api('/v1/containers', { method:'PUT', body: JSON.stringify(c) }); alert('Salvo!'); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ContainerLayout cid={cid} active="triggers">
      <Card title="Acionadores" right={<button onClick={save} disabled={saving} style={{ padding:'6px 10px', borderRadius:10, background:'#0f172a', color:'#fff', opacity:saving?0.7:1 }}>{saving?'Salvando…':'Salvar alterações'}</button>}>
        {loading && <div style={{opacity:.6}}>Carregando…</div>}
        {!loading && c && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <h4>Novo</h4>
              <div style={{ display:'grid', gap:8 }}>
                <input value={form.id} onChange={e=>setForm({...form,id:e.target.value})} placeholder="id" />
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="nome" />
                <input value={form.expr} onChange={e=>setForm({...form,expr:e.target.value})} placeholder="expressão (ex: event == 'page_view')" />
                <button onClick={add} style={{ padding:'6px 10px', borderRadius:10, background:'#e0f2fe' }}>+ Adicionar</button>
              </div>
            </div>
            <div>
              <h4>Existentes</h4>
              <pre style={{ background:'#f8fafc', padding:12, borderRadius:8, overflowX:'auto' }}>{JSON.stringify(c.triggers||[], null, 2)}</pre>
            </div>
          </div>
        )}
      </Card>
    </ContainerLayout>
  );
}
