
type PublicoTarget = "televendas" | "supervisor";

const sectionLabel =
  "text-[10px] font-semibold tracking-widest text-other-muted uppercase";

const fieldLabel =
  "text-[10px] font-medium tracking-widest text-other-muted uppercase";

const fieldControl =
  "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2.5 text-sm text-[var(--input-text)] outline-none transition-colors focus:border-[var(--input-border-focus)]";

// const statusStyles: Record<CampaignConfigData["status"], string> = {
//   ATIVA: "bg-emerald-100 text-emerald-700",
//   INATIVA: "bg-other-badge text-other-muted",
//   ENCERRADA: "bg-red-100 text-red-600",
// };

const PUBLICO_OPTIONS: { key: PublicoTarget; label: string }[] = [  
  { key: "supervisor", label: "Supervisor" },  
  { key: "televendas", label: "Televendas" },
];

interface PublicTargetProps{
    premiados:string[]
}
export function PublicTarget(props:PublicTargetProps){
    return (
        <section className="rounded-lg border border-other-border p-5">
          <h3 className={`${sectionLabel} mb-4`}>
            Público e abrangência
          </h3>

          <label className={`${fieldLabel} mb-2 block`}>
            Quem é premiado
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {PUBLICO_OPTIONS.map((option) => {
              const isSelected = props.premiados.includes(option.key);
              return (
                <button
                  key={option.key}
                  onClick={() => console.log(option.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--accent-strong)] text-[var(--accent-strong-text)]"
                      : "bg-other-badge text-other-muted"
                  }`}
                >
                  {option.label}
                  {isSelected && " ✓"}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Filiais</label>
              <select
                className={fieldControl}
                value={'geral'}
                // onChange={(e) =>
                //   setForm((f) => ({ ...f, filiais: e.target.value }))
                // }
              >
                <option value="todas">Todas (7 filiais)</option>
                <option value="parcial">Selecionar filiais</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Canal</label>
              <select
                className={fieldControl}
                value={'1'}
                // onChange={(e) =>
                //   setForm((f) => ({ ...f, canal: e.target.value }))
                // }
              >
                <option value="forca_televendas">
                  Força de venda + Televendas
                </option>
                <option value="forca">Força de venda</option>
                <option value="televendas">Televendas</option>
              </select>
            </div>
          </div>
        </section>
    )
}