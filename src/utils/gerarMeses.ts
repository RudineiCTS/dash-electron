import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Últimos N meses, do mais recente para o mais antigo
export const gerarCompetencias = (quantidade: number): string[] =>
  Array.from({ length: quantidade }, (_, i) => {
    const data = dayjs().subtract(i, "month");
    return `${capitalizar(data.format("MMMM"))} / ${data.format("YYYY")}`;
  });

const MESES = Array.from({ length: 12 }, (_, i) =>
  dayjs().month(i).format("MMMM").toLowerCase()
);

export const capturaMesEscolhido =(competencia:string)=>{
    const [nomeMes, anoTexto]= competencia.split(" / ")

    const mes = MESES.indexOf(nomeMes.trim().toLowerCase()); // 0 a 11
    const ano = Number(anoTexto);
    
    if (mes === -1 || Number.isNaN(ano)) return null;

    const data = dayjs().year(ano).month(mes).startOf("month");

    return  {
        mes: mes + 1,                                          // 9
        ano,                                                   // 2026
        competencia: data.format("YYYYMM"),                    // "202609"
        dataInicio: data.format("YYYY-MM-DD"),                 // "2026-09-01"
        dataFim: data.endOf("month").format("YYYY-MM-DD"),     // "2026-09-30"
    }
}


// ["Setembro / 2026", "Agosto / 2026", "Julho / 2026", ...]