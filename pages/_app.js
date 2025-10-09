// pages/_app.js
import "@/styles.css";

export default function App({ Component, pageProps }) {
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#111827" }}>
      <div style={{ padding: 16, fontWeight: 800 }}>TagSoft — STM v1.0</div>
      <Component {...pageProps} />
      <div style={{ height: 24 }} />
    </div>
  );
}
