import { useEffect, useMemo, useState } from "react";
import { HeaderComponent } from "../components/Header";
import { TableComponent, TableRow } from "../components/ContentGeneral/SharedGeneral/TableComponent";
import { FieldSelect } from "../components/FieldSelectComponent";
import { useTelevendasDigitador } from "../hook/useTelevendasDigitador";

const list = [{ id: 0, name: "Grupo Televendas" }];
const listHeaders = [
    { id: 0, name: "ID Digitador" },
    { id: 1, name: "Nome" },
    { id: 2, name: "Grupo" },
    { id: 3, name: "SubGrupo" },
];
const TODOS = "Todos";

function opcoesDistintas(valores: (string | null)[]): string[] {
    const distintos = Array.from(new Set(valores.filter((v): v is string => !!v))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
    );
    return [TODOS, ...distintos];
}

interface CelulaTextoEditavelProps {
    valor: string;
    onCommit: (valor: string) => void;
    disabled?: boolean;
}

function CelulaTextoEditavel({ valor, onCommit, disabled = false }: CelulaTextoEditavelProps) {
    const [texto, setTexto] = useState(valor);

    useEffect(() => setTexto(valor), [valor]);

    return (
        <input
            value={texto}
            disabled={disabled}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={() => {
                if (texto !== valor) onCommit(texto);
            }}
            placeholder="-"
            className="w-full rounded-md border border-transparent px-2 py-1.5 text-sm text-gray-700 hover:border-gray-200
                       focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
    );
}

export function ParamTelesales() {
    const [tabActive, setTabActive] = useState(0);
    const [grupoTelevendas, setGrupoTelevendas] = useState<string>(TODOS);
    const [subGrupoTelevendas, setSubGrupoTelevendas] = useState<string>(TODOS);
    const { digitadores, loading, error, retry, salvarGrupo, salvandoId, salvarErro } = useTelevendasDigitador();

    const opcoesGrupo = useMemo(() => opcoesDistintas(digitadores.map((d) => d.grupo)), [digitadores]);
    const opcoesSubGrupo = useMemo(() => opcoesDistintas(digitadores.map((d) => d.subGrupo)), [digitadores]);

    const digitadoresFiltrados = useMemo(
        () =>
            digitadores.filter(
                (d) =>
                    (grupoTelevendas === TODOS || d.grupo === grupoTelevendas) &&
                    (subGrupoTelevendas === TODOS || d.subGrupo === subGrupoTelevendas)
            ),
        [digitadores, grupoTelevendas, subGrupoTelevendas]
    );

    const linhas: TableRow[] = useMemo(
        () =>
            digitadoresFiltrados.map((digitador) => ({
                key: digitador.idPessoa,
                cells: [
                    digitador.idPessoa ?? "-",
                    digitador.nomeUsuario ?? "-",
                    <CelulaTextoEditavel
                        valor={digitador.grupo ?? ""}
                        disabled={salvandoId === digitador.idPessoa}
                        onCommit={(valor) => salvarGrupo(digitador.idPessoa, valor, digitador.subGrupo ?? "")}
                    />,
                    <CelulaTextoEditavel
                        valor={digitador.subGrupo ?? ""}
                        disabled={salvandoId === digitador.idPessoa}
                        onCommit={(valor) => salvarGrupo(digitador.idPessoa, digitador.grupo ?? "", valor)}
                    />,
                ],
            })),
        [digitadoresFiltrados, salvandoId, salvarGrupo]
    );

    return (
        <>
            <HeaderComponent
                title="Parametros Gerais"
                subTitle="Digitador Televendas"
                legends="Parametros gerais de televendas"
                observation="Configuração de grupo de operadores e etc."
            />
            <div className="mx-3 flex flex-col gap-4 h-full pb-9">

            <div className="font-inter flex flex-col flex-wrap  gap-8 rounded-[10px] border border-general-cardBorder
                 border-t-[3px] border-t-general-accent bg-white px-6 py-[18px] mx-2">
                <div className="flex w-full">

                    <ul>
                        {list.map((item) => (
                            <li
                            key={item.id}
                            className={`flex  hover:border-other-orange hover:border-b-2 ${tabActive === item.id ? "border-other-orange border-b-2 p-2 flex " : "p-2 "}`}
                            onClick={() => setTabActive(item.id)}
                            >
                                {item.id === 0 && (
                                    <span className="bg-other-secondaryBlue text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 font-medium">
                                        1
                                    </span>
                                )}
                                <span  className={`${tabActive === item.id ? "" :  ""}`}
                                >
                                    {item.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    {tabActive === 0 && (
                        <div className="flex flex-col gap-4 w-full">
                            <p className="text-sm text-general-textMuted">Configuração de grupo de operadores e etc.</p>
                                <div className="flex gap-10">
                                    <FieldSelect
                                        label="Grupo"
                                        value={grupoTelevendas}
                                        onChange={setGrupoTelevendas}
                                        options={opcoesGrupo}
                                    />
                                    <FieldSelect
                                        label="SubGrupo"
                                        value={subGrupoTelevendas}
                                        onChange={setSubGrupoTelevendas}
                                        options={opcoesSubGrupo}
                                    />
                                </div>


                            {error && (
                                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                                    {error}
                                    <button
                                        type="button"
                                        onClick={retry}
                                        className="font-semibold underline cursor-pointer"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            )}

                            {salvarErro && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                                    {salvarErro}
                                </div>
                            )}

                            <TableComponent
                                listHeaders={listHeaders}
                                rows={linhas}
                                loading={loading}
                                mensagemVazio="Nenhum digitador de televendas encontrado."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    )
}
