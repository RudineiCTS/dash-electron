const sectionLabel =
  "text-[10px] font-semibold tracking-widest text-other-muted uppercase";

const fieldLabel =
  "text-[10px] font-medium tracking-widest text-other-muted uppercase";

const fieldControl =
  "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-3 py-2.5 text-sm text-[var(--input-text)] outline-none transition-colors focus:border-[var(--input-border-focus)]";

interface TargetControlProps{
    objetivo:number,
    tetoPremiacao:number,
    periodicidadeApuracao:string,
    prioridade:number
}

export function TargetControl(props:TargetControlProps){
    
    
function formatCurrencyInput(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

    return(
        <section className="rounded-lg border border-other-border p-5">
          <h3 className={`${sectionLabel} mb-4`}>
            Objetivo e controle
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Objetivo (R$)</label>
              <input
                className={fieldControl}
                value={formatCurrencyInput(props.objetivo)}
                // onChange={(e) =>
                //   setForm((f) => ({
                //     ...f,
                //     objetivo: Number(
                //       e.target.value.replace(/\D/g, "")
                //     ),
                //   }))
                // }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Teto de premiação (R$)</label>
              <input
                className={fieldControl}
                value={formatCurrencyInput(props.tetoPremiacao)}
                //onChange={(e) =>
                //   setForm((f) => ({
                //     ...f,
                //     tetoPremiacao: Number(
                //       e.target.value.replace(/\D/g, "")
                //     ),
                //   }))
                // }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>Prioridade / desempate</label>
              <select
                className={fieldControl}
                value={props.prioridade}
                // onChange={(e) =>
                //   setForm((f) => ({ ...f, prioridade: e.target.value }))
                // }
              >
                <option value="1">1 — alta</option>
                <option value="2">2 — média</option>
                <option value="3">3 — baixa</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel}>
                Periodicidade da apuração
              </label>
              <select
                className={fieldControl}
                value={props.periodicidadeApuracao}
                // onChange={(e) =>
                //   setForm((f) => ({
                //     ...f,
                //     periodicidadeApuracao: e.target.value,
                //   }))
                // }
              >
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
              </select>
            </div>
          </div>
        </section>
    )
}