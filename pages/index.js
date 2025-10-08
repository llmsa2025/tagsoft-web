import { useEffect, useMemo, useState } from 'react';

/* ------------ Utils de URL/ENV ------------ */
function normalizeBaseUrl(u) {
  const s = (u || '').trim();
  if (!s) return 'http://localhost:8787';
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  return withProto.replace(/\/+$/, '');
}
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
const API_URL = normalizeBaseUrl(RAW_API_URL);
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'DEMO_KEY';

/* ------------ Health sem headers (evita preflight) ------------ */
async function health() {
  const url = `${API_URL}/v1/health`;
  const res = await fetch(url, { cache: 'no-store' });
  const txt = await res.text();
  try { return JSON.parse(txt); }
  catch { throw new Error(`Health não-JSON em ${url}: ${txt?.slice(0,120)}`); }
}

/* ------------ Helper de API (x-api-key auto, content-type só com body) ------------ */
async function api(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const headers = { 'x-api-key': API_KEY, ...(opts.headers || {}) };
  if (opts.body && !headers['content-type']) headers['content-type'] = 'application/json';

  const res = await fetch(url, { ...opts, headers, cache: 'no-store' });
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!ct.includes('application/json')) {
    throw new Error(`Resposta não-JSON da API em ${url}. Verifique NEXT_PUBLIC_API_URL (atual: ${API_URL}). Conteúdo: ${text?.slice(0,120)}`);
  }
  let data = null;
  try { data = text ? JSON.parse(text) : null; }
  catch { throw new Error(`JSON inválido da API em ${url}: ${text?.slice(0,120)}`); }

  if (!res.ok || (data && data.error)) {
    const msg = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

/* ------------ App ------------ */
export default function Home() {
  // Navegação estilo GTM (sidebar)
  const [nav, setNav] = useState('overview'); // overview | tags | triggers | vars | analysis | indicadores

  // Status API
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiError, setApiError] = useState('');

  // Dados de container
  const [containers, setContainers] = useState([]);
  const [json, setJson] = useState('{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}');
  const [saving, setSaving] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState(false);

  // Análises
  const [prompt, setPrompt] = useState('Mostre os 3 eventos mais frequentes.');
  const [answer, setAnswer] = useState('');
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  // Indicadores
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const apiInfo = useMemo(() => ({ API_URL, API_KEY_MASKED: mask(API_KEY) }), []);

  /* Checagem de saúde da API */
  useEffect(() => {
    (async () => {
      try { await health(); setApiHealthy(true); setApiError(''); }
      catch (e) { setApiHealthy(false); setApiError(e.message); }
    })();
  }, []);

  /* Carrega containers quando entra em “Visão geral” */
  useEffect(() => {
    if (nav !== 'overview') return;
    (async () => {
      setLoadingContainers(true);
      try {
        const list = await api('/v1/containers');
        setContainers(Array.isArray(list) ? list : []);
      } catch (e) {
        toast(e.message);
      } finally { setLoadingContainers(false); }
    })();
  }, [nav]);

  /* Indicadores: carrega ao entrar e auto-refresh a cada 10s */
  useEffect(() => {
    if (nav !== 'indicadores') return;
    const load = async () => {
      setLoadingOverview(true);
      try { setOverview(await api('/v1/analytics/overview')); }
      catch (e) { toast(e.message); }
      finally { setLoadingOverview(false); }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [nav]);

  /* Ações */
  const refreshOverview = async () => {
    setLoadingOverview(true);
    try { setOverview(await api('/v1/analytics/overview')); }
    catch (e) { toast(e.message); }
    finally { setLoadingOverview(false); }
  };

  const saveContainer = async () => {
    if (!json?.trim()) return toast('Preencha o JSON do container.');
    let body = null;
    try { body = JSON.parse(json); } catch { return toast('JSON inválido. Verifique vírgulas, aspas e chaves.'); }
    if (!body.container_id || !body.name) return toast('Campos obrigatórios: "container_id" e "name".');

    setSaving(true);
    try {
      await api('/v1/containers', { method: 'PUT', body: JSON.stringify(body) });
      toast('Container salvo com sucesso!');
      setJson('');
      const list = await api('/v1/containers');
      setContainers(Array.isArray(list) ? list : []);
    } catch (e) {
      toast(e.message);
    } finally { setSaving(false); }
  };

  const runAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const r = await api('/v1/analysis/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
      setAnswer(r.answer || JSON.stringify(r, null, 2));
    } catch (e) {
      toast(e.message);
    } finally { setRunningAnalysis(false); }
  };

  /* ------- UI ------- */
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#0f172a' }}>
      {/* Topbar */}
      <header style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#111' }} />
          <div>
            <div style={{ fontWeight: 700 }}>TagSoft — STM v1.0</div>
            <div style={{ fontSize: 12, opacity: .7 }}>Workspace: Default</div>
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          API: <code>{apiInfo.API_URL}</code> — key: <code>{apiInfo.API_KEY_MASKED}</code> — status:{' '}
          {apiHealthy === null ? 'checando…' : apiHealthy ? '🟢 online' : '🔴 offline'}
          {!apiHealthy && apiError ? <span style={{ color: '#b00' }}> — {apiError}</span> : null}
        </div>
      </header>

      {/* Layout 2 colunas: sidebar + conteúdo */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {/* Sidebar estilo GTM */}
        <aside style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 8 }}>
          <NavItem label="Visão geral"    active={nav==='overview'}   onClick={()=>setNav('overview')}   icon="📋" />
          <NavItem label="Tags"           active={nav==='tags'}       onClick={()=>setNav('tags')}       icon="🏷️" />
          <NavItem label="Acionadores"    active={nav==='triggers'}   onClick={()=>setNav('triggers')}   icon="⏱️" />
          <NavItem label="Variáveis"      active={nav==='vars'}       onClick={()=>setNav('vars')}       icon="🔗" />
          <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '8px 0' }} />
          <NavItem label="Análises (IA)"  active={nav==='analysis'}   onClick={()=>setNav('analysis')}   icon="🤖" />
          <NavItem label="Indicadores"    active={nav==='indicadores'}onClick={()=>setNav('indicadores')}icon="📈" />
        </aside>

        {/* Conteúdo principal */}
        <main>
          {nav === 'overview'    && <Overview containers={containers} loading={loadingContainers} json={json} setJson={setJson} onSave={saveContainer} />}
          {nav === 'tags'        && <TagsEditor json={json} setJson={setJson} />}
          {nav === 'triggers'    && <TriggersEditor json={json} setJson={setJson} />}
          {nav === 'vars'        && <VarsEditor json={json} setJson={setJson} />}
          {nav === 'analysis'    && <Analysis prompt={prompt} setPrompt={setPrompt} answer={answer} running={runningAnalysis} onRun={runAnalysis} />}
          {nav === 'indicadores' && <Indicators data={overview} loading={loadingOverview} onRefresh={refreshOverview} />}
        </main>
      </div>
    </div>
  );
}

