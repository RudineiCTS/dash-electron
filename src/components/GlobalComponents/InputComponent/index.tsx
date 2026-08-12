import { Field } from "./FieldComponent";

const styles = {
  fieldClass: `bg-[--input-bg] border border-[--input-border] text-[--input-text] placeholder-[--input-placeholder] 
rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:border-[--input-border-focus]`,
  fieldClassAlternative: `h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm font-semibold text-[#32307b] outline-none transition-colors cursor-pointer focus:border-[#32307b] focus:ring-2 focus:ring-[#32307b]/10`,
} as const;

type StyleTypeField = keyof typeof styles; // 'fieldClass' | 'fieldClassAlternative'

interface InputProps {
  onChangeValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  label: string;
  typeStyle?: StyleTypeField;
}

export default function Input({ label, onChangeValue, value, typeStyle = 'fieldClass' }: InputProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Field label={label}>
        <input
          value={value}
          onChange={onChangeValue}
          className={styles[typeStyle]} // resolve a chave pra classe CSS real
        />
      </Field>
    </div>
  );
}