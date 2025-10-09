// pages/containers/[id]/index.js
// Visão geral do contêiner (usa ContainerLayout)
// Mostra um resumo simples do contêiner só para validar o layout.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ContainerLayout, { Card } from '../../components/ContainerLayout';
import { api } from '../../lib/api';

export default function ContainerOverviewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const c = await api(`/v1/containers/${encodeURIComponent(id)}`);
        c.variables = Array.isArray(c.variables) ? c.variables : [];
        c.triggers = Array.isArray(c.triggers) ? c.triggers : [];
        c.tags = Array.isArray(c.tags) ? c.tags : [];
        setContainer(c);
      } catch (e) {
        alert(`Falha ao carregar contêiner: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <ContainerLayout container={container} active="visao">
      <Card title="Visão geral">
        {loading && <div style={{ opacity: .6 }}>Carregando…</div>}
        {!loading && (
          <div>
            <div><b>ID:</b> {container?.container_id}</div>
            <div><b>Nome:</b> {container?.name}</div>
            <div><b>Versão:</b> {container?.version}</div>
            <div style={{ marginTop: 8 }}>
              <b>Resumo</b>
              <ul>
                <li>Variáveis: {container?.variables?.length ?? 0}</li>
                <li>Tags: {container?.tags?.length ?? 0}</li>
                <li>Acionadores: {container?.triggers?.length ?? 0}</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </ContainerLayout>
  );
}
