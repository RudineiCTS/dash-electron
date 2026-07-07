import dayjs from 'dayjs';
const MESES = {
    janeiro: 0,
    fevereiro: 1,
    março: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
};
export function getUltimoDiaDoMes(nomeMes, ano) {
    const mesNormalizado = nomeMes.toLowerCase().trim();
    const mesIndex = MESES[mesNormalizado];
    if (mesIndex === undefined) {
        throw new Error(`Mês inválido: "${nomeMes}"`);
    }
    const anoReferencia = ano ?? dayjs().year();
    return dayjs()
        .year(anoReferencia)
        .month(mesIndex)
        .endOf('month')
        .format('DD/MM/YYYY');
}
//# sourceMappingURL=getLastDayInMonth.js.map