/* ------------ Componentes de UI ------------ */

function NavItem({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 10, border: '1px solid transparent',
        background: active ? '#0f172a' : 'transparent',
        color: active ? '#fff' : '#0f172a',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Card({ title, children, right }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ------------ Seções ------------ */

function Overview({ containers, loading, json, setJson, onSave }) {
  return (
    <>
      <Card title="Containers">
        {loading && <div style={{ opacity: .6 }}>Carregando…</div>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {containers.map((c) => (
            <li key={c.container_id} style={{ marginTop: 6 }}>
              <b>{c.name}</b> v{c.version} — <code>{c.container_id}</code>
            </li>
          ))}
          {!loading && containers.length === 0 && <li style={{ opacity: .6 }}>Nenhum container ainda.</li>}
        </ul>
      </Card>

      <Card
        title="Novo/Editar Container (JSON)"
        right={
          <button onClick={() => setJson('{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}') }
                  style={{ padding: '6px 10px', borderRadius: 8, background: '#eef2ff' }}>
            Template
          </button>
        }
      >
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}'
          style={{ width: '100%', height: 240, fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={onSave} style={{ padding: '8px 12px', borderRadius: 10, background: '#0f172a', color: '#fff' }}>Salvar</button>
        </div>
      </Card>
    </>
  );
}

function TagsEditor({ json, setJson }) {
  // Edita o array "tags" dentro do JSON do container (MVP)
  const [local, setLocal] = useState(safeParse(json));
  useEffect(() => setLocal(safeParse(json)), [json]);

  const addTag = () => {
    const next = { ...(local || {}), tags: [...(local?.tags || []), { id: `tg_${Date.now()}`, type: 'activation.inapp', trigger_ids: [], config: {} }] };
    setLocal(next);
    setJson(JSON.stringify(next));
  };

  return (
    <Card title="Tags">
      <p style={{ marginTop: 0, opacity: .8 }}>MVP: edita o array <code>tags</code> do container JSON.</p>
      <button onClick={addTag} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>+ Adicionar tag</button>
      <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, overflowX: 'auto', marginTop: 12 }}>
        {JSON.stringify(local?.tags || [], null, 2)}
      </pre>
    </Card>
  );
}

function TriggersEditor({ json, setJson }) {
  const [local, setLocal] = useState(safeParse(json));
  useEffect(() => setLocal(safeParse(json)), [json]);

  const addTrigger = () => {
    const t = { id: `tr_${Date.now()}`, name: 'Novo acionador', conditions: [{ expr: "event.name == 'page_view'" }] };
    const next = { ...(local || {}), triggers: [...(local?.triggers || []), t] };
    setLocal(next);
    setJson(JSON.stringify(next));
  };

  return (
    <Card title="Acionadores">
      <p style={{ marginTop: 0, opacity: .8 }}>MVP: edita o array <code>triggers</code> do container JSON.</p>
      <button onClick={addTrigger} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>+ Adicionar acionador</button>
      <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, overflowX: 'auto', marginTop: 12 }}>
        {JSON.stringify(local?.triggers || [], null, 2)}
      </pre>
    </Card>
  );
}

function VarsEditor({ json, setJson }) {
  const [local, setLocal] = useState(safeParse(json));
  useEffect(() => setLocal(safeParse(json)), [json]);

  const addVar = () => {
    const v = { name: `var_${Date.now()}`, path: 'user.id' };
    const next = { ...(local || {}), variables: [...(local?.variables || []), v] };
    setLocal(next);
    setJson(JSON.stringify(next));
  };

  return (
    <Card title="Variáveis">
      <p style={{ marginTop: 0, opacity: .8 }}>MVP: edita o array <code>variables</code> do container JSON.</p>
      <button onClick={addVar} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>+ Adicionar variável</button>
      <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, overflowX: 'auto', marginTop: 12 }}>
        {JSON.stringify(local?.variables || [], null, 2)}
      </pre>
    </Card>
  );
}

