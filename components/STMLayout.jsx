// components/STMLayout.js
// Layout base do app. Agora suporta noSidebar para telas em tela cheia.

import Link from 'next/link';

export function Card({ title, right, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ fontWeight:700 }}>{title}</div>
        {right}
      </div>
      <div style={{ padding:16 }}>{children}</div>
    </div>
  );
}

export default function STMLayout({ active, noSidebar = false, children }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: noSidebar ? '1fr' : '300px 1fr',
          gap: 24
        }}
      >
        {!noSidebar && (
          <aside style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
            <div style={{ fontWeight:700, marginBottom:12 }}>TagSoft — STM v1.0</div>
            <nav style={{ display:'grid', gap:10 }}>
              <Link href="/" legacyBehavior>
                <a style={linkStyle(active === 'dashboard')}>Visão geral</a>
              </Link>
              <Link href="/containers" legacyBehavior>
                <a style={linkStyle(active === 'containers')}>Containers</a>
              </Link>
              <Link href="/accounts" legacyBehavior>
                <a style={linkStyle(active === 'accounts')}>Contas</a>
              </Link>
              <Link href="/versions" legacyBehavior>
                <a style={linkStyle(active === 'versions')}>Versões</a>
              </Link>
              <Link href="/admin" legacyBehavior>
                <a style={linkStyle(active === 'admin')}>Administrador</a>
              </Link>
            </nav>
          </aside>
        )}

        <main>{children}</main>
      </div>
    </div>
  );
}

function linkStyle(active) {
  return {
    display:'block',
    padding:'12px 14px',
    border:'1px solid #e5e7eb',
    borderRadius:10,
    textDecoration:'none',
    color:'#0f172a',
    background: active ? '#0f172a' : '#fff',
    color: active ? '#fff' : '#0f172a',
    fontWeight:500
  };
}
