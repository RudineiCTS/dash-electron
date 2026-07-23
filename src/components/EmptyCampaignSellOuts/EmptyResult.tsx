interface IEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: IEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      {icon && <div className="text-white/20">{icon}</div>}
      <p className="text-white font-medium text-base">{title}</p>
      {description && (
        <p className="text-[#8b949e] text-sm max-w-sm">{description}</p>
      )}
    </div>
  );
}