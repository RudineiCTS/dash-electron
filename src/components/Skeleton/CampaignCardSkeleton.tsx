import { Skeleton } from "./Skeleton";

export function CampaignCardSkeleton() {
  return (
    <div className="bg-[#10171f] border border-white/[0.07] rounded-[9px] p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton variant="rect" className="w-8 h-5" />
        <Skeleton variant="text" className="w-2/3 h-4" />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <Skeleton variant="rect" className="w-16 h-5 rounded-full" />
        <Skeleton variant="rect" className="w-20 h-5 rounded-full" />
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-1/3 h-2" />
          <Skeleton variant="text" className="w-1/4 h-2" />
        </div>
        <Skeleton variant="rect" className="h-1 w-full rounded-full" />
      </div>

      {/* Stats */}
      <div className="flex gap-8 pt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton variant="text" className="w-10 h-2" />
            <Skeleton variant="text" className="w-14 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
