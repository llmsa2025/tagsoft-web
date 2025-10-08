import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'DEMO_KEY';

async function api(path, opts={}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'x-api-key': API_KEY, 'content-type':'application/json', ...(opts.headers||{}) },
    cache: 'no-store',
  });
  return res.json();
}

export default function Home() {
  const [tab, setTab] = useState('param');
  const [containers, setContainers] = useState([]);
  const [json, setJson] = useState('');
  const [overview, setOverview] = useState(null);
  const [prompt, setPrompt] = useState('Mostre os 3 eventos mais frequentes.');
  const [answer, setAnswer] = useState('');

  useEffect(() => { if (tab==='indicadores') refreshOverview(); }, [tab]);
  const refreshOverview = async () => setOverview(await api('/v1/analytics/overview'));

  const load = async () => setContainers(await api('/v1/containers'));
  useEffect(() => { if (tab==='param') load(); }, [tab]);

  const save = async () => {
    try { const body = JSON.parse(json || '{}'); await api('/v1/containers', { method:'PUT', body: JSON.stringify(body) }); alert('Salvo!'); setJson(''); load(); }
    catch(e){ alert(e.message); }
  };

  const runAnalysis = async () => {
    const r = await api('/v1/analysis/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
    setAnswer(r.answer || JSON.stringify(r));
  };

  return (
    <main style={{padding:'24px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto'}}>
      <h1 style={{fontWeight:700}}>TagSoft — STM v1.0 (MVP)</h1>
      <div style={{display:'flex', gap:'8px', margin:'16px 0'}}>
        {['param','analise','indicadores'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 12px', borderRadius:12, border:'1px solid #ddd', background: tab===t?'#111':'#fff', color: tab===t?'#fff':'#111'}}>
            {t==='param'?'Parametrização':t==='analise'?'Análises (IA)':'Indicadores'}
          </button>
        ))}
      </div>

      {tab==='param' && (
        <section style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{background:'#fff', padding:16, borderRadius:16, border:'1px solid #eee'}}>
            <h3>Containers</h3>
            <ul>
            {containers.map(c => (
              <li key={c.container_id} style={{background:'#f6f6f6', padding:8, borderRadius:8, marginTop:8}}>
                <b>{c.name}</b> v{c.version} — <code>{c.container_id}</code>
              </li>
            ))}
            {containers.length===0 && <li style={{opacity:.6}}>Nenhum container ainda.</li>}
            </ul>
          </div>
          <div style={{background:'#fff', padding:16, borderRadius:16, border:'1px solid #eee'}}>
            <h3>Novo/Editar Container (JSON)</h3>
            <textarea value={json} onChange={e=>setJson(e.target.value)} placeholder='{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}' style={{width:'100%', height:220, fontFamily:'monospace', fontSize:12}} />
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <button onClick={save} style={{padding:'8px 12px', borderRadius:12, background:'#111', color:'#fff'}}>Salvar</button>
              <button onClick={()=>setJson('{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}')} style={{padding:'8px 12px', borderRadius:12, background:'#eee'}}>Template</button>
            </div>
          </div>
        </section>
      )}

      {tab==='analise' && (
        <section style={{background:'#fff', padding:16, borderRadius:16, border:'1px solid #eee'}}>
          <h3>Análises (Copiloto IA)</h3>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:120}} />
          <div><button onClick={runAnalysis} style={{marginTop:8, padding:'8px 12px', borderRadius:12, background:'#111', color:'#fff'}}>Gerar Análise</button></div>
          <pre style={{marginTop:12, background:'#f6f6f6', padding:12, borderRadius:8, overflowX:'auto'}}>{answer || '—'}</pre>
        </section>
      )}

      {tab==='indicadores' && (
        <section style={{background:'#fff', padding:16, borderRadius:16, border:'1px solid #eee'}}>
          <h3>Indicadores</h3>
          {!overview && <div style={{opacity:.6}}>Carregando…</div>}
          {overview && (
            <div>
              <div>Total de eventos: <b>{overview.total_events}</b></div>
              <div>Últimas 24h: <b>{overview.last24h}</b></div>
              <div style={{marginTop:8}}>
                <b>Por evento</b>
                <ul>
                {Object.entries(overview.by_event || {}).map(([k,v]) => (
                  <li key={k}>{k}: <b>{v}</b></li>
                ))}
                </ul>
              </div>
              <div style={{marginTop:12}}>
                <button onClick={refreshOverview} style={{padding:'6px 10px', borderRadius:10, background:'#eee'}}>Atualizar</button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
