import { Field } from "./FieldComponent";

const fieldClass = `bg-[--input-bg] border border-[--input-border] text-[--input-text] placeholder-[--input-placeholder] 
rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:border-[--input-border-focus]`


interface InputProps {
    onChangeValue:()=>void,
    value:string,
    label:string
}
export default function Input(props:InputProps){
    return (
         <div className="flex flex-col gap-4 w-full">
            <Field label={props.label}>
              <input
                value={props.value}
                onChange={props.onChangeValue}
                className={fieldClass}
              />                            
            </Field>
        </div>
    )

}