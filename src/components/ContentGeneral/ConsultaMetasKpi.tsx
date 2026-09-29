import { useMemo, useState } from "react";
import { TableComponent, TableRow } from "./SharedGeneral/TableComponent";
import { useComissaoTelevendasMetas } from "../../hook/useComissaoTelevendasMetas";
import { ComissaoTelevendasMetasDigitador } from "../../interfaces/ComissaoTelevendasMeta";



const listHeaders = [
    { id: 0, name: "Nome Digitador" },
    { id: 1, name: "ID Comissão Ven.Metas" },
    { id: 2, name: "ID T. Pessoa" },
    { id: 3, name: "Tipo Pessoa" },
    { id: 4, name: "Grupo" }
];

function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DetalheDigitador({ digitador }: { digitador: ComissaoTelevendasMetasDigitador }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100 text-xs font-bold uppercase tracking-wide text-gray-500">
                        <th className="px-3 py-2 text-left">Tipo Meta</th>
                        <th className="px-3 py-2 text-right">Valor</th>
                        <th className="px-3 py-2 text-center">Calcular</th>
                    </tr>
                </thead>
                <tbody>
                    {digitador.descricaoMetaTipo.map((descricao, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-none">
                            <td className="px-3 py-2 text-gray-700">{descricao ?? "-"}</td>
                            <td className="px-3 py-2 text-right font-medium text-gray-800">
                                {formatarMoeda(digitador.valor[index] ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700">
                                {digitador.calcular[index] ? "Sim" : "Não"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ConsultaMetasKpi() {
    const [idDigitado, setIdDigitado] = useState("103");
    const [idPeriodoCompetencia, setIdPeriodoCompetencia] = useState<number | null>(103);
    const [idPessoaExpandido, setIdPessoaExpandido] = useState<number | null>(null);
    const { comissaoTelevendasMetas, loading, error} = useComissaoTelevendasMetas(idPeriodoCompetencia);    
    const [termoAplicado, setTermoAplicado] = useState("");

    const agrupadoValor = useMemo<ComissaoTelevendasMetasDigitador[]>(() => {
        const mapa = new Map<number, ComissaoTelevendasMetasDigitador>();

        for (const meta of comissaoTelevendasMetas) {
            let pessoa = mapa.get(meta.idPessoa);

            if (!pessoa) {
                pessoa = {
                    idPessoa: meta.idPessoa,
                    usuarioDigitador: meta.usuarioDigitador,
                    nomeDigitador: meta.nomeDigitador,
                    idComissaoVendasMetaTipo: [],
                    descricaoMetaTipo: [],
                    valor: [],
                    calcular: [],
                };
                mapa.set(meta.idPessoa, pessoa);
            }

            pessoa.idComissaoVendasMetaTipo.push(meta.idComissaoVendasMetaTipo);
            pessoa.descricaoMetaTipo.push(meta.descricaoMetaTipo);
            pessoa.valor.push(meta.valor);
            pessoa.calcular.push(meta.calcular);
        }

        return [...mapa.values()];
    }, [comissaoTelevendasMetas]);

    const detalhesPorPessoa = useMemo(
        () => new Map(agrupadoValor.map((digitador) => [digitador.idPessoa, digitador])),
        [agrupadoValor]
    );

    const linhas = useMemo<TableRow[]>(() => {
        const mapa = new Map<number, TableRow>();

        for (const meta of comissaoTelevendasMetas) {
            if (mapa.has(meta.idPessoa)) continue;

            const digitador = detalhesPorPessoa.get(meta.idPessoa);

            mapa.set(meta.idPessoa, {
                key: meta.idPessoa,
                cells: [
                    meta.nomeDigitador ?? "-",
                    meta.idComissaoVendasMeta ?? "-",
                    meta.idComissaoVendasTipoPessoa ?? "-",
                    meta.descricaoTipoPessoa ?? "-",
                    meta.grupo ?? "-",
                ],
                conteudoExpandido: digitador ? <DetalheDigitador digitador={digitador} /> : undefined,
            });
        }

        return [...mapa.values()];
    }, [comissaoTelevendasMetas, detalhesPorPessoa]);

    const linhasFiltradas = useMemo(()=>{
        if(!termoAplicado) return linhas;

        return linhas.filter((row)=>
        row.cells.some((cell)=>
        String(cell ?? "").toLowerCase().includes(termoAplicado)))
    },[termoAplicado, linhas])
    

    const handleClickLinha = (key: string | number) => {
        const idPessoa = Number(key);
        setIdPessoaExpandido((prev) => (prev === idPessoa ? null : idPessoa));
    };
    const handleBuscar =(e:any)=>{
         setTermoAplicado(e);
    }


    return (
        <div className="flex flex-col gap-4 mx-4">
            <div className="flex items-end gap-3">
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-general-labelText">
                        ID Período de Competência
                    </span>
                    <input
                        type="number"
                        value={idDigitado}
                        onChange={(e) => setIdDigitado(e.target.value)}
                        className="h-10 w-48 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#dd8100]"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setIdPeriodoCompetencia(Number(idDigitado))}
                    className="h-10 rounded-lg bg-indigo-950 px-5 text-sm font-bold text-white hover:bg-indigo-900 cursor-pointer"
                >
                    Buscar
                </button>
                {idPeriodoCompetencia != null && (
                    <button
                        type="button"
                        onClick={()=>{}}
                        className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                        Recarregar
                    </button>
                )}
                <div className="flex gap-4">
                    <input 
                        type="text"
                        className="h-10 w-48 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#dd8100]"
                        onChange={(e)=> handleBuscar(e.target.value)}
                        value={termoAplicado}
                        />
                    <button className='h-10 rounded-lg bg-indigo-950 px-5 text-sm font-bold text-white hover:bg-indigo-900 cursor-pointer'>
                        Filtrar
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                </div>
            )}
            

            <TableComponent
                listHeaders={listHeaders}
                rows={linhasFiltradas ?? linhas}
                loading={loading}
                linhaExpandidaKey={idPessoaExpandido}
                onClickLinha={handleClickLinha}
                mensagemVazio={
                    idPeriodoCompetencia == null
                        ? "Informe um ID de período de competência e clique em Buscar."
                        : "Nenhuma meta encontrada para esse período."
                }
            />
        </div>
    );
}
