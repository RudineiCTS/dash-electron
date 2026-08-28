import { ReactNode } from "react";
import { useUser } from "../context/UserContext";
import AccessBlocked from "../pages/AccessBlocked";
import OnboardingCarousel from "../pages/OnboardingCarousel";

interface AppGateProps {
    children: ReactNode;
}

export default function AppGate({ children }: AppGateProps) {
    const { loading, blocked, blockReason, hasSeenWelcome, retry } = useUser();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-other-bg">
                <p className="text-sm text-gray-400">Carregando o Compass...</p>
            </div>
        );
    }

    if (blocked) {
        return <AccessBlocked reason={blockReason} onRetry={retry} />;
    }

    if (!hasSeenWelcome) {
        return <OnboardingCarousel />;
    }

    return <>{children}</>;
}
