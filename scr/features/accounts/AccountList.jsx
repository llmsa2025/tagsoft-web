import Link from 'next/link';

/**
 * Lista de contas + containers.
 * - Mostra botão "Abrir" por container
 * - Mostra botão "Novo contêiner" no cabeçalho da conta
 * - Emite callbacks para abrir slides (criar conta e criar container)
 */
export default function AccountList({
  accounts = [],
  containersByAccount = {},
  onOpenCreateAccount,
  onOpenCreateContainer,
}) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ fontSize:28, fontWeight:700 }}>Contas</h1>
        <button
          onClick={onOpenCreateAccount}
          style={{ padding:'8px 14px', borderRadius:12, background:'#e9d5ff', border:'1px solid #d8b4fe', cursor:'pointer' }}
        >
          Criar conta
        </button>
      </div>

      {accounts.map((acc) => {
        const items = containersByAccount[acc.account_id] || [];
        return (
          <section key={acc.account_id}
            style={{ border:'1px dashed #e5e7eb', borderRadius:14, padding:14, marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontWeight:600 }}>
                <span>Minha empresa</span>
                <span style={{ opacity:.55 }}> — {acc.account_id}</span>
              </div>
              <button
                onClick={() => onOpenCreateContainer(acc)}
                style={{ padding:'6px 12px', borderRadius:10, background:'#eef2ff', border:'1px solid #c7d2fe', cursor:'pointer' }}
              >
                Novo contêiner
              </button>
            </div>

            {items.length === 0 && (
              <div style={{ opacity:.65 }}>Nenhum contêiner ainda.</div>
            )}

            {items.map((ct) => (
              <div key={ct.container_id}
                   style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                            padding:'12px 14px', border:'1px solid #eee', borderRadius:10, marginTop:8 }}>
                <div>
                  <div style={{ fontWeight:700, color:'#6b21a8' }}>
                    <Link href={`/containers/${encodeURIComponent(ct.container_id)}`}>
                      {ct.name}
                    </Link>
                    <span style={{ marginLeft:8, opacity:.6 }}>— {ct.container_id}</span>
                  </div>
                  <div style={{ fontSize:12, opacity:.7, marginTop:2 }}>
                    Tipo: {ct.type} • v{ct.version}
                  </div>
                </div>
                <Link
                  href={`/containers/${encodeURIComponent(ct.container_id)}`}
                  style={{ padding:'6px 12px', borderRadius:10, background:'#ede9fe',
                           border:'1px solid #ddd6fe', textDecoration:'none' }}
                >
                  Abrir
                </Link>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
