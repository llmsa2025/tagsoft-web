// components/ContainerLayout.jsx
// Layout de páginas internas do CONTÊINER (estilo GTM)
// Mostra o menu lateral: Visão geral, Tags, Acionadores, Variáveis, Pastas, Modelos, Versões, Administrador.
// Observação: reaproveitamos o <Card> do STMLayout para manter o mesmo visual.

import Link from 'next/link';
import { useRouter } from 'next/router';
import STMLayout, { Card } from './STMLayout';

export { Card };

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '14px 16px',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: active ? '#0f172a' : '#fff',
        color: active ? '#fff' : '#0f172a',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}

export default function ContainerLayout({ container, active, children }) {
  // Puxa o ID da rota para montar os links do menu
  const router = useRouter();
  const id = container?.container_id || router.query.id;

  return (
    <STMLayout active="containers">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Menu lateral do CONTÊINER */}
        <aside
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: 16,
            height: 'fit-content',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12 }}>
            {container?.name ? `${container.name} — v${container.version}` : 'Contêiner'}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <NavItem href={`/containers/${id}`} active={active === 'visao'}>
              Visão geral
            </NavItem>
            <NavItem href={`/containers/${id}/tags`} active={active === 'tags'}>
              Tags
            </NavItem>
            <NavItem href={`/containers/${id}/triggers`} active={active === 'acionadores'}>
              Acionadores
            </NavItem>
            <NavItem href={`/containers/${id}/variables`} active={active === 'variaveis'}>
              Variáveis
            </NavItem>
            <NavItem href={`/containers/${id}/folders`} active={active === 'pastas'}>
              Pastas
            </NavItem>
            <NavItem href={`/containers/${id}/models`} active={active === 'modelos'}>
              Modelos
            </NavItem>

            <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />

            <NavItem href={`/containers/${id}?tab=versions`} active={active === 'versoes'}>
              Versões
            </NavItem>
            <NavItem href={`/containers/${id}?tab=admin`} active={active === 'admin'}>
              Administrador
            </NavItem>
          </div>
        </aside>

        {/* Conteúdo da página específica */}
        <section>{children}</section>
      </div>
    </STMLayout>
  );
}
