import { useCallback, useRef, useState } from "react";
import { DynamicReportRequest, DynamicReportResponse } from "../interfaces/DynamicReport";
import { getDynamicReport } from "../services/dynamicReport";

export function useDynamicReport() {
    const [report, setReport] = useState<DynamicReportResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const abortRef = useRef<AbortController | undefined>(undefined);

    console.log(report)

    const generateReport = useCallback(async (request: DynamicReportRequest) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);
            setError("");
            const data = await getDynamicReport(request, controller.signal);
            console.log(data);
            setReport(data);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            setError(`Erro ao gerar o relatório dinâmico`);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        report,
        setReport,
        loading,
        error,
        setError,
        generateReport,
    };
}
