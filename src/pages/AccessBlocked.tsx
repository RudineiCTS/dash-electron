import { FiLock, FiRefreshCw } from "react-icons/fi";

interface AccessBlockedProps {
    reason: string;
    onRetry: () => void;
}

export default function AccessBlocked({ reason, onRetry }: AccessBlockedProps) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-other-bg px-4">
            <div className="flex flex-col items-center gap-4 text-center max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <FiLock size={26} className="text-red-500" />
                </div>

                <h1 className="font-poppins text-lg font-semibold text-gray-800">
                    Acesso ao Compass bloqueado
                </h1>

                <p className="text-sm text-gray-500">{reason}</p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#32307B] text-white text-sm font-semibold
                               hover:brightness-110 active:brightness-95 cursor-pointer"
                >
                    <FiRefreshCw size={14} />
                    Tentar novamente
                </button>
            </div>
        </div>
    );
}
