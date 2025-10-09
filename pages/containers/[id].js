// pages/containers/[id].js
import ContainerScreen from '@/features/containers/ContainerScreen';

export default function ContainerPage() {
  // O ContainerScreen usa useRouter internamente para ler o id
  return <ContainerScreen />;
}
