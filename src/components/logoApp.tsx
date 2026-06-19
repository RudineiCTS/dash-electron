interface LogoAppProps{
    className?:string
}

export function LogoApp({className}:LogoAppProps){
    return(
        <div className={`flex justify-center m-auto ${className}`}>
                <span style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-4xl font-bold text-white tracking-tight">Cl</span>
                <span style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-4xl font-normal text-green-600 tracking-tight">audio</span>
            </div>
    )
}