interface InputComponentProps{
    description:string;

}

export function InputComponent({description}:InputComponentProps){
    return (
        <div className="flex flex-col  bg-[#10171f] border border-white/[0.07] rounded-md px-4 py-2">
            <span className="text-[10px] tracking-widest text-white/40 uppercase">
                {description}
            </span>
            <input type="search"  className="text-github-text bg-transparent w-full px-2 " />
            
        </div>
    )
}

