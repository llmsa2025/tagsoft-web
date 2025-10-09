// components/AppLayout.jsx
// Layout global simples para toda a aplicação.
// Mantém topo com o nome do produto e um wrapper central.

import Link from "next/link";
import { useRouter } from "next/router";

export default function AppLayout({ children }) {
  const router = useRouter();
  const atHome = router.pathname === "/" || router.pathname.startsWith("/accounts");

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Topbar */}
      <header style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, background: "#111", borderRadius: 3 }} />
          <Link href="/" style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}>
            TagSoft — STM v1.0
          </Link>
        </div>

        {/* Ações rápidas (opcional) */}
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", color: atHome ? "#111" : "#444" }}>
            Contas
          </Link>
          {/* Se quiser um item futuro: <a style={{ color:"#bbb" }}>Tags do Google</a> */}
        </nav>
      </header>

      {/* Área de conteúdo */}
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>
        {children}
      </main>
    </div>
  );
}
