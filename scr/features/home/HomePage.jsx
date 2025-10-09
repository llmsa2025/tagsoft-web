import { useEffect, useState } from 'react';
import AccountList from '../accounts/AccountList';
import CreateAccountSlide from '../accounts/CreateAccountSlide';
import CreateContainerSlide from '../accounts/CreateContainerSlide';
import { listAccounts, listContainers } from '../../lib/api';

/**
 * HomePage — tela inicial (lista contas + criar conta/contêiner)
 */
export default function HomePage() {
  const [accounts, setAccounts] = useState([]);
  const [containers, setContainers] = useState([]);
  const [openAcc, setOpenAcc] = useState(false);
  const [openCt, setOpenCt] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const acc = await listAccounts();
      setAccounts(acc);
      // Carrega todos os contêineres (de todas contas) — simples para o MVP.
      const all = [];
      for (const a of acc) {
        const list = await listContainers({ account_id: a.account_id });
        all.push(...list);
      }
      setContainers(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const mapByAcc = accounts.reduce((m,a) => {
    m[a.account_id] = containers.filter(c => c.account_id === a.account_id);
    return m;
  }, {});

  return (
    <div style={{ maxWidth:1000, margin:'20px auto', padding:'0 16px' }}>
      {loading && <div style={{ opacity:.6, marginBottom:10 }}>Carregando…</div>}
      <AccountList
        accounts={accounts}
        containersByAccount={mapByAcc}
        onOpenCreateAccount={() => setOpenAcc(true)}
        onOpenCreateContainer={(acc) => { setCurrentAccount(acc); setOpenCt(true); }}
      />

      <CreateAccountSlide
        open={openAcc}
        onClose={() => { setOpenAcc(false); load(); }}
      />
      <CreateContainerSlide
        open={openCt}
        account={currentAccount}
        onClose={() => setOpenCt(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
