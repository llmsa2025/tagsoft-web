import { useState } from 'react';
import { useRouter } from 'next/router';
import { upsertAccount, upsertContainer } from '../../lib/api';
import { required } from '../../lib/validation';

/**
 * Slide para criar Conta + 1º Contêiner.
 * Ao salvar: cria conta, cria container e redireciona para /containers/:id
 */
export default function CreateAccountSlide({ open, onClose }) {
  const router = useRouter();
  const [name, setName] = useState('Minha empresa');
  const [containerName, setContainerName] = useState('Meu Container');
  const [type, setType] = useState('web');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    try {
      setSaving(true);
      required(name, 'Informe o nome da conta');
      required(containerName, 'Informe o nome do contêiner');

      const account_id = 'acc_' + Math.random().toString(36).slice(2, 8);
      await upsertAccount({ account_id, name });

      const container_id = 'ct_' + Math.random().toString(36).slice(2, 8);
      await upsertContainer({
        container_id,
        account_id,
        name: containerName,
        type: type || 'web',
        version: 1,
      });

      onClose?.();
      router.push(`/containers/${container_id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside style={styles.aside}>
      <div style={styles.panel}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <b>Nova conta / contêiner</b>
          <button onClick={onClose} style={styles.xbtn}>×</button>
        </div>

        <label style={styles.label}>Nome da conta</label>
        <input style={styles.input} value={name} onChange={e=>setName(e.target.value)} />

        <label style={styles.label}>Nome do contêiner</label>
        <input style={styles.input} value={containerName} onChange={e=>setContainerName(e.target.value)} />

        <label style={styles.label}>Tipo do contêiner</label>
        <select style={styles.input} value={type} onChange={e=>setType(e.target.value)}>
          <option value="web">Web</option>
          <option value="server">Server</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>

        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button onClick={onClose} style={styles.btnGhost}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={styles.btnPrimary}>
            {saving ? 'Salvando…' : 'Salvar e abrir'}
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  aside: {
    position:'fixed', inset:0, background:'rgba(0,0,0,.25)', display:'flex', justifyContent:'flex-end', zIndex:50
  },
  panel: {
    width:380, background:'#fff', height:'100%', padding:16, boxShadow:'-8px 0 20px rgba(0,0,0,.08)'
  },
  xbtn: { background:'transparent', border:'none', fontSize:22, cursor:'pointer' },
  label: { display:'block', fontSize:12, opacity:.7, marginTop:10, marginBottom:4 },
  input: { width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8 },
  btnGhost: { padding:'8px 12px', borderRadius:10, background:'#f3f4f6', border:'1px solid #e5e7eb' },
  btnPrimary: { padding:'8px 12px', borderRadius:10, background:'#e9d5ff', border:'1px solid #d8b4fe', cursor:'pointer' },
};
