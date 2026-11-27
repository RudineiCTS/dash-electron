import type { AxiosInstance } from 'axios'

/**
 * MODO DEMO (só para apresentações, em ambiente local).
 *
 * Existe apenas quando o site é iniciado com VITE_MODO_DEMO=true (web/.env). Em produção essa variável não existe,
 * então o botão não aparece e nada aqui roda.
 *
 * O que faz: troca, nas respostas da API, os nomes de pessoas e de clientes, telefones, CPF/CNPJ e usuários do
 * Windows por dados inventados. A troca é sempre a mesma para o mesmo nome (a "Maria" do ranking é a mesma "Maria"
 * em todas as telas e no Excel). Os valores e as contas continuam os reais: só quem é "de quem" some.
 */
export const MODO_DEMO_DISPONIVEL = import.meta.env.VITE_MODO_DEMO === 'true'

const CHAVE = 'compass-web:modo-demo'

/** Ligado por padrão quando o recurso existe; o botão do topo desliga e liga (e recarrega a tela). */
export function modoDemoAtivo(): boolean {
  if (!MODO_DEMO_DISPONIVEL) return false
  try {
    return sessionStorage.getItem(CHAVE) !== 'off'
  } catch {
    return true
  }
}

export function alternarModoDemo() {
  try {
    sessionStorage.setItem(CHAVE, modoDemoAtivo() ? 'off' : 'on')
  } catch {
    // sem sessionStorage: continua como está
  }
  window.location.reload()
}

const NOMES = [
  'Ana', 'Beatriz', 'Camila', 'Daniela', 'Eduarda', 'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Juliana', 'Karina', 'Larissa',
  'Mariana', 'Natália', 'Olívia', 'Patrícia', 'Rafaela', 'Sabrina', 'Tatiana', 'Vanessa', 'Aline', 'Bruna', 'Carla', 'Débora',
  'André', 'Bruno', 'Caio', 'Diego', 'Eduardo', 'Felipe', 'Gustavo', 'Henrique', 'Igor', 'João', 'Leonardo', 'Marcelo',
  'Nicolas', 'Otávio', 'Paulo', 'Rafael', 'Rodrigo', 'Thiago', 'Vinícius', 'Wagner',
]
const SOBRENOMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henriques', 'Lima', 'Machado', 'Nogueira', 'Oliveira',
  'Pereira', 'Queiroz', 'Ribeiro', 'Santos', 'Teixeira', 'Vieira', 'Moura', 'Campos', 'Freitas', 'Araújo', 'Rocha', 'Batista',
  'Correia', 'Duarte', 'Fonseca', 'Guedes', 'Lopes', 'Martins', 'Nunes', 'Pinto', 'Ramos', 'Silva', 'Souza', 'Tavares',
]
const EMPRESAS_BASE = [
  'Drogaria', 'Farmácia', 'Droga', 'Farma', 'Drogarias', 'Pharma', 'Popular', 'Saúde', 'Vida', 'Bem Estar', 'Central', 'Nova',
]
const EMPRESAS_NOME = [
  'Aurora', 'Brasil', 'Cidade', 'Dom Pedro', 'Estrela', 'Fênix', 'Girassol', 'Horizonte', 'Ipê', 'Jardim', 'Lótus', 'Monte Verde',
  'Nova Era', 'Ouro Branco', 'Palmeiras', 'Quatro Rios', 'Real', 'Sol Nascente', 'Triunfo', 'União', 'Vitória', 'Bom Preço',
  'Santa Clara', 'São José', 'Boa Vista', 'Esperança', 'Praça Central', 'Alvorada', 'Primavera', 'Continental',
]
const EMPRESAS_FIM = ['LTDA', 'LTDA ME', 'EIRELI', 'S/A', 'COMERCIO DE MEDICAMENTOS LTDA', 'COMERCIAL LTDA']

