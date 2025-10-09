// pages/accounts/new.js
// Tela "Criar conta" com criação de container acoplada.
// Fluxo: cria account -> cria container -> redireciona p/ /containers/:id

import { useState } from 'react';
import { useRouter } from 'next/router';
import STMLayout, { Card } from '../../components/STMLayout';
import { upsertAccount, upsertContainer } from '../../lib/api';

export default function NewAccountScreen() {
  const router = useRouter();

  // Formulário controlado
  const [accountName, setAccountName] = useState('');
  const [containerName, setContainerName] = useState('');
  const [containerType, setContainerType] = useState('web'); // web | server | ios | android
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;

    // Validações simples para evitar "name required"
    const accName = (accountName || '').trim();
    const ctName  = (containerName || '').trim();
    if (!accName) { alert('Informe o nome da conta.'); return; }
    if (!ctName)  { alert('Informe o nome do contêiner.'); return; }

    // Gera IDs "humanos" (MVP)
    const account_id   = `acc_${Math.random().toString(36).slice(2, 8)}`;
    const container_id = `ct_${Math.random().toString(36).slice(2, 10)}`;

    try {
      setSaving(true);

      // 1) Cria/atualiza a CONTA
      await upsertAccount({
        account_id,
        name: accName,
      });

      // 2) Cria o CONTÊINER vinculado
      await upsertContainer({
        container_id,
        account_id,
        name: ctName,
        type: containerType, // 'web' | 'server' | 'ios' | 'android' (no back, valide 'web'/'server' por ora)
        version: 1,
        // campos opcionais padronizados pelo back: variables/tags/triggers
      });

      // 3) Redireciona direto para a tela da container recém-criada
      router.replace(`/containers/${encodeURIComponent(container_id)}`);
    } catch (err) {
      alert(err?.message || 'Falha ao criar conta/contêiner.');
      setSaving(false);
    }
  }

  return (
    <STMLayout active="accounts">
      <Card
        title="Nova conta / contêiner"
        right={(
          <button
            onClick={() => router.push('/containers')}
            style={{ padding:'6px 10px', borderRadius:8, background:'#f1f5f9' }}
          >
            Cancelar
          </button>
        )}
      >
        <form onSubmit={handleSave} style={{ display:'grid', gap:14, maxWidth:560 }}>
          {/* Nome da conta */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontWeight:600 }}>Nome da conta</span>
            <input
              type="text"
              placeholder="Ex.: Minha empresa"
              value={accountName}
              onChange={(e)=>setAccountName(e.target.value)}
              required
              style={{
                padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8,
                outline:'none'
              }}
            />
          </label>

          {/* Nome do contêiner */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontWeight:600 }}>Nome do contêiner</span>
            <input
              type="text"
              placeholder="Ex.: Meu container Web"
              value={containerName}
              onChange={(e)=>setContainerName(e.target.value)}
              required
              style={{
                padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8,
                outline:'none'
              }}
            />
          </label>

          {/* Tipo do contêiner */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontWeight:600 }}>Tipo do contêiner</span>
            <select
              value={containerType}
              onChange={(e)=>setContainerType(e.target.value)}
              style={{
                padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8,
                background:'#fff'
              }}
            >
              <option value="web">Web</option>
              <option value="server">Server</option>
              <option value="ios" disabled>iOS (em breve)</option>
              <option value="android" disabled>Android (em breve)</option>
            </select>
          </label>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding:'10px 14px', borderRadius:10,
                background: saving ? '#cbd5e1' : '#e0f2fe',
                border:'1px solid #000', cursor: saving ? 'default' : 'pointer'
              }}
            >
              {saving ? 'Salvando…' : 'Criar conta e contêiner'}
            </button>

            <button
              type="button"
              onClick={()=>router.push('/containers')}
              style={{ padding:'10px 14px', borderRadius:10, background:'#f8fafc', border:'1px solid #e5e7eb' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Card>
    </STMLayout>
  );
}
