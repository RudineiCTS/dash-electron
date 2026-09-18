import { Dispatch, SetStateAction, useState } from "react";
import * as XLSX from "xlsx";
import { ColarPlanilhaImport, LinhaImportada } from "./SharedGeneral/CopiaPorPipe";
import { LinhaPreview, PreviewImportacao } from "./SharedGeneral/PreviewTableImportacao";

type CelulaPlanilha = string | number | null;

function paraNumero(valor: unknown): number {
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
        const numero = parseFloat(valor.trim().replace(/\./g, "").replace(",", "."));
        return isNaN(numero) ? 0 : numero;
    }
    return 0;
}

interface ImportarValoresProps {
    /** Estado do lote importado é mantido no General para alimentar o rodapé de metas em todas as abas. */
    linhas: LinhaPreview[];
    onLinhasChange: Dispatch<SetStateAction<LinhaPreview[]>>;
}

export function ImportarValores({ linhas, onLinhasChange }: ImportarValoresProps) {
    const [erro, setErro] = useState<string | null>(null);

    const handleProcessarColagem = (linhasColadas: LinhaImportada[]) => {
        setErro(null);
        onLinhasChange((prev) =>
            linhasColadas.map((linha) => ({
                idVendedor: linha.idVendedor,
                nome: prev.find((existente) => existente.idVendedor === linha.idVendedor)?.nome
                    ?? `#${linha.idVendedor}`,
                cobertura: linha.cobertura,
                metaSetor: linha.metaSetor,
                metaLojaVirtual: linha.metaLojaVirtual,
            }))
        );
    };

    const handleUploadArquivo = async (arquivo: File) => {
        try {
            const buffer = await arquivo.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const primeiraPlanilha = workbook.Sheets[workbook.SheetNames[0]];
            const [cabecalho, ...linhasDados] = XLSX.utils.sheet_to_json<CelulaPlanilha[]>(
                primeiraPlanilha,
                { header: 1, defval: null }
            );

            const indiceColuna = (nome: string) =>
                (cabecalho ?? []).findIndex(
                    (celula) => String(celula ?? "").trim().toUpperCase() === nome
                );

            const idxId = indiceColuna("IDDIGITADOR");
            const idxNome = indiceColuna("NOME");
            const idxCobertura = indiceColuna("COBERTURA");
            const idxSetor = indiceColuna("SETOR");
            const idxVirtual = indiceColuna("VIRTUAL");

            if ([idxId, idxNome, idxCobertura, idxSetor, idxVirtual].includes(-1)) {
                setErro(
                    "Colunas esperadas não encontradas. O arquivo deve conter IDDigitador, NOME, COBERTURA, SETOR e VIRTUAL."
                );
                return;
            }

            const linhasProcessadas: LinhaPreview[] = linhasDados
                .filter((linha) => linha[idxId] != null && linha[idxId] !== "")
                .map((linha) => ({
                    idVendedor: paraNumero(linha[idxId]),
                    nome: String(linha[idxNome] ?? "").trim(),
                    cobertura: paraNumero(linha[idxCobertura]),
                    metaSetor: paraNumero(linha[idxSetor]),
                    metaLojaVirtual: paraNumero(linha[idxVirtual]),
                }));

            if (linhasProcessadas.length === 0) {
                setErro(
                    "Nenhuma linha válida encontrada. O arquivo deve conter as colunas IDDigitador, NOME, COBERTURA, SETOR e VIRTUAL."
                );
                return;
            }

            setErro(null);
            onLinhasChange(linhasProcessadas);
        } catch {
            setErro("Não foi possível ler o arquivo. Verifique se é um .xlsx válido.");
        }
    };

    const handleAlterarCelula = (
        idVendedor: number,
        campo: "cobertura" | "metaSetor" | "metaLojaVirtual",
        valor: number
    ) => {
        onLinhasChange((prev) =>
            prev.map((linha) =>
                linha.idVendedor === idVendedor ? { ...linha, [campo]: valor } : linha
            )
        );
    };

    return (
        <div className="flex flex-col gap-4 pb-3">
            <div>
                <ColarPlanilhaImport
                    onProcessarColagem={handleProcessarColagem}
                    onUploadArquivo={handleUploadArquivo}
                />
            </div>

            {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}

            {linhas.length > 0 && (
                <PreviewImportacao
                    linhas={linhas}
                    onAlterarCelula={handleAlterarCelula}
                    onDescartarImportacao={() => onLinhasChange([])}
                />
            )}
        </div>
    );
}
