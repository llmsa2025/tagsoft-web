// componentes/ContainerLayout.jsx
import Link from 'next/link';

export default function ContainerLayout({ cid, active = 'overview', children }) {
  const Item = ({ id, href, children }) => (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '10px 12px',
        borderRadius: 10,
        margin: '6px 0',
        background: active === id ? '#0f172a' : '#fff',
        color: active === id ? '#fff' : '#0f172a',
        textDecoration: 'none',
        border: '1px solid #e5e7eb',
      }}
    >
      {children}
    </Link>
  );

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 12, background: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Container</div>
          <Item id="overview"   href={`/containers/${cid}`}>Visão geral</Item>
          <Item id="tags"       href={`/containers/${cid}/tags`}>Tags</Item>
          <Item id="triggers"   href={`/containers/${cid}/triggers`}>Acionadores</Item>
          <Item id="variables"  href={`/containers/${cid}/variables`}>Variáveis</Item>
          <Item id="folders"    href={`/containers/${cid}/folders`}>Pastas</Item>
          <Item id="models"     href={`/containers/${cid}/models`}>Modelos</Item>
          <div style={{ height: 1, background: '#e5e7eb', margin: '10px 0' }} />
          <Item id="versions"   href={`/containers/${cid}/versions`}>Versões</Item>
          <Item id="admin"      href={`/containers/${cid}/admin`}>Administrador</Item>
        </aside>

        <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#fff' }}>
          {children}
        </section>
      </div>
    </main>
  );
}

export function Card({ title, right, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
