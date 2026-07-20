
interface ButtonSideBarProps {
    onClick: () => void;
    children?: React.ReactNode;
    title?: string;
    typeButton: 'active' | 'locked'|   'inactive';
    active?: boolean;
}

export function ButtonSideBar({ onClick, children, title, typeButton, active }: ButtonSideBarProps) {
    const buttonStyles = {
            active: `text-[#8A8A9A] flex gap-3 items-center text-sm w-full
          bg-github-border py-3 rounded-xl px-4 mb-4 cursor-pointer
          hover:text-github-text hover:bg-github-btn-green-hover transition-all duration-200
          ${active && 'bg-github-btn-green-hover text-github-text'}
          `,
      locked: `relative flex w-full text-sm cursor-not-allowed items-center gap-3 overflow-hidden 
    rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 mb-4 text-left`,
        inactive:''
    };
  return (
    <button
      onClick={onClick}
      className={buttonStyles[typeButton]}
      title={title}
    >
      {children}
      {title}
    </button>
  );
}