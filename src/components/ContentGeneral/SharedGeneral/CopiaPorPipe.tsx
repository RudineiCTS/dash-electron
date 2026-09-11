import { useRef, useState } from "react";
import { Upload } from "lucide-react";

export interface LinhaImportada {
  idVendedor: number;
  cobertura: number;
  metaSetor: number;
  metaLojaVirtual: number;
}

interface ColarPlanilhaImportProps {
  onProcessarColagem: (linhas: LinhaImportada[]) => void;
  onUploadArquivo?: (arquivo: File) => void;
}

function parseNumeroBr(valor: string): number {
  return parseFloat(valor.trim().replace(/\./g, "").replace(",", "."));
}

function parseLinha(linha: string, indice: number): LinhaImportada {
  const colunas = linha.split("\t").map((c) => c.trim()).filter(Boolean);

  if (colunas.length < 4) {
    throw new Error(
      `Linha ${indice + 1}: esperado 4 colunas (ID Vendedor, Cobertura %, Meta Setor, Meta Loja Virtual), encontrado ${colunas.length}.`
    );
  }

  const [idVendedor, cobertura, metaSetor, metaLojaVirtual] = colunas;

  return {
    idVendedor: parseInt(idVendedor, 10),
    cobertura: parseNumeroBr(cobertura),
    metaSetor: parseNumeroBr(metaSetor),
    metaLojaVirtual: parseNumeroBr(metaLojaVirtual),
  };
}

export function ColarPlanilhaImport({
  onProcessarColagem,
  onUploadArquivo,
}: ColarPlanilhaImportProps) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const handleProcessar = () => {
    const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);

    if (linhas.length === 0) {
      setErro("Cole ao menos uma linha antes de processar.");
      return;
    }

    try {
      const linhasProcessadas = linhas.map(parseLinha);
      setErro(null);
      onProcessarColagem(linhasProcessadas);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao processar a colagem.");
    }
  };

  const handleUploadClick = () => {
    inputArquivoRef.current?.click();
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo && onUploadArquivo) {
      onUploadArquivo(arquivo);
    }
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-indigo-950">
        Colar da planilha
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Cole as colunas na ordem{" "}
        <span className="font-bold text-gray-700">
          ID Vendedor · Cobertura % · Meta Setor · Meta Loja Virtual
        </span>
        , separadas por tabulação.
      </p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={"1187\t82,5\t48000,00\t9500,00\n1204\t76,0\t42500,00\t8200,00"}
        rows={5}
        className="mt-3 w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none"
      />

      {erro && <p className="mt-2 text-sm font-medium text-red-600">{erro}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleProcessar}
          className="rounded-lg bg-indigo-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-900"
        >
          Processar colagem
        </button>

        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Upload size={14} strokeWidth={2} />
          Upload .xlsx
        </button>

        <input
          ref={inputArquivoRef}
          type="file"
          accept=".xlsx"
          onChange={handleArquivoSelecionado}
          className="hidden"
        />
      </div>
    </div>
  );
}