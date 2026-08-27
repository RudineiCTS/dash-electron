import trafficCone from '../public/traffic-cone-svgrepo-com.svg';

export default function InBuild() {
    return(
        <div className="h-full flex items-center justify-center">

            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <img
                src={trafficCone}
                alt="Em construção"
                width={140}
                height={140}
                className="w-[140px] h-[140px]"
            />

            <h2 className="text-lg font-semibold text-[#32307B]">
                Essa página ainda está em construção
            </h2>
            <p className="text-sm text-gray-500 max-w-xs">
                Estamos trabalhando para trazer essa funcionalidade em breve. Volte mais tarde!
            </p>
            </div>

        </div>
    )
}