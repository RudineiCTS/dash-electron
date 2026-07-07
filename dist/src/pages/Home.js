import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import dayjs from 'dayjs';
import { MdCampaign } from 'react-icons/md';
import { useState } from 'react';
import { campanhaDetalhe } from '../mock/campaign';
import { Carousel } from '../components/Carousel';
import { SideBarShowDetailsIten } from '../components/SideBarShowDetailsIten';
import { useCampaign } from '../hook/useCampaign';
import { getUltimoDiaDoMes } from '../utils/getLastDayInMonth';
export const items = [
    { key: 1, value: 'Campanha Televendas', icon: MdCampaign },
    { key: 2, value: 'Campanha Comercial', icon: MdCampaign },
];
const dataReferencia = dayjs()
    .subtract(1, 'month') // volta um mês
    .endOf('month') // vai pro último dia desse mês
    .format('YYYY-MM-DD');
export default function Home() {
    const meses = ["Abril", "Maio", "Junho", "Julho", "setembto"];
    const [ativo, setAtivo] = useState("Junho");
    const [date, setDate] = useState(dayjs(dataReferencia).format('YYYY-MM-DD'));
    const { campaigns, loading, error } = useCampaign(date);
    function handleCheckCampaign(e) {
        console.log(e);
    }
    function handleChangeMonthCampaign(e) {
        const year = dayjs().year();
        const data = getUltimoDiaDoMes(e, year);
        setDate(data);
    }
    return (_jsxs("div", { className: 'flex h-screen overflow-hidden', children: [_jsxs("section", { className: 'flex flex-col flex-1 mx-36  h-screen overflow-y-auto py-8', children: [_jsxs("div", { className: 'flex flex-col gap-6 mb-8 ', children: [_jsx("h1", { className: 'text-2xl font-bold text-github-text text-center', children: "Campanhas que chegaram!" }, void 0), _jsx("div", { className: 'self-center', children: _jsx("ul", { className: "flex gap-2 text-sm", children: meses.map((mes) => (_jsx("li", { onClick: () => handleChangeMonthCampaign(mes), className: `rounded-full px-4 py-1 border border-green-600 text-sm font-medium transition-all cursor-pointer
                  ${ativo === mes ? "bg-green-600 text-white" : "text-green-600 hover:bg-green-50"}`, children: mes }, mes))) }, void 0) }, void 0)] }, void 0), _jsx(Carousel, { cardItemList: campaigns, handleCheckCampaign: handleCheckCampaign }, 1)] }, void 0), _jsx(SideBarShowDetailsIten, { campaign: campanhaDetalhe }, void 0)] }, void 0));
}
//# sourceMappingURL=Home.js.map