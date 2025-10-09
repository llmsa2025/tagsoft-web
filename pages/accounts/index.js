// pages/accounts/index.js
// Lista contas + botão flutuante para criar novo contêiner (global)

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { listAccounts, listContainers, upsertContainer } from '../../lib/api';

// id simples (MVP)
function genId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function AccountsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // [{ account, containers: [] }]

  // Slide "criar contêiner (global)"
  const [openNewCt, setOpenNewCt] = useState(false);
  const [globalAccountId, setGlobalAccountId] = useState('');
  const [globalCtName, setGlobalCtName] = useState('');
  const [globalCtType, setGlobalCtType] = useState('web');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const accs = await listAccounts(); // [{account_id, name}]
      const data = await Promise.all(
        (accs || []).map(async (a) => {
          const cs = await listContainers({ account_id: a.account_id });
          return { account: a, containers: cs || [] };
        })
      );
      setRows(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const accountOptions = useMemo(
    () => rows.map(r => ({ value: r.account.account_id, label: r.account.name })),
    [rows]
  );

  async function handleCreateContainerGlobal() {
    if (!globalAccountId)     { alert('Selecione a conta.'); return; }
    if (!globalCtName.trim()) { alert('Nome do contêiner é obrigatório.'); return; }

    setSaving(true);
    try {
      const container_id = genId('ct');
      await upsertContainer({
        container_id,
        account_id: globalAccountId,
        name: globalCtName.trim(),
        type: globalCtType,    // web | server | ios | android
        version: 1,
      });
      setOpenNewCt(false);
      setGlobalCtName('');
      setGlobalCtType('web');
      setGlobalAccountId('');
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Cabeçalho simples (mantém seu visual atual) */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:32 }}>Contas</h1>
        {/* seu botão "Criar conta" vem do layout atual; deixamos como está */}
      </div>

      {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
      {!loading && rows.length === 0 && (
        <div style={{ opacity:.7, border:'1px dashed #ddd', padding:14, borderRadius:10 }}>
          Nenhuma conta ainda. Crie a primeira.
        </div>
      )}

      {/* Lista de contas + containers (mantém a estrutura que você já tem) */}
      <div style={{ display:'grid', gap:12 }}>
        {rows.map(({ account, containers }) => (
          <div key={account.account_id}
               style={{ border:'1px solid #eee', borderRadius:12, padding:14, background:'#fff' }}>
            <div style={{ fontWeight:600, marginBottom:8 }}>
              {account.name} <span style={{ opacity:.6 }}>— {account.account_id}</span>
            </div>

            {(containers || []).map(ct => (
              <div key={ct.container_id}
                   style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                            border:'1px solid #f0f0f0', borderRadius:10, padding:'10px 12px', marginTop:8 }}>
                <div>
                  <a href={`/containers/${ct.container_id}?tab=overview`}
                     style={{ color:'#6d28d9', textDecoration:'none', fontWeight:600 }}>
                    {ct.name}
                  </a>
                  <span style={{ marginLeft:8, opacity:.55 }}>— {ct.container_id}</span>
                  <div style={{ fontSize:12, opacity:.6, marginTop:4 }}>
                    Tipo: {ct.type} • v{ct.version || 1}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/containers/${ct.container_id}?tab=overview`)}
                  style={{ padding:'6px 10px', borderRadius:8, background:'#ede9fe', border:'1px solid #ddd' }}
                >
                  Abrir
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* BOTÃO FLUTUANTE — aparece sempre */}
      <button
        onClick={() => setOpenNewCt(true)}
        style={{
          position:'fixed', right:20, bottom:20,
          padding:'10px 14px', borderRadius:999,
          background:'#e9d5ff', border:'1px solid #cabffd',
          boxShadow:'0 6px 18px rgba(0,0,0,.15)', cursor:'pointer'
        }}
        title="Criar novo contêiner"
      >
        ➕ Criar contêiner (global)
      </button>

      {/* SLIDE — Criar contêiner (GLOBAL) */}
      {openNewCt && (
        <Slide onClose={() => setOpenNewCt(false)} title="Criar contêiner">
          <Field label="Conta">
            <select
              value={globalAccountId}
              onChange={e=>setGlobalAccountId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecione…</option>
              {accountOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Nome do contêiner">
            <input value={globalCtName} onChange={e=>setGlobalCtName(e.target.value)}
                   placeholder="Meu contêiner" style={inputStyle}/>
          </Field>

          <Field label="Tipo do contêiner">
            <select value={globalCtType} onChange={e=>setGlobalCtType(e.target.value)} style={inputStyle}>
              <option value="web">Web</option>
              <option value="server">Server</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </Field>

          <Actions
            saving={saving}
            onCancel={() => setOpenNewCt(false)}
            onSave={handleCreateContainerGlobal}
          />
        </Slide>
      )}
    </div>
  );
}

/* ===== UI helpers ===== */
function Slide({ title, onClose, children }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.25)',
      display:'flex', justifyContent:'flex-end', zIndex:50
    }}>
      <div style={{
        width:420, height:'100%', background:'#fff', padding:20,
        boxShadow:'-8px 0 24px rgba(0,0,0,.15)'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontWeight:700 }}>{title}</div>
          <button onClick={onClose} style={{ padding:'4px 8px' }}>✕</button>
        </div>
        <div style={{ display:'grid', gap:12 }}>{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
}
function Actions({ onCancel, onSave, saving }) {
  return (
    <div style={{ display:'flex', gap:8, marginTop:8 }}>
      <button onClick={onCancel}
        style={{ padding:'8px 12px', borderRadius:8, background:'#f3f4f6', border:'1px solid #e5e7eb' }}>
        Cancelar
      </button>
      <button onClick={onSave} disabled={saving}
        style={{ padding:'8px 12px', borderRadius:8, background:'#e9d5ff',
                 border:'1px solid #cabffd', opacity: saving ? .6 : 1 }}>
        {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
const inputStyle = {
  width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8,
};
