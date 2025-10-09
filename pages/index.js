// pages/index.js
// Tela "Contas" minimalista (sem menu lateral) com Drawer na direita.
// Comentários em PT-BR; código/identificadores em inglês.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
  listAccounts,
  listContainers,
  upsertAccount,
  upsertContainer,
} from '../lib/api';

// —— util simples p/ IDs legíveis (acc_..., ct_...) ——
function rid(prefix = '') {
  return (
    prefix +
    Math.random().toString(36).slice(2, 7) +
    Math.random().toString(36).slice(2, 7)
  );
}

// —— Portal: garante que o drawer fique por cima de tudo (z-index alto) ——
function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  const [root, setRoot] = useState(null);
  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-portal', 'drawer');
    document.body.appendChild(el);
    setRoot(el);
    setMounted(true);
    return () => { document.body.removeChild(el); };
  }, []);
  if (!mounted || !root) return null;
  return createPortal(children, root);
}

// Tipos suportados (ios/android desabilitados por enquanto)
const TYPES = [
  { value: 'web', label: 'Web' },
  { value: 'server', label: 'Servidor' },
  { value: 'ios', label: 'iOS', disabled: true },
  { value: 'android', label: 'Android', disabled: true },
];

export default function AccountsPage() {
  // estado de dados
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // [{account_id, name, containers: []}]

  // estado do drawer/form
  const [showDrawer, setShowDrawer] = useState(false);
  const [accName, setAccName] = useState('');
  const [containerName, setContainerName] = useState('');
  const [type, setType] = useState('web');
  const [saving, setSaving] = useState(false);

  // Carrega contas + seus containers
  async function load() {
    setLoading(true);
    try {
      const accs = await listAccounts();
      const withContainers = await Promise.all(
        (accs || []).map(async (a) => {
          const cs = await listContainers({ account_id: a.account_id });
          return { ...a, containers: cs || [] };
        })
      );
      setItems(withContainers);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao carregar contas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openDrawer() {
    setAccName('');
    setContainerName('');
    setType('web');
    setShowDrawer(true);
  }
  function closeDrawer() { setShowDrawer(false); }

  // Salva conta + contêiner
  async function handleSave(e) {
    e.preventDefault();
    if (!accName.trim()) return alert('Informe o nome da conta.');
    if (!containerName.trim()) return alert('Informe o nome do contêiner.');

    setSaving(true);
    try {
      const account_id = rid('acc_');
      await upsertAccount({ account_id, name: accName.trim() });

      const container_id = rid('ct_');
      await upsertContainer({
        container_id,
        account_id,
        name: containerName.trim(),
        type,            // 'web' | 'server' (ios/android ainda desabilitados)
        version: 1,
        variables: [],
        triggers: [],
        tags: [],
      });

      closeDrawer();
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao criar conta/contêiner.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Cabeçalho simples */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Contas</h1>
        <button
          onClick={openDrawer}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: '#111827',
            color: '#fff',
            border: '1px solid #111827',
            cursor: 'pointer'
          }}
        >
          Criar conta
        </button>
      </div>

      {/* Estado de carregamento */}
      {loading && <div style={{ opacity: 0.6 }}>Carregando…</div>}

      {/* Placeholder vazio */}
      {!loading && (!items || items.length === 0) && (
        <div style={{
          opacity: 0.75,
          border: '1px dashed #ddd',
          padding: 16,
          borderRadius: 8
        }}>
          Nenhuma conta ainda. Crie a primeira.
        </div>
      )}

      {/* Lista de contas + containers */}
      {!loading && items?.map((acc) => (
        <div
          key={acc.account_id}
          style={{
            border: '1px solid #eee',
            borderRadius: 12,
            padding: 16,
            marginTop: 14,
            background: '#fff'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            {acc.name} <span style={{ opacity: .55, fontWeight: 400 }}>— {acc.account_id}</span>
          </div>

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
                borderRadius: 10,
                marginTop: 8,
                background: '#fafafa'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  <Link href={`/containers/${encodeURIComponent(c.container_id)}`} legacyBehavior>
                    <a style={{ textDecoration: 'none' }}>
                      {c.name} <span style={{ opacity: .55 }}>— {c.container_id}</span>
                    </a>
                  </Link>
                </div>
                <div style={{ fontSize: 12, opacity: .75 }}>
                  Tipo: {c.type || 'web'} • v{c.version || 1}
                </div>
              </div>

              <Link href={`/containers/${encodeURIComponent(c.container_id)}`} legacyBehavior>
                <a
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none'
                  }}
                >
                  Abrir
                </a>
              </Link>
            </div>
          ))}
        </div>
      ))}

      {/* Drawer (lado direito) */}
      {showDrawer && (
        <Portal>
          {/* overlay */}
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.25)',
              zIndex: 9998
            }}
          />
          {/* painel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: 420,
              background: '#fff',
              borderLeft: '1px solid #e5e7eb',
              zIndex: 9999,
              boxShadow: '-12px 0 24px rgba(0,0,0,.08)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* header do drawer */}
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontWeight: 700 }}>Nova conta / contêiner</div>
              <button onClick={closeDrawer} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>✕</button>
            </div>

            {/* conteúdo do drawer */}
            <form onSubmit={handleSave} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, opacity: .7 }}>Nome da conta</label>
                <input
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Ex.: Minha empresa"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    marginTop: 6
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, opacity: .7 }}>Nome do contêiner</label>
                <input
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  placeholder="Ex.: Web App / ERP"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    marginTop: 6
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, opacity: .7 }}>Tipo do contêiner</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    marginTop: 6,
                    background: '#fff'
                  }}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value} disabled={t.disabled}>
                      {t.label}{t.disabled ? ' (em breve)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={closeDrawer}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#111827',
                    color: '#fff',
                    border: '1px solid #111827',
                    opacity: saving ? .7 : 1
                  }}
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </Portal>
      )}
    </div>
  );
}
