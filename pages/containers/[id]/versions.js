// pages/containers/[id]/versions.js
import { useRouter } from 'next/router';
import ContainerLayout, { Card } from '../../../components/ContainerLayout';
export default function Versions() {
  const { query } = useRouter();
  return (
    <ContainerLayout cid={query.id} active="versions">
      <Card title="Versões">MVP: aqui listaremos e publicaremos versões do container.</Card>
    </ContainerLayout>
  );
}
