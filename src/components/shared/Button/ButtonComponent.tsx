import React from 'react';

export type ButtonVariant = 'primario' | 'secundario';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** Texto exibido no botão */
  label: string;
  /** Ícone exibido antes do texto (qualquer componente de ícone, ex: lucide-react) */
  icon?: React.ReactNode;
  /** 'primario' = fundo azul | 'secundario' = fundo branco com borda pontilhada */
  variant?: ButtonVariant;
  /** Classe extra, se precisar de algum ajuste pontual */
  className?: string;
}

// Cor azul Solfarma não existe no tailwind.config.js, então aplicamos manualmente
// via valor arbitrário ([#32307B]) em vez de uma classe de cor nomeada.
const baseClasses =
  'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md ' +
  'font-poppins text-sm font-semibold whitespace-nowrap ' +
  'transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  primario:
    'bg-[#32307B] text-white border-none ' +
    'hover:brightness-110 active:brightness-95',
  secundario:
    'bg-white text-[#32307B] border-[1.5px] border-solid  border-other-border ' +
    'hover:bg-[#32307B]/5 active:bg-[#32307B]/10',
};

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  variant = 'primario',
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>}
      <span className="leading-none">{label}</span>
    </button>
  );
};

export default Button;