/** Hash simples e estável (FNV-1a) do texto original. */
function hash(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const pick = <T,>(lista: readonly T[], n: number) => lista[n % lista.length]

function nomeDePessoa(original: string): string {
  const h = hash(original)
  const sobre2 = pick(SOBRENOMES, Math.floor(h / 7))
  const sobre1 = pick(SOBRENOMES, Math.floor(h / 131))
  return `${pick(NOMES, h)} ${sobre1}${sobre1 === sobre2 ? '' : ` ${sobre2}`}`
}

function nomeDeEmpresa(original: string): string {
  const h = hash(original)
  return `${pick(EMPRESAS_BASE, h)} ${pick(EMPRESAS_NOME, Math.floor(h / 13))} ${pick(EMPRESAS_FIM, Math.floor(h / 211))}`.toUpperCase()
}

function telefone(original: string): string {
  const h = hash(original)
  const d = (n: number, tam: number) => String(n % 10 ** tam).padStart(tam, '0')
  return `(11) 9${d(h, 4)}-${d(Math.floor(h / 10000), 4)}`
}

function documento(original: string): string {
  const h = hash(original)
  const d = (n: number, tam: number) => String(n % 10 ** tam).padStart(tam, '0')
  const soNumeros = original.replace(/\D/g, '')
  if (soNumeros.length <= 11) return `${d(h, 3)}.${d(Math.floor(h / 1000), 3)}.${d(Math.floor(h / 1e6), 3)}-${d(Math.floor(h / 1e3), 2)}`
  return `${d(h, 2)}.${d(Math.floor(h / 100), 3)}.${d(Math.floor(h / 1e5), 3)}/0001-${d(Math.floor(h / 1e3), 2)}`
}

const comoPessoa = (v: string) => nomeDePessoa(v)
const comoEmpresa = (v: string) => nomeDeEmpresa(v)
/** Nome sem tipo certo: os clientes do ERP vêm em MAIÚSCULAS; as pessoas, em formato de nome próprio. */
const comoQuiser = (v: string) => (v === v.toUpperCase() && /[A-Z]/.test(v) ? nomeDeEmpresa(v) : nomeDePessoa(v))

const POR_CHAVE: Record<string, (valor: string) => string> = {
  // pessoas (operadoras, supervisão, gerência, usuários)
  operatorname: comoPessoa,
  personname: comoPessoa,
  pessoa: comoPessoa,
  nomepessoa: comoPessoa,
  nomedigitador: comoPessoa,
  digitador: comoPessoa,
  nomevendedor: comoPessoa,
  nomevendedorvenda: comoPessoa,
  vendedor: comoPessoa,
  sellername: comoPessoa,
  nomegerente: comoPessoa,
  gerente: comoPessoa,
  managername: comoPessoa,
  supervisor: comoPessoa,
  supervisorname: comoPessoa,
  nomesupervisor: comoPessoa,
  nomeusuario: comoPessoa,
  username: comoPessoa,
  // clientes (farmácias e drogarias)
  nomecliente: comoEmpresa,
  clientname: comoEmpresa,
  razaosocial: comoEmpresa,
  legalname: comoEmpresa,
  // genéricos
  nome: comoQuiser,
  name: comoQuiser,
  // contato e documentos
  telefone: telefone,
  telefone2: telefone,
  cpfcnpj: documento,
  cnpjtrigger: documento,
  // usuário do Windows
  loginad: (v) => `usuario.${hash(v) % 1000}`,
}

/** Dentro de "telefones: [{ tipo, numero, principal }]" o número é o telefone. */
const POR_CHAVE_NO_PAI: Record<string, Record<string, (valor: string) => string>> = {
  telefones: { numero: telefone },
}

/** Quem está logado (resposta do login) continua com o nome real: é quem está apresentando. */
const NAO_MEXER_EM = new Set(['usuario'])

function anonimizar(valor: unknown, chavePai = ''): unknown {
  if (Array.isArray(valor)) return valor.map((v) => anonimizar(v, chavePai))
  if (valor && typeof valor === 'object') {
    const saida: Record<string, unknown> = {}
    for (const [chave, v] of Object.entries(valor as Record<string, unknown>)) {
      if (NAO_MEXER_EM.has(chave.toLowerCase())) {
        saida[chave] = v
        continue
      }
      const regra = POR_CHAVE_NO_PAI[chavePai.toLowerCase()]?.[chave.toLowerCase()] ?? POR_CHAVE[chave.toLowerCase()]
      if (regra && typeof v === 'string' && v.trim()) saida[chave] = regra(v)
      else saida[chave] = anonimizar(v, chave)
    }
    return saida
  }
  return valor
}

/** Liga o disfarce nas respostas dos clientes HTTP, se o modo demo estiver disponível e ligado. */
export function instalarModoDemo(clientes: AxiosInstance[]) {
  if (!modoDemoAtivo()) return
  for (const cliente of clientes) {
    cliente.interceptors.response.use((resposta) => {
      const tipo = String(resposta.headers?.['content-type'] ?? '')
      // o login e o "quem sou eu" (auth/...) ficam reais: é o nome de quem está apresentando
      const ehAuth = String(resposta.config?.url ?? '').startsWith('auth/')
      if (tipo.includes('application/json') && !ehAuth) resposta.data = anonimizar(resposta.data)
      return resposta
    })
  }
}
