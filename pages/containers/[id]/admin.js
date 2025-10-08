// pages/containers/[id]/admin.js
import { useRouter } from 'next/router';
import ContainerLayout, { Card } from '../../../components/ContainerLayout';
export default function Admin() {
  const { query } = useRouter();
  return (
    <ContainerLayout cid={query.id} active="admin">
      <Card title="Administrador">MVP: permissões, import/export, links externos…</Card>
    </ContainerLayout>
  );
}
