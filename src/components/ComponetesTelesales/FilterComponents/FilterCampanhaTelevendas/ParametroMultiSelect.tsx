import React, { useEffect, useRef, useState } from "react";
import { useValorParametros } from "../../../../hook/useValorParametros";
import { ValorParametro } from "../../../../interfaces/ValorParametro";
import { getValorParametros } from "../../../../services/valorParametros";

interface ParametroMultiSelectProps {
  tipoParametro: string;
  label: string;
  placeholder?: string;
  /** ids separados por ";" (ex: "101;205") */
  value: string;
  onChange: (value: string) => void;
}

const inputClasses =
  "border border-gray-200 rounded-lg bg-white text-sm text-gray-800 " +
  "outline-none transition-colors focus-within:border-[#dd8100] focus-within:ring-2 focus-within:ring-[#dd8100]/15";

const ParametroMultiSelect: React.FC<ParametroMultiSelectProps> = ({
  tipoParametro,
  label,
  placeholder,
  value,
  onChange,
}) => {
  const { termo, setTermo, opcoes, loading } = useValorParametros(tipoParametro);
  const [selecionados, setSelecionados] = useState<ValorParametro[]>([]);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // resolve os ids iniciais (valoresIniciais) para o nome correspondente, uma única vez
  useEffect(() => {
    const idsIniciais = value
      .split(";")
      .map((v) => v.trim())
      .filter(Boolean)
      .map(Number)
      .filter((id) => !Number.isNaN(id));

    if (idsIniciais.length === 0) return;

    let cancelado = false;
    Promise.all(
      idsIniciais.map((id) =>
        getValorParametros({ tipoParametro, id })
          .then((resultado) => resultado[0] ?? { idValor: id, descricaoValor: `#${id}` })
          .catch(() => ({ idValor: id, descricaoValor: `#${id}` }))
      )
    ).then((resolvidos) => {
      if (!cancelado) setSelecionados(resolvidos);
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onChange(selecionados.map((s) => s.idValor).join(";"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecionados]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const opcoesDisponiveis = opcoes.filter(
    (opcao) => !selecionados.some((s) => s.idValor === opcao.idValor)
  );

  const adicionar = (opcao: ValorParametro) => {
    setSelecionados((prev) => [...prev, opcao]);
    setTermo("");
    setAberto(false);
  };

  const remover = (idValor: number) => {
    setSelecionados((prev) => prev.filter((s) => s.idValor !== idValor));
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5 min-w-[220px]">
      <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</label>

      <div className={`${inputClasses} flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5`}>
        {selecionados.map((s) => (
          <span
            key={s.idValor}
            className="flex items-center gap-1 rounded-md bg-[#dd8100]/10 px-2 py-1 text-xs font-medium text-[#dd8100]"
          >
            {s.descricaoValor}
            <button
              type="button"
              onClick={() => remover(s.idValor)}
              className="font-bold leading-none cursor-pointer"
              aria-label={`Remover ${s.descricaoValor}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={selecionados.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 border-none bg-transparent text-sm outline-none"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
        />
      </div>

      {aberto && termo && (
        <div className="absolute top-full left-0 z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400">Buscando...</div>
          ) : opcoesDisponiveis.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">Nenhum resultado</div>
          ) : (
            opcoesDisponiveis.map((opcao) => (
              <button
                key={opcao.idValor}
                type="button"
                onClick={() => adicionar(opcao)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer"
              >
                {opcao.descricaoValor}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ParametroMultiSelect;
