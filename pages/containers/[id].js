// pages/containers/[id].js
import dynamic from "next/dynamic";

const ContainerScreen = dynamic(() => import("@/features/containers/ContainerScreen"), { ssr: false });

export default function ContainerById() {
  return <ContainerScreen />;
}
