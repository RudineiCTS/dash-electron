/** Etiqueta do grupo do operador (Prospecção, Fidelização, Exclusiva, SAC). */
export interface EtiquetaGrupo {
  label: string
  /** Classes de cor (fundo translúcido + texto), legíveis no tema claro e no escuro. */
  classe: string
}

const SEM_GRUPO = 'bg-github-bg-hover text-github-text-muted'

function normaliza(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function etiquetaGrupo(grupo?: string | null, subGrupo?: string | null): EtiquetaGrupo {
  const g = grupo?.trim()
  if (!g) return { label: 'Sem grupo', classe: SEM_GRUPO }

  const sub = subGrupo?.trim()
  const label = sub && normaliza(sub) !== normaliza(g) ? `${g} · ${sub}` : g

  const k = normaliza(g)
  if (k.startsWith('prosp')) return { label, classe: 'bg-[#378ADD]/15 text-[#378ADD]' }
  if (k.startsWith('fidel')) return { label, classe: 'bg-[#639922]/15 text-[#639922]' }
  if (k.startsWith('exclu')) return { label, classe: 'bg-[#7F77DD]/15 text-[#7F77DD]' }
  if (k.startsWith('sac')) return { label, classe: 'bg-[#BA7517]/15 text-[#BA7517]' }
  // Grupo novo (sem cor fixa): cor estável escolhida pelo nome, para o mesmo grupo ter sempre a mesma cor
  return { label, classe: PALETA_EXTRA[hash(k) % PALETA_EXTRA.length] }
}

/** Cores para grupos cadastrados depois, diferentes das quatro fixas acima. */
const PALETA_EXTRA = [
  'bg-[#1D9E75]/15 text-[#1D9E75]', // teal
  'bg-[#D4537E]/15 text-[#D4537E]', // rosa
  'bg-[#D85A30]/15 text-[#D85A30]', // coral
  'bg-[#0F8EA0]/15 text-[#0F8EA0]', // ciano
  'bg-[#9C6B3D]/15 text-[#9C6B3D]', // marrom
  'bg-[#7A8B1E]/15 text-[#7A8B1E]', // oliva
]

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
