// components/STMLayout.js
// Layout base. Quando hideSidebar=true, não renderiza o menu lateral
// e o conteúdo ocupa a largura toda.

import Link from 'next/link';
import { useRouter } from 'next/router';

export function Card({ title, right, children }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16
    }}>
      {(title || right) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          {title ? <div style={{ fontWeight:700 }}>{title}</div> : <div />}
          {right || null}
        </div>
      )}
      {children}
    </div>
  );
}

export default function STMLayout({
  children,
  active,            // "overview" | "containers" | "accounts" | "versions" | "admin"
  hideSidebar=false, // quando true, não mostra o menu lateral
}) {
  const router = useRouter();

  const NavLink = ({ href, label, id }) => {
    const isActive = active === id;
    return (
      <Link
        href={href}
        style={{
          display:'block', padding:'14px 16px', border:'1px solid #e5e7eb',
          borderRadius:10, background: isActive ? '#0f172a' : '#fff',
          color: isActive ? '#fff' : '#000', textDecoration:'none'
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div style={{ padding:'24px 20px' }}>
      <div style={{ fontWeight:700, marginBottom:12 }}>TagSoft — STM v1.0</div>

      <div style={{
        display:'grid',
        gridTemplateColumns: hideSidebar ? '1fr' : '320px 1fr',
        gap:20
      }}>
        {!hideSidebar && (
          <div style={{ alignSelf:'start', position:'sticky', top:20 }}>
            <div style={{ fontWeight:800, marginBottom:10 }}>TagSoft — STM v1.0</div>
            <div style={{ display:'grid', gap:12 }}>
              <NavLink id="overview"   href="/"            label="Visão geral" />
              <NavLink id="containers" href="/containers"  label="Containers" />
              <NavLink id="accounts"   href="/accounts"    label="Contas" />
              <NavLink id="versions"   href="/versions"    label="Versões" />
              <NavLink id="admin"      href="/admin"       label="Administrador" />
            </div>
          </div>
        )}

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
