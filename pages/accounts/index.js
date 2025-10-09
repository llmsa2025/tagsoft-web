// pages/accounts/index.js
// Tela de Contas (plana1): lista contas e permite criar conta/contêiner
// UI em português; código em inglês.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  listAccounts,
  listContainers,
  upsertAccount,
  upsertContainer,
} from '../../lib/api';

// Gera IDs simples (MVP)
function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function AccountsHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]); // [{account, containers: []}]

  // Slide: nova conta + contêiner
  const [openNewAccount, setOpenNewAccount] = useState(false);
  const [accName, setAccName] = useState('');
  const [ctName, setCtName] = useState('');
  const [ctType, setCtType] = useState('web');
  const [creating, setCreating] = useState(false);

  // Slide: novo contêiner (em uma conta existente)
  const [openNewCt, setOpenNewCt] = useState(false);
  const [newCtAccount, setNewCtAccount] = useState(null); // {account_id, name...}
  const [newCtName, setNewCtName] = useState('');
  const [newCtType, setNewCtType] = useState('web');
  const [creatingCt, setCreatingCt] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const accs = await listAccounts();
      const data = await Promise.all(
        (accs || []).map(async (a) => {
          const cs = await listContainers({ account_id: a.account_id });
          return { account: a, containers: cs || [] };
        })
      );
      setAccounts(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // —— Criar conta + contêiner (redireciona para a nova container) ——
  async function handleCreateAccount() {
    if (!accName.trim()) { alert('Nome da conta é obrigatório.'); return; }
    if (!ctName.trim())  { alert('Nome do contêiner é obrigatório.'); return; }

    setCreating(true);
    try {
      const account_id = id('acc');
      await upsertAccount({ account_id, name: accName.trim() });

      const container_id = id('ct');
      await upsertContainer({
        container_id,
        account_id,
        name: ctName.trim(),
        type: ctType, // 'web' | 'server' | 'ios' | 'android'
        version: 1,
      });

      // Vai direto para a nova container
      router.push(`/containers/${container_id}?tab=overview`);
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  }

  // —— Abrir slide de novo contêiner (em conta existente) ——
  function openNewContainerForAccount(acc) {
    setNewCtAccount(acc);
    setNewCtName('');
    setNewCtType('web');
    setOpenNewCt(true);
  }

  // —— Criar contêiner (fica na mesma página e recarrega a lista) ——
  async function handleCreateContainerOnly() {
    if (!newCtAccount?.account_id) { alert('Conta inválida.'); return; }
    if (!newCtName.trim()) { alert('Nome do contêiner é obrigatório.'); return; }

    setCreatingCt(true);
    try {
      const container_id = id('ct');
      await upsertContainer({
        container_id,
        account_id: newCtAccount.account_id,
        name: newCtName.trim(),
        type: newCtType,
        version: 1,
      });

      setOpenNewCt(false);
      await load(); // recarrega para mostrar o novo contêiner
    } catch (e) {
      alert(e.message);
    } finally {
      setCreatingCt(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Cabeçalho da página */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <h1 style={{ margin:0, fontSize: 32 }}>Contas</h1>
        <button
          onClick={() => setOpenNewAccount(true)}
          style={{ padding:'8px 14px', borderRadius:10, background:'#e9d5ff', border:'1px solid #cabffd' }}
        >
          Criar conta
        </button>
      </div>

      {/* Lista de contas */}
      {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
      {!loading && accounts.length === 0 && (
        <div style={{ opacity:.7, border:'1px dashed #ddd', padding:14, borderRadius:10 }}>
          Nenhuma conta ainda. Crie a primeira.
        </div>
      )}

      <div style={{ display:'grid', gap:12 }}>
        {accounts.map(({ account, containers }) => (
          <div key={account.account_id}
               style={{ border:'1px solid #eee', borderRadius:12, padding:14, background:'#fff' }}>
            {/* Cabeçalho do cartão da conta */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontWeight:600 }}>
                {account.name} <span style={{ opacity:.6 }}>— {account.account_id}</span>
              </div>
              <button
                onClick={() => openNewContainerForAccount(account)}
                title="Criar novo contêiner nesta conta"
                style={{ padding:'6px 10px', borderRadius:8, background:'#eef2ff', border:'1px solid #c7d2fe' }}
              >
                + Novo contêiner
              </button>
            </div>

            {/* Lista de contêineres da conta */}
            {(containers || []).map(ct => (
              <div key={ct.container_id}
                   style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                            border:'1px solid #f0f0f0', borderRadius:10, padding:'10px 12px', marginTop:8 }}>
                <div>
                  <a
                    href={`/containers/${ct.container_id}?tab=overview`}
                    style={{ color:'#6d28d9', textDecoration:'none', fontWeight:600 }}
                  >
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
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.25)',
          display:'flex', justifyContent:'flex-end', zIndex:50
        }}>
          <div style={{
            width:420, height:'100%', background:'#fff', padding:20,
            boxShadow:'-8px 0 24px rgba(0,0,0,.15)'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:700 }}>Nova conta / contêiner</div>
              <button onClick={() => setOpenNewAccount(false)} style={{ padding:'4px 8px' }}>✕</button>
            </div>

            <div style={{ display:'grid', gap:12 }}>
              <div>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Nome da conta</div>
                <input
                  value={accName} onChange={e=>setAccName(e.target.value)}
                  placeholder="Minha empresa"
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
                />
              </div>

              <div>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Nome do contêiner</div>
                <input
                  value={ctName} onChange={e=>setCtName(e.target.value)}
                  placeholder="Minha Container"
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
                />
              </div>

              <div>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Tipo do contêiner</div>
                <select
                  value={ctType} onChange={e=>setCtType(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
                >
                  <option value="web">Web</option>
                  <option value="server">Server</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                </select>
              </div>

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={() => setOpenNewAccount(false)}
                        style={{ padding:'8px 12px', borderRadius:8, background:'#f3f4f6', border:'1px solid #e5e7eb' }}>
                  Cancelar
                </button>
                <button onClick={handleCreateAccount} disabled={creating}
                        style={{ padding:'8px 12px', borderRadius:8, background:'#e9d5ff',
                                 border:'1px solid #cabffd', opacity: creating ? .6 : 1 }}>
                  {creating ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide: novo contêiner em conta existente */}
      {openNewCt && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.25)',
          display:'flex', justifyContent:'flex-end', zIndex:50
        }}>
          <div style={{
            width:420, height:'100%', background:'#fff', padding:20,
            boxShadow:'-8px 0 24px rgba(0,0,0,.15)'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:700 }}>
                Novo contêiner — <span style={{ opacity:.7 }}>{newCtAccount?.name}</span>
              </div>
              <button onClick={() => setOpenNewCt(false)} style={{ padding:'4px 8px' }}>✕</button>
            </div>

            <div style={{ display:'grid', gap:12 }}>
              <div>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Nome do contêiner</div>
                <input
                  value={newCtName} onChange={e=>setNewCtName(e.target.value)}
                  placeholder="Meu novo contêiner"
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
                />
              </div>

              <div>
                <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Tipo do contêiner</div>
                <select
                  value={newCtType} onChange={e=>setNewCtType(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #ddd', borderRadius:8 }}
                >
                  <option value="web">Web</option>
                  <option value="server">Server</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                </select>
              </div>

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={() => setOpenNewCt(false)}
                        style={{ padding:'8px 12px', borderRadius:8, background:'#f3f4f6', border:'1px solid #e5e7eb' }}>
                  Cancelar
                </button>
                <button onClick={handleCreateContainerOnly} disabled={creatingCt}
                        style={{ padding:'8px 12px', borderRadius:8, background:'#e9d5ff',
                                 border:'1px solid #cabffd', opacity: creatingCt ? .6 : 1 }}>
                  {creatingCt ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
