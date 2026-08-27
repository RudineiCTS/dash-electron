import dayjs from 'dayjs';
import { MdCampaign } from 'react-icons/md'
import { OptionSide } from '../components/SideBar'
import { useMemo, useState } from 'react';
import { useCampaignRegistration } from '../hook/useCampaignRegistration';
import { getInicioDoMes, getFimDoMesISO } from '../utils/getLastDayInMonth'
import { CardCampaignReceived } from '../components/ComponetesTelesales/CardCampaignReceived/CardCampaignReceived';

export const items: OptionSide[] = [
  { key: 1, value: 'Campanha Televendas', icon: MdCampaign,status:'active'  },
  { key: 2, value: 'Campanha Comercial', icon: MdCampaign,status:'locked'  },
]

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
function getMesesDisponiveis(): string[] {
  const meses: string[] = [];
  for (let i = -2; i <= 2; i++) {
    meses.push(capitalizar(dayjs().add(i, 'month').format('MMMM')));
}
  return meses;
}
const mesAtual = capitalizar(dayjs().format('MMMM')); // "Agosto"
const anoAtual = dayjs().year();
const MESES_DISPONIVEIS =  getMesesDisponiveis();
const iconesSortidos = ['💎', '📢', '📣', '💊', '🛟', '🕋', '🏗️', '🗽', '🔥', '💈'];

export default function Home() {
  const [ativo, setAtivo] = useState(mesAtual);
  const [periodo, setPeriodo] = useState({
    inicio: getInicioDoMes(mesAtual, anoAtual),
    fim: getFimDoMesISO(mesAtual, anoAtual),
  });

  const filtroRegistro = useMemo(() => ({
    inclusionDateFrom: periodo.inicio,
    inclusionDateTo: periodo.fim,
  }), [periodo]);


  const { campaignRegistrations, loading, error } = useCampaignRegistration(filtroRegistro);

  function handleChangeMonthCampaign(mes: string) {
    setAtivo(mes);
    setPeriodo({
      inicio: getInicioDoMes(mes, anoAtual),
      fim: getFimDoMesISO(mes, anoAtual),
    });
  }

  function sortearIcone(): string {
    const indice = Math.floor(Math.random() * iconesSortidos.length);
    return iconesSortidos[indice];
  }


  return (
    <div className='flex h-screen overflow-hidden'>

      <section className='flex flex-col flex-1 mx-36  h-screen overflow-y-auto py-8'>
        <div className='flex flex-col gap-6 mb-8 '>
          <h1 className='text-2xl font-bold text-github-text text-center'>Campanhas que chegaram!</h1>
          <div className='self-center'>
            <ul className="flex gap-2 text-sm">
              {MESES_DISPONIVEIS.map((mes) => (
                <li
                key={mes}
                onClick={() => handleChangeMonthCampaign(mes)}
                className={`rounded-full px-4 py-1 border border-other-border text-sm font-medium transition-all cursor-pointer
                  ${ativo === mes ? "bg-github-text-linkAlt text-white" : "text-other-green hover:bg-green-50"}`}
                  >
                  {mes}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <main className='flex flex-col gap-10'>

          {error && (
            <p className='text-center text-sm text-red-500'>{error}</p>
          )}

          {loading ? (
            <p className='text-center text-sm text-other-muted'>Carregando campanhas...</p>
          ) : campaignRegistrations.length === 0 ? (
            <p className='text-center text-sm text-other-muted'>Nenhuma campanha recebida nesse período.</p>
          ) : (
            campaignRegistrations.map((campaign) => (
              <CardCampaignReceived key={campaign.idCampaign} campaign={campaign} icone={sortearIcone()} />
            ))
          )}

        </main>

      </section>

    </div>
  )
}
