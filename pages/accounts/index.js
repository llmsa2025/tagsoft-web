// pages/accounts/index.js
// Tela de Contas: cria/lista contas e cria contêiner (por conta e global)

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  listAccounts,
  listContainers,
  upsertAccount,
  upsertContainer,
} from '../../lib/api';

// Gera IDs simples (MVP)
function genId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function AccountsHome() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // [{ account, containers: [] }]

  // Slide: nova conta + contêiner (redireciona para a container)
  const [openNewAccount, setOpenNewAccount] = useState(false);
  const [accName, setAccName] = useState('');
  const [ctName, setCtName] = useState('');
  const [ctType, setCtType] = useState('web');
  const [savingAcc, setSavingAcc] = useState(false);

  // Slide: novo contêiner (por conta: botão dentro do cartão)
  const [openNewCt, setOpenNewCt] = useState(false);
  const [newCtAccount, setNewCtAccount] = useState(null); // {account_id, name}
  const [newCtName, setNewCtName] = useState('');
  const [newCtType, setNewCtType] = useState('web');
  const [savingCt, setSavingCt] = useState(false);

  // Slide: novo contêiner (GLOBAL — botão no topo com select de contas)
  const [openNewCtGlobal, setOpenNewCtGlobal] = useState(false);
  const [globalCtName, setGlobalCtName] = useState('');
  const [globalCtType, setGlobalCtType] = useState('web');
  const [globalAccountId, setGlobalAccountId] = useState('');
  const [savingCtGlobal, setSavingCtGlobal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const accs = await listAccounts(); // [{account_id, name}]
      const data = await Promise.all(
        (accs || []).map(async (a) => {
          const cs = await listContainers({ account_id: a.account_id }); // containers da conta
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

  // ————— Criar conta + container (redireciona) —————
  async function handleCreateAccount() {
    if (!accName.trim())  { alert('Nome da conta é obrigatório.'); return; }
    if (!ctName.trim())   { alert('Nome do contêiner é obrigatório.'); return; }

    setSavingAcc(true);
    try {
      const account_id = genId('acc');
      await upsertAccount({ account_id, name: accName.trim() });

      const container_id = genId('ct');
      await upsertContainer({
        container_id,
        account_id,
        name: ctName.trim(),
        type: ctType,   // 'web' | 'server' | 'ios' | 'android'
        version: 1,
      });

      router.push(`/containers/${container_id}?tab=overview`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingAcc(false);
    }
  }

  // ————— Abrir slide “novo contêiner” por conta —————
  function openNewContainerForAccount(acc) {
    setNewCtAccount(acc);
    setNewCtName('');
    setNewCtType('web');
    setOpenNewCt(true);
  }

  // ————— Criar contêiner (por conta) —————
  async function handleCreateContainerOnly() {
    if (!newCtAccount?.account_id) { alert('Conta inválida.'); return; }
    if (!newCtName.trim())         { alert('Nome do contêiner é obrigatório.'); return; }

    setSavingCt(true);
    try {
      const container_id = genId('ct');
      await upsertContainer({
        container_id,
        account_id: newCtAccount.account_id,
        name: newCtName.trim(),
        type: newCtType,
        version: 1,
      });

      setOpenNewCt(false);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingCt(false);
    }
  }

  // ————— Criar contêiner (GLOBAL) —————
  async function handleCreateContainerGlobal() {
    if (!globalAccountId)        { alert('Selecione a conta.'); return; }
    if (!globalCtName.trim())    { alert('Nome do contêiner é obrigatório.'); return; }

    setSavingCtGlobal(true);
    try {
      const container_id = genId('ct');
      await upsertContainer({
        container_id,
        account_id: globalAccountId,
        name: globalCtName.trim(),
        type: globalCtType,
        version: 1,
      });

      setOpenNewCtGlobal(false);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingCtGlobal(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:32 }}>Contas</h1>
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={() => setOpenNewCtGlobal(true)}
            style={{ padding:'8px 14px', borderRadius:10, background:'#eef2ff', border:'1px solid #c7d2fe' }}
          >
            Criar contêiner
          </button>
          <button
            onClick={() => setOpenNewAccount(true)}
            style={{ padding:'8px 14px', borderRadius:10, background:'#e9d5ff', border:'1px solid #cabffd' }}
          >
            Criar conta
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
      {!loading && rows.length === 0 && (
        <div style={{ opacity:.7, border:'1px dashed #ddd', padding:14, borderRadius:10 }}>
          Nenhuma conta ainda. Crie a primeira.
        </div>
      )}

      <div style={{ display:'grid', gap:12 }}>
        {rows.map(({ account, containers }) => (
          <div key={account.account_id}
               style={{ border:'1px solid #eee', borderRadius:12, padding:14, background:'#fff' }}>
            {/* Cabeçalho do cartão da conta */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontWeight:600 }}>
                {account.name} <span style={{ opacity:.6 }}>— {account.account_id}</span>
              </div>
              <button
                onClick={() => openNewContainerForAccount(account)}
                style={{ padding:'6px 10px', borderRadius:8, background:'#eef2ff', border:'1px solid #c7d2fe' }}
                title="Criar novo contêiner nesta conta"
              >
                + Novo contêiner
              </button>
            </div>

            {/* Lista de containers */}
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

      {/* Slide: nova conta + contêiner */}
      {openNewAccount && (
        <Slide onClose={() => setOpenNewAccount(false)} title="Nova conta / contêiner">
          <Field label="Nome da conta">
            <input value={accName} onChange={e=>setAccName(e.target.value)}
              placeholder="Minha empresa"
              style={inputStyle}/>
          </Field>

          <Field label="Nome do contêiner">
            <input value={ctName} onChange={e=>setCtName(e.target.value)}
              placeholder="Minha Container" style={inputStyle}/>
          </Field>

          <Field label="Tipo do contêiner">
            <select value={ctType} onChange={e=>setCtType(e.target.value)} style={inputStyle}>
              <option value="web">Web</option>
              <option value="server">Server</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </Field>

          <Actions
            saving={savingAcc}
            onCancel={() => setOpenNewAccount(false)}
            onSave={handleCreateAccount}
          />
        </Slide>
      )}

      {/* Slide: novo contêiner (por conta) */}
      {openNewCt && (
        <Slide onClose={() => setOpenNewCt(false)} title={`Novo contêiner — ${newCtAccount?.name || ''}`}>
          <Field label="Nome do contêiner">
            <input value={newCtName} onChange={e=>setNewCtName(e.target.value)}
              placeholder="Meu novo contêiner" style={inputStyle}/>
          </Field>

          <Field label="Tipo do contêiner">
            <select value={newCtType} onChange={e=>setNewCtType(e.target.value)} style={inputStyle}>
              <option value="web">Web</option>
              <option value="server">Server</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </Field>

          <Actions
            saving={savingCt}
            onCancel={() => setOpenNewCt(false)}
            onSave={handleCreateContainerOnly}
          />
        </Slide>
      )}

      {/* Slide: novo contêiner (GLOBAL) */}
      {openNewCtGlobal && (
        <Slide onClose={() => setOpenNewCtGlobal(false)} title="Criar contêiner">
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
            saving={savingCtGlobal}
            onCancel={() => setOpenNewCtGlobal(false)}
            onSave={handleCreateContainerGlobal}
          />
        </Slide>
      )}
    </div>
  );
}

/* —— componentes utilitários visuais simples —— */

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
