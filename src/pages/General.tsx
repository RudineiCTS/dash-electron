import { useState } from "react";
import MetaSelectionHeader from "../components/FieldSelectComponent";
import { HeaderComponent } from "../components/Header";
import { CenarioCopyPanel } from "../components/ContentGeneral/CopiaCenarios";

interface TabItem {
  id: number;
  label: string;
}
export const META_TABS: TabItem[] = [
  { id: 1, label: "Copiar cenário" },
  { id: 2, label: "Importar valores" },
  { id: 3, label: "Vendedores" },
  { id: 4, label: "Parâmetros da meta" },
  { id: 5, label: "Supervisor / Gerente" },
  { id: 6, label: "Histórico" },
];

export function General(){
    const [tabSelect, setTabSelect] = useState<TabItem>({ id: 1, label: "Copiar cenário"})
    return (
        <>
            <HeaderComponent
                title="Parametrização "
                subTitle="Cadastro de metas Televendas"
                legends="Metas de Televendas"
                observation="Configuração e gravação de metas de comissão por competência e tipo de pessoa · substitui o script manual"
            />
            <div className="mx-3 flex flex-col gap-4">
                <div className="bg-white flex flex-col gap-6">
                    <MetaSelectionHeader/>                
                    <nav className="flex items-center gap-2 border-b border-general-border px-6 py-2.5 justify-between">
                        {META_TABS.map((tab) => {
                            const isActive = tab.id === tabSelect?.id;
                            return (
                            <button
                                key={tab.id}
                                onClick={() => setTabSelect(tab)}
                                className={`flex items-center gap-2 border-b-2 px-2.5 py-2 ${
                                isActive ? "border-general-orange" : "border-transparent"
                                }`}
                            >
                                <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                    isActive
                                    ? "bg-general-indigo text-white"
                                    : "bg-general-badgeBg text-general-textMuted"
                                }`}
                                >
                                {tab.id}
                                </span>
                                <span
                                className={`text-sm ${
                                    isActive ? "font-bold text-general-textStrong" : "font-medium text-general-textMuted"
                                }`}
                                >
                                {tab.label}
                                </span>
                            </button>
                            );
                        })}
                    </nav>
                </div>
                {
                    tabSelect.id === 1 ? (
                        <CenarioCopyPanel
                            cenarios={[]}
                            onCopiar={()=>{}}
                        />
                    ):(<></>)
                }

            </div>
        </>
    )
}