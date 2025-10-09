// pages/accounts/index.js
// Lista de contas + slide-over para criar conta e um container padrão.
// Comentários em PT-BR para facilitar manutenção.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import STMLayout, { Card } from '../../components/STMLayout';
import {
  listAccounts,
  listContainers,
  upsertAccount,
  upsertContainer,
} from '../../lib/api';

export default function AccountsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [containers, setContainers] = useState([]);

  // slide-over
  const [open, setOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [ctName, setCtName] = useState('');
  const [ctType, setCtType] = useState('web'); // API suporta 'web' e 'server'
  const [saving, setSaving] = useState(false);

  // carrega contas e containers
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [accs, cts] = await Promise.all([
          listAccounts(),
          listContainers(), // carrega todos e agrupamos por account_id
        ]);
        if (mounted) {
          setAccounts(accs || []);
          setContainers(cts || []);
        }
      } catch (e) {
        alert(e.message || 'Erro ao carregar contas');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // agrupa containers por account_id
  const containersByAccount = useMemo(() => {
    const map = new Map();
    for (const c of containers) {
      const list = map.get(c.account_id) || [];
      list.push(c);
      map.set(c.account_id, list);
    }
    return map;
  }, [containers]);

  // cria conta + container e redireciona para a nova container
  async function handleCreate() {
    if (!accName.trim()) return alert('Informe o nome da conta');
    if (!ctName.trim()) return alert('Informe o nome do contêiner');

    setSaving(true);
    try {
      const account_id = `acc_${rand(8)}`;
      await upsertAccount({ account_id, name: accName.trim() });

      const container_id = `ct_${rand(10)}`;
      await upsertContainer({
        container_id,
        account_id,
        name: ctName.trim(),
        type: ctType, // 'web' | 'server'
        version: 1,
        variables: [],
        triggers: [],
        tags: [],
      });

      // redireciona direto para a nova container
      router.push(`/containers/${encodeURIComponent(container_id)}?tab=overview`);
    } catch (e) {
      alert(e.message || 'Erro ao salvar');
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
            onClick={() => setOpen(true)}
            style={{ padding:'8px 12px', borderRadius:8, background:'#eef2ff', border:'1px solid #000' }}
          >
            Criar conta
          </button>
        }
      >
        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
        {!loading && accounts.length === 0 && (
          <div style={{ opacity:.7 }}>Nenhuma conta ainda. Crie a primeira.</div>
        )}

        <div style={{ display:'grid', gap:12 }}>
          {accounts.map(acc => {
            const list = containersByAccount.get(acc.account_id) || [];
            return (
              <div
                key={acc.account_id}
                style={{ border:'1px dashed #e5e7eb', borderRadius:10, padding:12 }}
              >
                <div style={{ fontWeight:700, marginBottom:6 }}>
                  {acc.name} <span style={{ opacity:.6 }}>— {acc.account_id}</span>
                </div>

                {list.length === 0 && (
                  <div style={{ opacity:.6 }}>Nenhum contêiner nessa conta.</div>
                )}

                {list.map(ct => (
                  <div
                    key={ct.container_id}
                    style={{
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'space-between',
                      padding:'8px 10px',
                      border:'1px solid #e5e7eb',
                      borderRadius:8,
                      marginTop:8,
                      background:'#fff'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight:600 }}>
                        <a
                          href={`/containers/${encodeURIComponent(ct.container_id)}?tab=overview`}
                          style={{ textDecoration:'none', color:'#1d4ed8' }}
                        >
                          {ct.name}
                        </a>
                        {' '}
                        <span style={{ opacity:.6 }}>— {ct.container_id}</span>
                      </div>
                      <div style={{ fontSize:12, opacity:.7 }}>
                        Tipo: {ct.type} • v{ct.version}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/containers/${encodeURIComponent(ct.container_id)}?tab=overview`)}
                      style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #000', background:'#f8fafc' }}
                    >
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Slide-over (aba lateral direita) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.25)',
            display:'grid', gridTemplateColumns:'1fr min(480px, 90vw)'
          }}
          onClick={()=> setOpen(false)}
        >
          <div />
          <div
            onClick={e=>e.stopPropagation()}
            style={{ background:'#fff', padding:20, borderLeft:'1px solid #e5e7eb' }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:700, fontSize:18 }}>Nova conta / contêiner</div>
              <button onClick={()=> setOpen(false)} style={{ fontSize:22, lineHeight:1 }}>×</button>
            </div>

            <div style={{ marginTop:16, display:'grid', gap:14 }}>
              <div>
                <div style={{ fontSize:13, marginBottom:6 }}>Nome da conta</div>
                <input
                  value={accName}
                  onChange={e=>setAccName(e.target.value)}
                  placeholder="Minha empresa"
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }}
                />
              </div>

              <div>
                <div style={{ fontSize:13, marginBottom:6 }}>Nome do contêiner</div>
                <input
                  value={ctName}
                  onChange={e=>setCtName(e.target.value)}
                  placeholder="Meu Contêiner"
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }}
                />
              </div>

              <div>
                <div style={{ fontSize:13, marginBottom:6 }}>Tipo do contêiner</div>
                <select
                  value={ctType}
                  onChange={e=>setCtType(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }}
                >
                  <option value="web">Web</option>
                  <option value="server">Server</option>
                </select>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button
                onClick={()=> setOpen(false)}
                style={{ padding:'8px 12px', borderRadius:8, background:'#f8fafc', border:'1px solid #000' }}
              >
                Cancelar
              </button>

              <button
                onClick={handleCreate}
                disabled={saving}
                style={{
                  padding:'8px 12px', borderRadius:8, background:'#0f172a', color:'#fff',
                  border:'1px solid #0f172a', opacity: saving ? .7 : 1
                }}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </STMLayout>
  );
}

// gera ids curtos
function rand(n) {
  return Math.random().toString(36).slice(2, 2 + n);
}
