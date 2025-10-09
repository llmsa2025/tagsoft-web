// src/features/containers/ContainerScreen.jsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getContainer, listContainers } from "@/lib/api";
import ContainerHeader from "@/features/containers/ContainerHeader";
import ContainerTabs from "@/features/containers/ContainerTabs";
import ContainerOverview from "@/features/containers/ContainerOverview";

/**
 * Tela da container:
 * - Carrega dados da container (pelo :id)
 * - Carrega containers da mesma conta para o dropdown
 * - Controla as abas via query param `tab`
 */
export default function ContainerScreen() {
  const router = useRouter();
  const containerId = router.query.id?.toString();

  const [container, setContainer] = useState(null);
  const [siblings, setSiblings] = useState([]); // containers da mesma conta
  const [loading, setLoading] = useState(false);

  const activeTab = (router.query.tab?.toString() || "overview");
  const tabs = useMemo(() => ([
    { key: "overview", label: "Visão geral" },
    { key: "tags", label: "Tags" },
    { key: "triggers", label: "Acionadores" },
    { key: "variables", label: "Variáveis" },
    { key: "folders", label: "Pastas" },
    { key: "templates", label: "Modelos" },
    { key: "versions", label: "Versões" },
    { key: "admin", label: "Administrador" },
  ]), []);

  useEffect(() => {
    if (!containerId) return;
    (async () => {
      setLoading(true);
      try {
        const c = await getContainer(containerId);
        setContainer(c);
        if (c?.account_id) {
          const list = await listContainers({ account_id: c.account_id });
          setSiblings(list || []);
        }
      } catch (e) {
        alert(e.message || "Erro ao carregar container");
      } finally {
        setLoading(false);
      }
    })();
  }, [containerId]);

  function goBack() {
    // volta para a página de contas unificada
    router.push("/accounts");
  }

  function changeTab(key) {
    router.push({
      pathname: `/containers/${encodeURIComponent(containerId)}`,
      query: { tab: key },
    }, undefined, { shallow: true });
  }

  function selectContainer(newId) {
    router.push(`/containers/${encodeURIComponent(newId)}?tab=${activeTab}`);
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <ContainerHeader
          currentContainer={container}
          containers={siblings.length ? siblings : (container ? [container] : [])}
          onBack={goBack}
          onSelectContainer={selectContainer}
        />
      </div>

      <ContainerTabs tabs={tabs} active={activeTab} onChange={changeTab} />

      <div style={{ marginTop: 12 }}>
        {loading && <div style={{ opacity: .6 }}>Carregando…</div>}

        {!loading && activeTab === "overview" && (
          <ContainerOverview container={container} />
        )}

        {!loading && activeTab !== "overview" && (
          <div style={placeholder}>
            <b>{tabs.find(t => t.key === activeTab)?.label}</b>
            <div style={{ opacity: .7, marginTop: 6 }}>
              (Layout placeholder — conectaremos quando modelarmos os dados.)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const placeholder = {
  border: "1px dashed #e5e7eb",
  borderRadius: 12,
  padding: 24,
  background: "#fafafa",
};
