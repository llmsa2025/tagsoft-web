// pages/containers/[id]/variables.js
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import ContainerLayout, { Card } from '../../../components/ContainerLayout';
import { api } from '../../../lib/api';

// --- catálogo de variáveis incorporadas (MVP) ---
const BUILTIN_GROUPS = [
  {
    group: 'Páginas',
    items: [
      { id: 'page_url', label: 'Page URL' },
      { id: 'page_hostname', label: 'Page Hostname' },
      { id: 'page_path', label: 'Page Path' },
      { id: 'referrer', label: 'Referrer' },
    ],
  },
  {
    group: 'Utilitários',
    items: [
      { id: 'event', label: 'Event' },
      { id: 'environment_name', label: 'Environment Name' },
      { id: 'container_id', label: 'Container ID' },
      { id: 'container_version', label: 'Container Version' },
      { id: 'random_number', label: 'Random Number' },
      { id: 'html_id', label: 'HTML ID' },
    ],
  },
  {
    group: 'Cliques',
    items: [
      { id: 'click_element', label: 'Click Element' },
      { id: 'click_id', label: 'Click ID' },
      { id: 'click_target', label: 'Click Target' },
      { id: 'click_text', label: 'Click Text' },
      { id: 'click_url', label: 'Click URL' },
      { id: 'click_classes', label: 'Click Classes' },
    ],
  },
  {
    group: 'Rolagem',
    items: [{ id: 'scroll_depth_threshold', label: 'Scroll Depth Threshold' }],
  },
];

const TYPE_OPTIONS = [
  { value: 'data_layer', label: 'Variável da camada de dados' },
  { value: 'url', label: 'URL' },
  { value: 'constant', label: 'Constante' },
  { value: 'cookie', label: 'Cookie primário' },
  { value: 'event_param', label: 'Parâmetro de evento' },
  { value: 'dom_element', label: 'Elemento DOM' },
  { value: 'js_custom', label: 'JavaScript personalizado (armazenado)' }, // apenas armazenamos o código
];

const EMPTY_CONTAINER_EXTRAS = { builtin_vars: [], folders: [], models: [] };

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
      <h4 style={{ margin: 0 }}>{children}</h4>
      {right}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: '#eef2ff', marginRight: 6, marginBottom: 6, fontSize: 12 }}>
      {children}
    </span>
  );
}

