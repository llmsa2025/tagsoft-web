// pages/index.js
// Lista de Contas (home). Botão "Criar conta" leva para /accounts/new.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import STMLayout, { Card } from '../components/STMLayout';
import { listAccounts } from '../lib/api';

export default function AccountsHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAccounts();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <STMLayout active="accounts">
      <Card
        title="Contas"
        right={
          // IMPORTANTE: agora é um Link para /accounts/new (nada de chamar API aqui)
          <Link href="/accounts/new" style={{ padding:'8px 12px', borderRadius:10, background:'#eef2ff', textDecoration:'none' }}>
            Criar conta
          </Link>
        }
      >
        {loading && <div style={{ opacity:.7 }}>Carregando…</div>}
        {!loading && items.length === 0 && (
          <div style={{ opacity:.7 }}>Nenhuma conta ainda. Crie a primeira.</div>
        )}

        {items.length > 0 && (
          <ul style={{ margin:0, paddingLeft:18 }}>
            {items.map(acc => (
              <li key={acc.account_id} style={{ marginTop:8 }}>
                {/* você pode criar uma página /accounts/[id] depois; por enquanto deixo sem link */}
                <b>{acc.name}</b> — <code>{acc.account_id}</code>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </STMLayout>
  );
}
