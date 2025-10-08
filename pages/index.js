// pages/index.js
import { useEffect, useState } from 'react';
import STMLayout, { Card } from '../components/STMLayout';
import { api } from '../lib/api';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api('/v1/analytics/overview');
      setOverview(data);
    } catch (e) {
      alert('Erro ao carregar indicadores: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  async function gerarTeste() {
    try {
      await api('/v1/ingest', {
        method: 'POST',
        body: JSON.stringify({
          event: 'page_view',
          user: { id: 'u_demo' },
          context: { screen: 'dashboard' },
        }),
      });
      await api('/v1/ingest', {
        method: 'POST',
        body: JSON.stringify({
          event: 'nota_fiscal_emitida',
          user: { id: 'u_demo' },
          biz: { valor: 99.9, itens: 1 },
        }),
      });
      await load();
      alert('Eventos de teste enviados!');
    } catch (e) {
      alert('Falha ao gerar eventos de teste: ' + (e?.message || e));
    }
  }

  return (
    <STMLayout active="dashboard">
      <Card
        title="Indicadores"
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={load} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>
              Atualizar
            </button>
            <button onClick={gerarTeste} style={{ padding: '6px 10px', borderRadius: 10, background: '#e0f2fe' }}>
              Gerar eventos de teste
            </button>
          </div>
        }
      >
        {loading && <div style={{ opacity: 0.6 }}>Carregando…</div>}
        {!loading && !overview && <div style={{ opacity: 0.6 }}>Sem dados ainda.</div>}
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
      </Card>
    </STMLayout>
  );
}
