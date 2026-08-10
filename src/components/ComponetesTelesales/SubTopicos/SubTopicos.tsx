interface SubTopicos{
    title:string;
    valueTopic:number
}
export function SubTopicos(data:SubTopicos){
    return (
        <div className="flex items-center gap-3">
            <div className="bg-other-secondaryBlue px-3 py-1 rounded-lg text-white">
                <h1>{data.valueTopic}</h1>
            </div>
            <div>
                <h1 className="text-other-secondaryBlue font-poppins font-medium text-xl text-nowrap">{data.title}</h1>                  
            </div>
                <div className="flex bg-other-border flex-1 h-[2px]"></div>
        </div>
    )
}