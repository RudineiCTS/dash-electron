import { useState } from "react";
import { FiBarChart2, FiCompass, FiTrendingUp } from "react-icons/fi";
import { useUser } from "../context/UserContext";

interface OnboardingStep {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function OnboardingCarousel() {
    const { userName, completeOnboarding } = useUser();
    const [stepIndex, setStepIndex] = useState(0);
    const [finishing, setFinishing] = useState(false);

    const steps: OnboardingStep[] = [
        {
            icon: <FiCompass size={28} />,
            title: `Bem-vindo ao Compass, ${userName}!`,
            description: "Seu painel para acompanhar campanhas comerciais e de televendas em um só lugar.",
        },
        {
            icon: <FiTrendingUp size={28} />,
            title: "Acompanhe suas campanhas",
            description: "Veja o desempenho das campanhas rodando, metas, realizado e premiação.",
        },
        {
            icon: <FiBarChart2 size={28} />,
            title: "Relatórios dinâmicos",
            description: "Monte suas próprias análises: escolha dimensões, métricas e filtros e gere o relatório na hora.",
        },
    ];

    const isLastStep = stepIndex === steps.length - 1;
    const current = steps[stepIndex];

    function handleNext() {
        if (!isLastStep) {
            setStepIndex((i) => i + 1);
            return;
        }
        handleFinish();
    }

    function handleBack() {
        setStepIndex((i) => Math.max(0, i - 1));
    }

    async function handleFinish() {
        if (finishing) return;
        setFinishing(true);
        await completeOnboarding();
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-other-bg px-4">
            <div className="flex flex-col items-center gap-6 text-center max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#32307B]/10 flex items-center justify-center text-[#32307B]">
                    {current.icon}
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="font-poppins text-xl font-semibold text-gray-800">{current.title}</h1>
                    <p className="text-sm text-gray-500">{current.description}</p>
                </div>

                <div className="flex items-center gap-2">
                    {steps.map((_, index) => (
                        <span
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${
                                index === stepIndex ? "w-6 bg-[#32307B]" : "w-1.5 bg-gray-200"
                            }`}
                        />
                    ))}
                </div>

                <div className="flex w-full gap-3">
                    {stepIndex > 0 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={finishing}
                        className="flex-1 h-10 rounded-lg bg-other-orange text-sm font-semibold text-white
                                   hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isLastStep ? (finishing ? "Entrando..." : "Começar") : "Próximo"}
                    </button>
                </div>
            </div>
        </div>
    );
}
