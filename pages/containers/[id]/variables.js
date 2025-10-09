// pages/containers/[id]/variables.js
// Tela de "Variáveis" do Container (estilo GTM, MVP)
// - Seção 1: Variáveis incorporadas (com modal "Configurar")
// - Seção 2: Variáveis definidas pelo usuário (lista + "Nova")
// Persistência:
//   - Lemos o container via GET /v1/containers/:id
//   - Gravamos o container inteiro via PUT /v1/containers,
//     atualizando os campos `builtin_vars` e `variables`.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ContainerLayout, { Card } from '../../../components/ContainerLayout';
import { api } from '../../../lib/api';

// ---------- UI helpers (componentes pequenos para Modal e Drawer) ----------
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.35)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }}>
      <div style={{ width:640, maxWidth:'92vw', background:'#fff', borderRadius:16, border:'1px solid #e5e7eb' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9', fontWeight:700 }}>{title}</div>
        <div style={{ padding:16 }}>{children}</div>
        <div style={{ padding:12, borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8 }}>
          {footer}
          <button onClick={onClose} style={{ padding:'6px 10px', borderRadius:10, background:'#eee' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, title, children, footer, width=560 }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', zIndex:50 }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,.35)' }} />
      <div style={{ width, maxWidth:'95vw', background:'#fff', borderLeft:'1px solid #e5e7eb' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9', fontWeight:700 }}>{title}</div>
        <div style={{ padding:16, height:'calc(100% - 96px)', overflow:'auto' }}>{children}</div>
        <div style={{ padding:12, borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:8 }}>
          {footer}
          <button onClick={onClose} style={{ padding:'6px 10px', borderRadius:10, background:'#eee' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Catálogo MVP de tipos de variável ----------
const VARIABLE_CATALOG = [
  {
    grupo: 'Navegação',
    itens: [
      { type: 'http_referrer', name: 'Referenciador de HTTP' },
      { type: 'url',           name: 'URL' },
    ],
  },
  {
    grupo: 'Variáveis de página',
    itens: [
      { type: 'first_party_cookie', name: 'Cookie primário' },
      { type: 'custom_js',          name: 'JavaScript personalizado' },
      { type: 'data_layer',         name: 'Variável da camada de dados' },
    ],
  },
  {
    grupo: 'Utilitários',
    itens: [
      { type: 'event_name',     name: 'Evento' },
      { type: 'random_number',  name: 'Número aleatório' },
      { type: 'container_id',   name: 'ID do contêiner' },
    ],
  },
];

// Conjunto de variáveis incorporadas (apenas flags on/off)
const BUILTIN_VARIABLES = [
  { id: 'page_url',      label: 'Page URL' },
  { id: 'page_host',     label: 'Page Hostname' },
  { id: 'page_path',     label: 'Page Path' },
  { id: 'referrer',      label: 'Referrer' },
  { id: 'event',         label: 'Event' },
  { id: 'container_id',  label: 'Container ID' },
  { id: 'container_ver', label: 'Container Version' },
  { id: 'random',        label: 'Random Number' },
  { id: 'html_id',       label: 'HTML ID' },
];

// ---------- Pequenos helpers visuais ----------
const label = { display:'block', fontSize:12, margin:'10px 0 4px', color:'#334155' };
const input = { width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:10, fontFamily:'inherit' };
const select = { ...input };
const textarea = { ...input, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight:120 };

// ---------- Formulário de configuração por tipo ----------
function TypeForm({ type, value, onChange }) {
  // value = objeto de configuração específico do tipo
  if (type === 'first_party_cookie') {
    return (
      <>
        <label style={label}>Nome do cookie</label>
        <input
          style={input}
          placeholder="ex.: _ga"
          value={value?.cookieName || ''}
          onChange={e=>onChange({ ...value, cookieName: e.target.value })}
        />
      </>
    );
  }

  if (type === 'custom_js') {
    return (
      <>
        <label style={label}>Código JavaScript</label>
        <textarea
          style={textarea}
          placeholder={`return document.title;`}
          value={value?.code || ''}
          onChange={e=>onChange({ ...value, code: e.target.value })}
        />
        <p style={{ fontSize:12, color:'#64748b', marginTop:6 }}>
          Dica: o código deve <b>retornar</b> o valor da variável.
        </p>
      </>
    );
  }

  if (type === 'data_layer') {
    return (
      <>
        <label style={label}>Nome da chave no dataLayer</label>
        <input
          style={input}
          placeholder="ex.: user.id"
          value={value?.key || ''}
          onChange={e=>onChange({ ...value, key: e.target.value })}
        />
      </>
    );
  }

  if (type === 'url') {
    return (
      <>
        <label style={label}>Componente da URL</label>
        <select
          style={select}
          value={value?.component || 'full'}
          onChange={e=>onChange({ ...value, component: e.target.value })}
        >
          <option value="full">Completa</option>
          <option value="host">Hostname</option>
          <option value="path">Path</option>
          <option value="query">Parâmetro de query</option>
        </select>
        {value?.component === 'query' && (
          <>
            <label style={label}>Nome do parâmetro</label>
            <input
              style={input}
              placeholder="ex.: utm_source"
              value={value?.param || ''}
              onChange={e=>onChange({ ...value, param: e.target.value })}
            />
          </>
        )}
      </>
    );
  }

  // Tipos sem config adicional (MVP)
  if (type === 'http_referrer' || type === 'event_name' || type === 'random_number' || type === 'container_id') {
    return <p style={{ fontSize:12, color:'#64748b' }}>Sem configurações adicionais.</p>;
  }

  return <p style={{ fontSize:12, color:'#ef4444' }}>Tipo de variável não suportado (MVP).</p>;
}

// ---------- Geração simples de IDs ----------
function slugify(s='') {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,'_')
    .replace(/^_+|_+$/g,'')
    .slice(0,64) || 'var';
}
function uid() { return Math.random().toString(36).slice(2,10); }

// ===================================================================================
//                                 PÁGINA PRINCIPAL
// ===================================================================================
export default function ContainerVariablesPage() {
  const router = useRouter();
  const { id } = router.query;

  // Estado do container e carregamento
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [container, setContainer] = useState(null);

  // Modal "Configurar variáveis incorporadas"
  const [openBuiltin, setOpenBuiltin] = useState(false);
  const builtinVars = container?.builtin_vars || {};
  const setBuiltinFlag = (key, val) =>
    setContainer(c => ({ ...c, builtin_vars: { ...(c?.builtin_vars||{}), [key]: !!val } }));

  // Drawer "Nova variável"
  const [openNew, setOpenNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newConfig, setNewConfig] = useState({});

  // Carrega container
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const c = await api(`/v1/containers/${encodeURIComponent(id)}`);
        // Garante campos no MVP
        c.variables = Array.isArray(c.variables) ? c.variables : [];
        c.builtin_vars = c.builtin_vars || {};
        setContainer(c);
      } catch (e) {
        alert(`Falha ao carregar contêiner: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Salva o container inteiro (PUT /v1/containers)
  const saveContainer = async (patch={}) => {
    if (!container) return;
    try {
      setSaving(true);
      const body = { ...container, ...patch };
      await api('/v1/containers', { method:'PUT', body: JSON.stringify(body) });
      setContainer(body);
      return true;
    } catch (e) {
      alert(`Erro ao salvar: ${e.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Ações: salvar incorporadas
  const persistBuiltin = async () => {
    const ok = await saveContainer();
    if (ok) setOpenBuiltin(false);
  };

  // Ações: criar/remover variável do usuário
  const addVariable = async () => {
    if (!newName || !newType) {
      alert('Informe "Nome" e selecione um "Tipo".');
      return;
    }
    const idBase = slugify(newName);
    const varId = `${idBase}_${uid()}`;

    const nova = {
      id: varId,
      name: newName,
      type: newType,
      config: newConfig || {},
      folder: null,
      updated_at: new Date().toISOString(),
    };

    const next = [...(container?.variables||[]), nova];
    const ok = await saveContainer({ variables: next });

    if (ok) {
      // limpa e fecha
      setNewName(''); setNewType(''); setNewConfig({});
      setOpenNew(false);
    }
  };

  const removeVariable = async (vid) => {
    if (!confirm('Remover esta variável?')) return;
    const next = (container?.variables||[]).filter(v => v.id !== vid);
    await saveContainer({ variables: next });
  };

  // Catálogo flatened (para busca local no drawer)
  const flatCatalog = useMemo(() => {
    return VARIABLE_CATALOG.flatMap(g => g.itens.map(i => ({ ...i, grupo: g.grupo })));
  }, []);

  // Render
  return (
    <ContainerLayout container={container} active="variaveis">
      <Card
        title="Variáveis incorporadas"
        right={<button onClick={()=>setOpenBuiltin(true)} style={{ padding:'6px 10px', borderRadius:10, background:'#eef2ff' }}>Configurar</button>}
      >
        <p style={{ marginTop:0, color:'#475569' }}>
          Existem variáveis incorporadas disponíveis para muitas das configurações mais usadas de tags e acionadores.
          Depois de ativadas, elas podem ser usadas como variáveis definidas pelo usuário.
        </p>

        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
        {!loading && (
          <ul style={{ margin:'8px 0 0 18px' }}>
            {BUILTIN_VARIABLES.map(b => (
              <li key={b.id} style={{ margin:'6px 0' }}>
                <span style={{ marginRight:8, display:'inline-block', width:10, height:10, borderRadius:999, background: builtinVars[b.id] ? '#16a34a' : '#cbd5e1' }} />
                {b.label}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Variáveis definidas pelo usuário"
        right={<button onClick={()=>setOpenNew(true)} style={{ padding:'6px 10px', borderRadius:10, background:'#e0f2fe' }}>Nova</button>}
      >
        {loading && <div style={{ opacity:.6 }}>Carregando…</div>}
        {!loading && (container?.variables||[]).length === 0 && (
          <div style={{ opacity:.7 }}>Nenhuma variável criada ainda.</div>
        )}

        {!loading && (container?.variables||[]).length > 0 && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ textAlign:'left', borderBottom:'1px solid #e5e7eb' }}>
                  <th style={{ padding:'10px 8px' }}>Nome</th>
                  <th style={{ padding:'10px 8px' }}>Tipo</th>
                  <th style={{ padding:'10px 8px' }}>Pasta</th>
                  <th style={{ padding:'10px 8px', width:80 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {(container?.variables||[]).map(v => (
                  <tr key={v.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 8px' }}>{v.name}</td>
                    <td style={{ padding:'10px 8px' }}>{v.type}</td>
                    <td style={{ padding:'10px 8px' }}>{v.folder || <span style={{ opacity:.6 }}>—</span>}</td>
                    <td style={{ padding:'10px 8px' }}>
                      <button onClick={()=>removeVariable(v.id)} style={{ padding:'6px 10px', borderRadius:8, background:'#fee2e2' }}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Configurar variáveis incorporadas */}
      <Modal
        open={openBuiltin}
        onClose={()=>setOpenBuiltin(false)}
        title="Configurar variáveis incorporadas"
        footer={
          <button onClick={persistBuiltin} disabled={saving} style={{ padding:'6px 10px', borderRadius:10, background:'#111', color:'#fff' }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        }
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {BUILTIN_VARIABLES.map(b => (
            <label key={b.id} style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
              <input
                type="checkbox"
                checked={!!builtinVars[b.id]}
                onChange={e=>setBuiltinFlag(b.id, e.target.checked)}
              />
              {b.label}
            </label>
          ))}
        </div>
      </Modal>

      {/* Drawer: Nova variável */}
      <Drawer
        open={openNew}
        onClose={()=>setOpenNew(false)}
        title="Nova variável"
        footer={
          <>
            <button disabled style={{ padding:'6px 10px', borderRadius:10, background:'#f1f5f9', cursor:'not-allowed' }}>
              Galeria (em breve)
            </button>
            <button onClick={addVariable} disabled={saving} style={{ padding:'6px 10px', borderRadius:10, background:'#111', color:'#fff' }}>
              {saving ? 'Salvando…' : 'Salvar variável'}
            </button>
          </>
        }
      >
        <label style={label}>Nome da variável</label>
        <input
          style={input}
          placeholder="ex.: cookieLeadEmail"
          value={newName}
          onChange={e=>setNewName(e.target.value)}
        />

        <label style={label}>Tipo da variável</label>
        <select
          style={select}
          value={newType}
          onChange={e=>{ setNewType(e.target.value); setNewConfig({}); }}
        >
          <option value="">— selecione —</option>
          {VARIABLE_CATALOG.map(g => (
            <optgroup key={g.grupo} label={g.grupo}>
              {g.itens.map(i => (
                <option key={i.type} value={i.type}>{i.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {newType && (
          <div style={{ marginTop:8 }}>
            <div style={{ fontWeight:700, margin:'10px 0 6px' }}>Configurações</div>
            <TypeForm type={newType} value={newConfig} onChange={setNewConfig} />
          </div>
        )}
      </Drawer>
    </ContainerLayout>
  );
}
