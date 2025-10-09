// pages/_app.js
// Aplica o AppLayout globalmente.

import AppLayout from "../components/AppLayout";

export default function MyApp({ Component, pageProps }) {
  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}
