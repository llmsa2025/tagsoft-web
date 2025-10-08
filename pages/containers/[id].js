// pages/containers/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ContainerLayout, { Card } from '../../components/ContainerLayout'; // ajuste o caminho se usa "components"
import { api } from '../../lib/api';

export default function ContainerOverview() {
  const { query } = useRouter();
  const cid = query.id;
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (!cid) return;
    api(`/v1/containers/${encodeURIComponent(cid)}`)
      .then(setContainer)
      .catch(() => {});
  }, [cid]);

  return (
    <ContainerLayout cid={cid} active="overview">
      <Card title="Visão geral">
        {container ? (
          <>
            <div><b>Nome:</b> {container.name}</div>
            <div><b>ID:</b> {container.container_id}</div>
            <div><b>Versão:</b> {container.version}</div>
          </>
        ) : (
          <div>Carregando…</div>
        )}
      </Card>
    </ContainerLayout>
  );
}