export default function VariablesPage() {
  const { query } = useRouter();
  const cid = useMemo(() => query.id, [query.id]);

  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // builtins modal
  const [showBuiltins, setShowBuiltins] = useState(false);
  const [builtinsSel, setBuiltinsSel] = useState(new Set());

  // drawer nova/editar
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ name: '', type: '', config: {}, id: '' });
  const isEditing = editingIndex >= 0;

  const load = async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const data = await api(`/v1/containers/${encodeURIComponent(cid)}`);
      const merged = { ...EMPTY_CONTAINER_EXTRAS, ...data };
      merged.builtin_vars = Array.isArray(merged.builtin_vars) ? merged.builtin_vars : [];
      merged.variables = Array.isArray(merged.variables) ? merged.variables : [];
      setContainer(merged);
      setBuiltinsSel(new Set(merged.builtin_vars));
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [cid]);

  // ---- helpers ----
  const startNew = () => {
    setEditingIndex(-1);
    setForm({ id: `var_${Date.now()}`, name: '', type: '', config: {} });
    setDrawerOpen(true);
  };

  const startEdit = (idx) => {
    const v = container.variables[idx];
    setEditingIndex(idx);
    setForm({ id: v.id || `var_${idx}`, name: v.name || '', type: v.type || '', config: v.config || {} });
    setDrawerOpen(true);
  };

  const removeVar = (idx) => {
    if (!confirm('Excluir esta variável?')) return;
    const next = { ...container, variables: container.variables.filter((_, i) => i !== idx) };
    setContainer(next);
  };

  const saveDrawer = () => {
    if (!form.name || !form.type) {
      alert('Preencha Nome e Tipo.');
      return;
    }
    const v = { id: form.id || `var_${Date.now()}`, name: form.name, type: form.type, config: form.config || {} };
    const next = { ...container };
    if (isEditing) next.variables = next.variables.map((x, i) => (i === editingIndex ? v : x));
    else next.variables = [...next.variables, v];
    setContainer(next);
    setDrawerOpen(false);
    setEditingIndex(-1);
  };

  const persistAll = async () => {
    setSaving(true);
    try {
      const payload = { ...container, builtin_vars: Array.from(builtinsSel) };
      await api('/v1/containers', { method: 'PUT', body: JSON.stringify(payload) });
      alert('Alterações salvas!');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- UI de config por tipo (MVP) ----
  const ConfigFields = ({ type, value, onChange }) => {
    // value = objeto config; onChange(obj)
    if (type === 'data_layer') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Path no data layer</label>
          <input value={value.path || ''} onChange={(e) => onChange({ ...value, path: e.target.value })} placeholder="ex: user.id" />
        </div>
      );
    }
    if (type === 'url') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Parte da URL</label>
          <select value={value.part || ''} onChange={(e) => onChange({ ...value, part: e.target.value })}>
            <option value="">Selecione…</option>
            <option value="full">URL completa</option>
            <option value="host">Host</option>
            <option value="path">Path</option>
            <option value="query">Parâmetro (query)</option>
            <option value="fragment">Fragment</option>
          </select>
          {value.part === 'query' && (
            <>
              <label>Chave do parâmetro</label>
              <input value={value.key || ''} onChange={(e) => onChange({ ...value, key: e.target.value })} placeholder="utm_source" />
            </>
          )}
        </div>
      );
    }
    if (type === 'constant') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Valor</label>
          <input value={value.value || ''} onChange={(e) => onChange({ ...value, value: e.target.value })} placeholder="BR" />
        </div>
      );
    }
    if (type === 'cookie') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Nome do cookie</label>
          <input value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="_ga" />
        </div>
      );
    }
    if (type === 'event_param') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Chave do parâmetro</label>
          <input value={value.key || ''} onChange={(e) => onChange({ ...value, key: e.target.value })} placeholder="value" />
        </div>
      );
    }
    if (type === 'dom_element') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Seletor CSS</label>
          <input value={value.selector || ''} onChange={(e) => onChange({ ...value, selector: e.target.value })} placeholder="#btnComprar" />
          <label>Atributo</label>
          <input value={value.attr || ''} onChange={(e) => onChange({ ...value, attr: e.target.value })} placeholder="text | href | data-*" />
        </div>
      );
    }
    if (type === 'js_custom') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Código (armazenado, não executamos aqui)</label>
          <textarea
            value={value.code || ''}
            onChange={(e) => onChange({ ...value, code: e.target.value })}
            placeholder="return window.location.hostname;"
            style={{ height: 120, fontFamily: 'monospace' }}
          />
        </div>
      );
    }
    return <div style={{ opacity: 0.6 }}>Selecione um tipo para configurar…</div>;
  };

  // --- builtins Modal ---
  const BuiltinsModal = () => (
    <div
      onClick={() => setShowBuiltins(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '94vw', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Configurar variáveis incorporadas</h3>
          <button onClick={() => setShowBuiltins(false)} style={{ borderRadius: 10, padding: '6px 10px' }}>Fechar</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxHeight: '60vh', overflow: 'auto' }}>
          {BUILTIN_GROUPS.map((g) => (
            <div key={g.group} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
              <b>{g.group}</b>
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                {g.items.map((it) => {
                  const checked = builtinsSel.has(it.id);
                  return (
                    <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(builtinsSel);
                          if (e.target.checked) next.add(it.id);
                          else next.delete(it.id);
                          setBuiltinsSel(next);
                        }}
                      />
                      {it.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowBuiltins(false)} style={{ padding: '8px 12px', borderRadius: 10, background: '#eee' }}>Concluir</button>
        </div>
      </div>
    </div>
  );

  // --- Drawer ---
  const Drawer = () => (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff',
      borderLeft: '1px solid #e5e7eb', padding: 16, zIndex: 40, boxShadow: '-8px 0 24px rgba(0,0,0,.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{isEditing ? 'Editar variável' : 'Nova variável'}</h3>
        <button onClick={() => setDrawerOpen(false)} style={{ borderRadius: 10, padding: '6px 10px' }}>Fechar</button>
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        <label>Nome</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex.: cookie - FBP" />

        <label>Tipo</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, config: {} })}>
          <option value="">Selecione…</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />
        <b>Configuração</b>
        <ConfigFields
          type={form.type}
          value={form.config || {}}
          onChange={(cfg) => setForm({ ...form, config: cfg })}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={saveDrawer} style={{ padding: '8px 12px', borderRadius: 10, background: '#0f172a', color: '#fff' }}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </button>
          <button disabled title="Em breve" style={{ padding: '8px 12px', borderRadius: 10, background: '#eef2ff', opacity: .6, cursor: 'not-allowed' }}>
            Galeria (em breve)
          </button>
        </div>
      </div>
    </div>
  );

  // --- render ---
  return (
    <ContainerLayout cid={cid} active="variables">
      <Card
        title="Variáveis"
        right={<button onClick={persistAll} disabled={saving} style={{ padding: '6px 10px', borderRadius: 10, background: '#0f172a', color: '#fff', opacity: saving ? .7 : 1 }}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>}
      >
        {loading && <div style={{ opacity: .6 }}>Carregando…</div>}
        {!loading && container && (
          <>
            {/* Incorporadas */}
            <SectionTitle
              right={<button onClick={() => setShowBuiltins(true)} style={{ padding: '6px 10px', borderRadius: 10, background: '#eee' }}>Configurar</button>}>
              Variáveis incorporadas
            </SectionTitle>
            <div style={{ marginBottom: 8, fontSize: 13, opacity: .85 }}>
              Existem variáveis incorporadas disponíveis para muitas das configurações mais usadas de tags e acionadores. Depois de ativadas,
              elas podem ser usadas como variáveis definidas pelo usuário. <b>Observação:</b> as variáveis de parâmetro de evento só vão conter um valor quando
              forem usadas em uma tag disparada pelo evento correspondente do parâmetro.
            </div>
            <div style={{ marginBottom: 16 }}>
              {container.builtin_vars?.length
                ? container.builtin_vars.map((id) => <Pill key={id}>{id}</Pill>)
                : <span style={{ opacity: .6 }}>Nenhuma variável incorporada ativa.</span>}
            </div>

            {/* Definidas pelo usuário */}
            <SectionTitle
              right={
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="Pesquisar…" onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    const base = { ...container };
                    base._filter = q;
                    setContainer(base);
                  }} />
                  <button onClick={startNew} style={{ padding: '6px 10px', borderRadius: 10, background: '#e0f2fe' }}>Nova</button>
                </div>
              }
            >
              Variáveis definidas pelo usuário
            </SectionTitle>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Tipo</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Pasta</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Última edição</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(container.variables || [])
                    .filter(v => {
                      const f = (container._filter || '').trim().toLowerCase();
                      if (!f) return true;
                      return (v.name || '').toLowerCase().includes(f) || (v.type || '').toLowerCase().includes(f);
                    })
                    .map((v, i) => (
                      <tr key={v.id || i} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: '10px 12px' }}>{v.name || <span style={{ opacity: .6 }}>(sem nome)</span>}</td>
                        <td style={{ padding: '10px 12px' }}>{v.type || '-'}</td>
                        <td style={{ padding: '10px 12px' }}>{v.folder || 'Itens sem pasta'}</td>
                        <td style={{ padding: '10px 12px' }}>{v.updated_at ? new Date(v.updated_at).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button onClick={() => startEdit(i)} style={{ padding: '4px 8px', borderRadius: 8, background: '#eef2ff', marginRight: 6 }}>Editar</button>
                          <button onClick={() => removeVar(i)} style={{ padding: '4px 8px', borderRadius: 8, background: '#fee2e2' }}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  {(!container.variables || container.variables.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: 16, opacity: .6 }}>Nenhuma variável criada ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: .75 }}>
              Dica: “Pasta” será controlada na tela **Pastas**. Aqui mantemos o cadastro e a configuração da variável.
            </div>
          </>
        )}
      </Card>

      {showBuiltins && <BuiltinsModal />}
      {drawerOpen && <Drawer />}
    </ContainerLayout>
  );
}