function Analysis({ prompt, setPrompt, answer, running, onRun }) {
  return (
    <Card title="Análises (Copiloto IA)">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', height: 120 }} />
      <div>
        <button onClick={onRun} disabled={running}
          style={{ marginTop: 8, padding: '8px 12px', borderRadius: 12, background: '#0f172a', color: '#fff', opacity: running ? 0.7 : 1 }}>
          {running ? 'Gerando…' : 'Gerar Análise'}
        </button>
      </div>
      <pre style={{ marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
        {answer || '—'}
      </pre>
    </Card>
  );
}

function Indicators({ data, loading, onRefresh }) {
  return (
    <Card
      title="Indicadores"
      right={<button onClick={onRefresh} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>Atualizar</button>}
    >
      {loading && <div style={{ opacity: .6 }}>Carregando…</div>}
      {!loading && !data && <div style={{ opacity: .6 }}>Sem dados ainda.</div>}
      {data && (
        <div>
          <div>Total de eventos: <b>{data.total_events}</b></div>
          <div>Últimas 24h: <b>{data.last24h}</b></div>
          <div style={{ marginTop: 8 }}>
            <b>Por evento</b>
            <ul>
              {Object.entries(data.by_event || {}).map(([k, v]) => (
                <li key={k}>{k}: <b>{v}</b></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------ helpers simples ------------ */
function mask(key) {
  if (!key) return '';
  if (key.length <= 6) return '*'.repeat(key.length);
  return key.slice(0, 3) + '…' + key.slice(-3);
}
function toast(msg) {
  if (typeof window !== 'undefined') alert(msg);
  else console.error(msg);
}
function safeParse(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }
