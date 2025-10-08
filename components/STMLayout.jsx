// components/STMLayout.jsx
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { API_URL, API_KEY, mask, health } from '../lib/api';

function NavItem({ href, label, icon, active, disabled }) {
  const base = {
    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', borderRadius: 10, border: '1px solid transparent',
    background: active ? '#0f172a' : 'transparent',
    color: active ? '#fff' : (disabled ? '#94a3b8' : '#0f172a'),
    fontWeight: active ? 600 : 500, cursor: disabled ? 'not-allowed' : 'pointer'
  };
  const inner = (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>{icon}</span><span>{label}</span>
    </span>
  );
  return disabled
    ? <div style={{ ...base }}>{inner}</div>
    : <Link href={href} style={{ ...base, textDecoration: 'none' }}>{inner}</Link>;
}

export default function STMLayout({ active, children }) {
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiError, setApiError] = useState('');
  const apiInfo = useMemo(() => ({ API_URL, API_KEY_MASKED: mask(API_KEY) }), []);

  useEffect(() => {
    (async () => {
      try { await health(); setApiHealthy(true); setApiError(''); }
      catch (e) { setApiHealthy(false); setApiError(e.message); }
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#0f172a' }}>
      {/* Topbar */}
      <header style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#111' }} />
          <div>
            <div style={{ fontWeight: 700 }}>TagSoft — STM v1.0</div>
            <div style={{ fontSize: 12, opacity: .7 }}>Workspace: Default</div>
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          API: <code>{apiInfo.API_URL}</code> — key: <code>{apiInfo.API_KEY_MASKED}</code> — status:{' '}
          {apiHealthy === null ? 'checando…' : apiHealthy ? '🟢 online' : '🔴 offline'}
          {!apiHealthy && apiError ? <span style={{ color: '#b00' }}> — {apiError}</span> : null}
        </div>
      </header>

      {/* Grid: sidebar + conteúdo */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <aside style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 8 }}>
          <NavItem href="/"               label="Visão geral"     icon="📋" active={active==='dashboard'} />
          <NavItem href="/containers"     label="Containers"      icon="🧩" active={active==='containers'} />
          <NavItem href="/accounts"       label="Contas"          icon="👤" active={active==='accounts'} disabled />
          <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '8px 0' }} />
          <NavItem href="/versions"       label="Versões"         icon="🗂️" active={active==='versions'} disabled />
          <NavItem href="/admin"          label="Administrador"   icon="⚙️" active={active==='admin'} disabled />
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

export function Card({ title, children, right }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
