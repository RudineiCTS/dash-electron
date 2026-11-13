import { ConferenciaCampanha, opcoesDeColuna } from "../../../hook/useConferenciaCampanha";
import { PapelAba, ROTULO_PAPEL, SEM_COLUNA } from "../../../utils/conferenciaCampanha";

const estiloSelect =
  "h-10 w-full rounded-lg border border-other-border bg-other-card px-3 text-sm text-other-text outline-none focus:border-[#32307B]";

function SelectColuna({
  rotulo,
  dica,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string;
  dica: string;
  valor: number;
  opcoes: string[];
  onChange: (indice: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-other-muted">
      {rotulo}
      <select value={valor} onChange={(e) => onChange(Number(e.target.value))} className={estiloSelect}>
        <option value={SEM_COLUNA}>{dica}</option>
        {opcoes.map((texto, indice) => (
          <option key={indice} value={indice}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Uma caixa por aba da planilha: o papel (vendedores, supervisores, gerentes) e as colunas, já sugeridos pelo
 * nome da aba e pelo texto do cabeçalho. Aba sem dados ou sem a coluna de valor aparece destacada.
 */
export function MapeamentoColunas({ conferencia: c }: { conferencia: ConferenciaCampanha }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex w-56 flex-col gap-1.5 text-xs font-semibold text-other-muted">
        Tolerância da diferença (R$)
        <input
          type="number"
          min={0}
          step={0.01}
          value={c.tolerancia}
          onChange={(e) => c.setTolerancia(Math.max(0, Number(e.target.value) || 0))}
          className={estiloSelect}
        />
      </label>

      {c.abas.map((aba, indice) => {
        const colunas = opcoesDeColuna(aba);
        const semDados = aba.linhas.length <= aba.linhaCabecalho + 1;
        const semValor = aba.mapa.valor === SEM_COLUNA;

        return (
          <div
            key={aba.nome}
            className={`flex flex-col gap-3 rounded-lg border p-4 ${
              aba.incluir && (semDados || semValor)
                ? "border-other-orange/60 bg-other-orange/5"
                : "border-other-border bg-other-bg"
            }`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-bold text-other-text">
                <input
                  type="checkbox"
                  checked={aba.incluir}
                  onChange={(e) => c.alterarAba(indice, { incluir: e.target.checked })}
                />
                Aba &quot;{aba.nome}&quot;
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-other-muted">
                Conferir como
                <select
                  value={aba.papel}
                  onChange={(e) => c.alterarAba(indice, { papel: e.target.value as PapelAba })}
                  disabled={!aba.incluir}
                  className="h-9 rounded-lg border border-other-border bg-other-card px-3 text-sm text-other-text outline-none focus:border-[#32307B]"
                >
                  {(Object.keys(ROTULO_PAPEL) as PapelAba[]).map((papel) => (
                    <option key={papel} value={papel}>
                      {ROTULO_PAPEL[papel]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-other-muted">
                Linha do cabeçalho
                <input
                  type="number"
                  min={1}
                  value={aba.linhaCabecalho + 1}
                  onChange={(e) => c.alterarLinhaCabecalho(indice, Number(e.target.value) - 1)}
                  disabled={!aba.incluir}
                  className="h-9 w-20 rounded-lg border border-other-border bg-other-card px-3 text-sm text-other-text outline-none focus:border-[#32307B]"
                />
              </label>

              {semDados && <span className="text-xs font-semibold text-other-orange">Aba sem dados</span>}
            </div>

            {aba.incluir && !semDados && (
              <div className="grid gap-3 md:grid-cols-4">
                <SelectColuna
                  rotulo="ID da pessoa"
                  dica="Sem ID"
                  valor={aba.mapa.id}
                  opcoes={colunas}
                  onChange={(i) => c.alterarColuna(indice, "id", i)}
                />
                <SelectColuna
                  rotulo="Nome"
                  dica="Sem nome"
                  valor={aba.mapa.nome}
                  opcoes={colunas}
                  onChange={(i) => c.alterarColuna(indice, "nome", i)}
                />
                <SelectColuna
                  rotulo="Valor apurado"
                  dica="Escolha a coluna"
                  valor={aba.mapa.valor}
                  opcoes={colunas}
                  onChange={(i) => c.alterarColuna(indice, "valor", i)}
                />
                <SelectColuna
                  rotulo="Prêmio"
                  dica="Sem prêmio (vale 0)"
                  valor={aba.mapa.premio}
                  opcoes={colunas}
                  onChange={(i) => c.alterarColuna(indice, "premio", i)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
