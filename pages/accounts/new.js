// pages/accounts/new.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import STMLayout, { Card } from '../../components/STMLayout';
import { upsertAccount, upsertContainer } from '../../lib/api';

// —— helpers (internos) ——
// Gera um id curto legível. Ex.: "acc_x7a2k9"
function shortId(prefix = 'id') {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}

// Slug simples p/ montar container_id a partir do nome
function slugify(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export default function AccountCreatePage() {
  const router = useRouter();

  // —— estado do formulário ——
  const [accountName, setAccountName] = useState('');
  const [country, setCountry] = useState('Brasil');     // apenas informativo (MVP)
  const [shareData, setShareData] = useState(false);    // checkbox ilustrativa

  const [containerName, setContainerName] = useState('');
  const [containerType, setContainerType] = useState('web'); // 'web' | 'server' (MVP)

  const [saving, setSaving] = useState(false);

  // —— submit: cria conta e depois o contêiner ——
  const handleCreate = async () => {
    // Validações simples
    if (!accountName.trim()) {
      alert('Informe o nome da conta.');
      return;
    }
    if (!containerName.trim()) {
      alert('Informe o nome do contêiner.');
      return;
    }

    setSaving(true);
    try {
      // 1) Cria a conta (o back aceita criar sem account_id)
      const accPayload = {
        // Comentário: campos mínimos do MVP
        account_id: undefined,     // criação: sem id; atualização: com id
        name: accountName.trim(),
        country: country || 'Brasil',
        share_data: !!shareData,
      };
      const accRes = await upsertAccount(accPayload);
      const accountId = accRes?.account_id || shortId('acc');

      // 2) Cria o contêiner inicial ligado à conta
      const baseId = slugify(containerName) || 'container';
      const containerId = `${baseId}_${shortId('ct')}`; // garante unicidade e legibilidade

      const ctPayload = {
        container_id: containerId,
        name: containerName.trim(),
        version: 1,
        account_id: accountId,
        type: containerType, // 'web' ou 'server'
        variables: [],
        triggers: [],
        tags: [],
      };
      await upsertContainer(ctPayload);

      // 3) Vai para a tela do contêiner
      router.push(`/containers/${encodeURIComponent(containerId)}`);
    } catch (e) {
      alert(e?.message || 'Erro ao criar conta/contêiner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <STMLayout active="accounts">
      <Card
        title="Adicionar uma nova conta"
        // Comentário: ação secundária volta para lista de contas
        right={<Link href="/" style={{ textDecoration:'none', padding:'6px 10px', borderRadius:8, background:'#eee' }}>Voltar</Link>}
      >
        {/* Seção: Configuração da conta */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin:'8px 0 12px' }}>Configuração da conta</h3>

          <div style={{ display:'grid', gap:12, maxWidth: 520 }}>
            <label style={{ display:'grid', gap:6 }}>
              <span>Nome da conta</span>
              <input
                type="text"
                placeholder="Exemplo: Minha empresa"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                style={{ padding:'10px 12px', border:'1px solid #ddd', borderRadius:10 }}
              />
            </label>

            <label style={{ display:'grid', gap:6 }}>
              <span>País</span>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{ padding:'10px 12px', border:'1px solid #ddd', borderRadius:10 }}
              >
                {/* Comentário: lista curta só para ilustração (MVP) */}
                <option>Brasil</option>
                <option>Portugal</option>
                <option>Estados Unidos</option>
              </select>
            </label>

            <label style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input
                type="checkbox"
                checked={shareData}
                onChange={e => setShareData(e.target.checked)}
              />
              <span>Compartilhar dados de forma anônima (opcional)</span>
            </label>
          </div>
        </div>

        {/* Seção: Configuração do contêiner */}
        <div style={{ marginTop: 18 }}>
          <h3 style={{ margin:'8px 0 12px' }}>Configuração do contêiner</h3>

          <div style={{ display:'grid', gap:12, maxWidth: 520 }}>
            <label style={{ display:'grid', gap:6 }}>
              <span>Nome do contêiner</span>
              <input
                type="text"
                placeholder="por exemplo: www.meusite.com"
                value={containerName}
                onChange={e => setContainerName(e.target.value)}
                style={{ padding:'10px 12px', border:'1px solid #ddd', borderRadius:10 }}
              />
            </label>

            <div style={{ display:'grid', gap:8 }}>
              <span>Plataforma segmentada</span>

              {/* Apenas Web e Server no MVP. Os demais podem ser adicionados depois. */}
              <div style={{ display:'grid', gap:8 }}>
                <label style={radioStyle(containerType === 'web')}>
                  <input
                    type="radio"
                    name="containerType"
                    checked={containerType === 'web'}
                    onChange={() => setContainerType('web')}
                  />
                  <div>
                    <div style={{ fontWeight:600 }}>Web</div>
                    <div style={{ opacity:.7, fontSize:13 }}>
                      Para uso em computadores e páginas da Web para disparos.
                    </div>
                  </div>
                </label>

                <label style={radioStyle(containerType === 'server')}>
                  <input
                    type="radio"
                    name="containerType"
                    checked={containerType === 'server'}
                    onChange={() => setContainerType('server')}
                  />
                  <div>
                    <div style={{ fontWeight:600 }}>Server</div>
                    <div style={{ opacity:.7, fontSize:13 }}>
                      Para instrumentação e mensuração no lado do servidor.
                    </div>
                  </div>
                </label>

                {/* Exemplos (desabilitados por enquanto) */}
                <label style={radioStyle(false, true)}>
                  <input type="radio" disabled />
                  <div>
                    <div style={{ fontWeight:600 }}>iOS</div>
                    <div style={{ opacity:.7, fontSize:13 }}>Para uso em apps iOS (em breve).</div>
                  </div>
                </label>

                <label style={radioStyle(false, true)}>
                  <input type="radio" disabled />
                  <div>
                    <div style={{ fontWeight:600 }}>Android</div>
                    <div style={{ opacity:.7, fontSize:13 }}>Para uso em apps Android (em breve).</div>
                  </div>
                </label>

                <label style={radioStyle(false, true)}>
                  <input type="radio" disabled />
                  <div>
                    <div style={{ fontWeight:600 }}>AMP</div>
                    <div style={{ opacity:.7, fontSize:13 }}>Accelerated Mobile Pages (em breve).</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ marginTop: 20, display:'flex', gap:10 }}>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              padding:'10px 14px', borderRadius:12, border:'1px solid #111', background:'#111', color:'#fff'
            }}
          >
            {saving ? 'Criando…' : 'Criar'}
          </button>

          <Link
            href="/"
            style={{ padding:'10px 14px', borderRadius:12, border:'1px solid #ddd', background:'#f6f6f6', textDecoration:'none' }}
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </STMLayout>
  );
}

// —— estilo de “cartão selecionável” para os rádios ——
function radioStyle(active, disabled = false) {
  return {
    display:'flex',
    gap:10,
    alignItems:'flex-start',
    padding:'10px 12px',
    borderRadius:12,
    border: active ? '1px solid #111' : '1px solid #ddd',
    background: disabled ? '#fafafa' : '#fff',
    opacity: disabled ? .6 : 1,
    pointerEvents: disabled ? 'none' : 'auto'
  };
}
