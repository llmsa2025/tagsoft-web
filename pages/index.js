import { useEffect, useMemo, useState } from 'react';

/** ENVs vindas da Vercel */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787').replace(/\/$/, '');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'DEMO_KEY';

/** Helper de fetch com tratamento de erro e JSON “torto” */
async function api(path, opts = {}) {
  const url = `${API_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...opts,
      headers: {
        'x-api-key': API_KEY,
        'content-type': 'application/json',
        ...(opts.headers || {}),
      },
      cache: 'no-store',
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) {
      throw new Error(`Resposta inválida da API em ${path}: ${text?.slice(0, 200)}`);
    }

    if (!res.ok) {
      const msg = data?.error || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    if (data && typeof data === 'object' && 'error' in data && data.error) {
      throw new Error(String(data.error));
    }
    return data;
  } catch (err) {
    // Repassa erro com rota para facilitar debug
    throw new Error(`[API ${path}] ${err.message}`);
  }
}

export default function Home() {
  const [tab, setTab] = useState('param');

  // Estado geral
  const [apiHealthy, setApiHealthy] = useState(null); // true/false/null
  const [apiError, setApiError] = useState('');

  // Parametrização
  const [containers, setContainers] = useState([]);
  const [json, setJson] = useState('{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}');
  const [saving, setSaving] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState(false);

  // Análises (stub)
  const [prompt, setPrompt] = useState('Mostre os 3 eventos mais frequentes.');
  const [answer, setAnswer] = useState('');
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  // Indicadores
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const apiInfo = useMemo(() => ({ API_URL, API_KEY_MASKED: mask(API_KEY) }), []);

  /** Verifica saúde da API ao carregar a página */
  useEffect(() => {
    (async () => {
      try {
        await api('/v1/health', { method: 'GET' });
        setApiHealthy(true);
        setApiError('');
      } catch (e) {
        setApiHealthy(false);
        setApiError(e.message);
      }
    })();
  }, []);

  /** Carrega containers quando entra na aba Parametrização */
  useEffect(() => {
    if (tab !== 'param') return;
    (async () => {
      setLoadingContainers(true);
      try {
        const data = await api('/v1/containers');
        setContainers(Array.isArray(data) ? data : []);
      } catch (e) {
        toast(e.message);
      } finally {
        setLoadingContainers(false);
      }
    })();
  }, [tab]);

  /** Indicadores: carrega ao entrar e atualiza a cada 10s */
  useEffect(() => {
    if (tab !== 'indicadores') return;
    const load = async () => {
      setLoadingOverview(true);
      try {
        const data = await api('/v1/analytics/overview');
        setOverview(data);
      } catch (e) {
        toast(e.message);
      } finally {
        setLoadingOverview(false);
      }
    };
    load(); // na entrada
    const id = setInterval(load, 10000); // auto-refresh
    return () => clearInterval(id);
  }, [tab]);

  /** Ações */
  const refreshOverview = async () => {
    setLoadingOverview(true);
    try {
      const data = await api('/v1/analytics/overview');
      setOverview(data);
    } catch (e) {
      toast(e.message);
    } finally {
      setLoadingOverview(false);
    }
  };

  const save = async () => {
    if (!json || !json.trim()) return toast('Preencha o JSON do container.');
    let body = null;
    try {
      body = JSON.parse(json);
    } catch {
      return toast('JSON inválido. Verifique vírgulas, aspas e chaves.');
    }
    if (!body.container_id || !body.name) {
      return toast('Campos obrigatórios: "container_id" e "name".');
    }
    setSaving(true);
    try {
      await api('/v1/containers', { method: 'PUT', body: JSON.stringify(body) });
      toast('Container salvo com sucesso!');
      setJson('');
      // recarrega lista
      const list = await api('/v1/containers');
      setContainers(Array.isArray(list) ? list : []);
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const r = await api('/v1/analysis/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
      setAnswer(r.answer || JSON.stringify(r, null, 2));
    } catch (e) {
      toast(e.message);
    } finally {
      setRunningAnalysis(false);
    }
  };

  return (
    <main style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto' }}>
      <h1 style={{ fontWeight: 700 }}>TagSoft — STM v1.0 (MVP)</h1>

      {/* Barra de status da API */}
      <div style={{ margin: '6px 0 14px', fontSize: 12, opacity: 0.9 }}>
        API: <code>{apiInfo.API_URL}</code> — key: <code>{apiInfo.API_KEY_MASKED}</code> — status:{' '}
        {apiHealthy === null ? 'checando…' : apiHealthy ? '🟢 online' : '🔴 offline'}
        {!apiHealthy && apiError ? <span style={{ color: '#b00' }}> — {apiError}</span> : null}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
        {['param', 'analise', 'indicadores'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              border: '1px solid #ddd',
              background: tab === t ? '#111' : '#fff',
              color: tab === t ? '#fff' : '#111',
            }}
          >
            {t === 'param' ? 'Parametrização' : t === 'analise' ? 'Análises (IA)' : 'Indicadores'}
          </button>
        ))}
      </div>

      {/* PARAMETRIZAÇÃO */}
      {tab === 'param' && (
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #eee' }}>
            <h3>Containers</h3>
            {loadingContainers && <div style={{ opacity: 0.6 }}>Carregando…</div>}
            <ul>
              {containers.map((c) => (
                <li key={c.container_id} style={{ background: '#f6f6f6', padding: 8, borderRadius: 8, marginTop: 8 }}>
                  <b>{c.name}</b> v{c.version} — <code>{c.container_id}</code>
                </li>
              ))}
              {!loadingContainers && containers.length === 0 && <li style={{ opacity: 0.6 }}>Nenhum container ainda.</li>}
            </ul>
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #eee' }}>
            <h3>Novo/Editar Container (JSON)</h3>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder='{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}'
              style={{ width: '100%', height: 220, fontFamily: 'monospace', fontSize: 12 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{ padding: '8px 12px', borderRadius: 12, background: '#111', color: '#fff', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
              <button
                onClick={() =>
                  setJson('{"container_id":"ct_demo","name":"Demo","version":1,"variables":[],"triggers":[],"tags":[]}')
                }
                style={{ padding: '8px 12px', borderRadius: 12, background: '#eee' }}
              >
                Template
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ANÁLISES */}
      {tab === 'analise' && (
        <section style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #eee' }}>
          <h3>Análises (Copiloto IA)</h3>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', height: 120 }} />
          <div>
            <button
              onClick={runAnalysis}
              disabled={runningAnalysis}
              style={{ marginTop: 8, padding: '8px 12px', borderRadius: 12, background: '#111', color: '#fff', opacity: runningAnalysis ? 0.7 : 1 }}
            >
              {runningAnalysis ? 'Gerando…' : 'Gerar Análise'}
            </button>
          </div>
          <pre style={{ marginTop: 12, background: '#f6f6f6', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
            {answer || '—'}
          </pre>
        </section>
      )}

      {/* INDICADORES */}
      {tab === 'indicadores' && (
        <section style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #eee' }}>
          <h3>Indicadores</h3>
          <div style={{ margin: '8px 0' }}>
            <button onClick={refreshOverview} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>
              Atualizar
            </button>
          </div>
          {loadingOverview && <div style={{ opacity: 0.6 }}>Carregando…</div>}
          {!loadingOverview && !overview && <div style={{ opacity: 0.6 }}>Sem dados ainda.</div>}
          {overview && (
            <div>
              <div>Total de eventos: <b>{overview.total_events}</b></div>
              <div>Últimas 24h: <b>{overview.last24h}</b></div>
              <div style={{ marginTop: 8 }}>
                <b>Por evento</b>
                <ul>
                  {Object.entries(overview.by_event || {}).map(([k, v]) => (
                    <li key={k}>
                      {k}: <b>{v}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/** Utils */
function mask(key) {
  if (!key) return '';
  if (key.length <= 6) return '*'.repeat(key.length);
  return key.slice(0, 3) + '…' + key.slice(-3);
}

function toast(msg) {
  if (typeof window !== 'undefined') {
    // alerta simples para MVP
    window.alert(msg);
  } else {
    console.error(msg);
  }
}
