// pages/index.js
import dynamic from "next/dynamic";

// Import dinâmico para separar o bundle de features
const HomePage = dynamic(() => import("@/features/home/HomePage"), { ssr: false });

export default function Index() {
  return <HomePage />;
}
