interface ModalConfirmarInsercaoProps {
  nomeScript: string;
  idCampanha: string;
  linhas: number;
  dataCompetencia: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalConfirmarInsercao({
  nomeScript,
  idCampanha,
  linhas,
  dataCompetencia,
  onConfirmar,
  onCancelar,
}: ModalConfirmarInsercaoProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-other-card p-6 shadow-2xl">
        <h2 className="text-lg font-extrabold text-other-text">Inserir na resultado?</h2>
        <p className="text-sm text-other-muted">
          Vão ser gravadas <strong className="text-other-text">{linhas} linhas</strong> em
          tblCampanhaComercialResultado, da campanha <strong className="text-other-text">{idCampanha}</strong> (
          {nomeScript}), competência <strong className="text-other-text">{dataCompetencia}</strong>. Depois disso o
          script não poderá mais ser alterado nem executado de novo.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="h-10 rounded-lg border border-other-border px-4 text-sm font-semibold text-other-text transition-colors hover:bg-other-hoverbg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="h-10 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 cursor-pointer"
          >
            Inserir
          </button>
        </div>
      </div>
    </div>
  );
}
