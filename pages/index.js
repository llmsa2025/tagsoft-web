// pages/index.js
// Tela inicial: Contas (lista). Botão "Criar conta" abre um drawer à direita.
// No salvar: cria a Conta e o primeiro Contêiner e recarrega a lista.
//
// Nomes de variáveis/funções em inglês; textos e comentários em PT-BR.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import STMLayout, { Card } from '../components/STMLayout';
import {
  listAccounts,
  listContainers,
  upsertAccount,
  upsertContainer,
} from '../lib/api';

// util simples para gerar IDs client-side (ok para MVP)
function rid(prefix = '') {
  return (
    prefix +
    Math.random().toString(36).slice(2, 7) +
    Math.random().toString(36).slice(2, 7)
  );
}

export default function AccountsHome() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // [{ account_id, name, containers: [...] }]

  // Drawer (painel lateral)
  const [showDrawer, setShowDrawer] = useState(false);

  // Campos do formulário (drawer)
  const [accName, setAccName] = useState('');
  const [containerName, setContainerName] = useState('');
  const [type, setType] = useState('web'); // 'web' | 'server' | 'ios' | 'android'
  const [saving, setSaving] = useState(false);

  // Carrega contas e seus contêineres
  const load = async () => {
    setLoading(true);
    try {
      const accs = await listAccounts(); // [{account_id, name, ...}]
      const withContainers = await Promise.all(
        (accs || []).map(async (a) => {
          const cs = await listContainers({ account_id: a.account_id });
          return { ...a, containers: cs || [] };
        })
      );
      setItems(withContainers);
    } catch (err) {
      alert(err.message || 'Erro ao carregar contas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Abre o drawer limpando o form
  function openDrawer() {
    setAccName('');
    setContainerName('');
    setType('web');
    setShowDrawer(true);
  }

  // Salva: cria a conta e o contêiner e recarrega a lista
  async function handleSave(e) {
    e.preventDefault();
    if (!accName.trim()) {
      alert('Informe o nome da conta.');
      return;
    }
    if (!containerName.trim()) {
      alert('Informe o nome do contêiner.');
      return;
    }

    setSaving(true);
    try {
      // 1) Cria/atualiza a conta (server gera account_id se não vier)
      const account = await upsertAccount({
        name: accName.trim(),
        country: 'BR', // opcional, só para manter um campo
      });
      const account_id = account?.account_id;
      if (!account_id) throw new Error('Falha ao criar conta (sem account_id).');

      // 2) Cria o primeiro contêiner vinculado à conta
      const container_id = rid('ct_');
      await upsertContainer({
        container_id,
        account_id,
        name: containerName.trim(),
        type, // 'web' | 'server' | 'ios' | 'android'
        version: 1,
        variables: [],
        triggers: [],
        tags: [],
      });

      // 3) Fecha drawer e recarrega a lista
      setShowDrawer(false);
      await load();
      // (Opcional) perguntar se quer abrir o container recém-criado
      // if (confirm('Conta e contêiner criados! Deseja abrir o contêiner agora?')) {
      //   location.href = `/containers/${encodeURIComponent(container_id)}`;
      // }
    } catch (err) {
      alert(err.message || 'Erro ao criar conta/contêiner.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <STMLayout active="accounts">
      <Card
        title="Contas"
        right={
          <button
            onClick={openDrawer}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
            }}
          >
            Criar conta
          </button>
        }
      >
        {loading && <div style={{ opacity: 0.6 }}>Carregando…</div>}

        {!loading && (!items || items.length === 0) && (
          <div style={{ opacity: 0.75, border: '1px dashed #ddd', padding: 16, borderRadius: 8 }}>
            Nenhuma conta ainda. Crie a primeira.
          </div>
        )}

        {/* Lista de contas e seus contêineres (estilo GTM resumido) */}
        {!loading &&
          items?.map((acc) => (
            <div
              key={acc.account_id}
              style={{
                border: '1px solid #eee',
                borderRadius: 10,
                padding: 14,
                marginTop: 12,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{acc.name}</div>

              {(!acc.containers || acc.containers.length === 0) && (
                <div style={{ opacity: 0.6 }}>Sem contêineres ainda.</div>
              )}

              {acc.containers?.map((c) => (
                <div
                  key={c.container_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    marginTop: 6,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      <Link href={`/containers/${encodeURIComponent(c.container_id)}`} legacyBehavior>
                        <a style={{ textDecoration: 'none' }}>
                          {c.name} <span style={{ opacity: 0.55 }}>— {c.container_id}</span>
                        </a>
                      </Link>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Tipo: {c.type || 'web'} • v{c.version || 1}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/containers/${encodeURIComponent(c.container_id)}`} legacyBehavior>
                      <a
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          textDecoration: 'none',
                        }}
                      >
                        Abrir
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </Card>

      {/* Drawer (painel lateral à direita) */}
      {showDrawer && (
        <>
          {/* Overlay (clique fecha) */}
          <div
            onClick={() => !saving && setShowDrawer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.25)',
              zIndex: 40,
            }}
          />
          {/* Painel */}
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 420,
              maxWidth: '92vw',
              background: '#fff',
              borderLeft: '1px solid #eee',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.06)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>Nova conta</div>
              <button
                onClick={() => !saving && setShowDrawer(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 18 }}
                title="Fechar"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: 16, display: 'grid', gap: 14 }}>
              {/* Conta */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nome da conta</label>
                <input
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Ex.: Minha Empresa"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                  }}
                />
              </div>

              {/* Contêiner */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nome do contêiner</label>
                <input
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  placeholder="Ex.: [WEB] Minha Empresa"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Tipo do contêiner</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="type"
                      value="web"
                      checked={type === 'web'}
                      onChange={() => setType('web')}
                    />
                    Web (SaaS)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="type"
                      value="server"
                      checked={type === 'server'}
                      onChange={() => setType('server')}
                    />
                    Server (ERP)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="type"
                      value="ios"
                      checked={type === 'ios'}
                      onChange={() => setType('ios')}
                    />
                    iOS (apps)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="type"
                      value="android"
                      checked={type === 'android'}
                      onChange={() => setType('android')}
                    />
                    Android (apps)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => !saving && setShowDrawer(false)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#e0f2fe',
                    border: '1px solid #bae6fd',
                  }}
                  disabled={saving}
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </STMLayout>
  );
}
