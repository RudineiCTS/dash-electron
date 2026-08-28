import { FiCompass } from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function InitialScreen() {
    const { userName } = useUser();

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#32307B]/10 flex items-center justify-center text-[#32307B]">
                    <FiCompass size={30} />
                </div>

                <h1 className="font-poppins text-2xl font-bold text-[#32307B]">
                    Bem-vindo, {userName}!
                </h1>

                <p className="text-sm text-gray-500">
                    Use o menu ao lado para acompanhar as campanhas rodando, consultar o painel avançado
                    e montar seus próprios relatórios.
                </p>
            </div>
        </div>
    );
}
