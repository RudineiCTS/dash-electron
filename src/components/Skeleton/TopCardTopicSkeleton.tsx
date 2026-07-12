import { Skeleton } from "./Skeleton";

export function TopCardTopicSkeleton() {
  return (
    <div className="flex flex-col gap-2 bg-[#10171f] border border-white/[0.07] rounded-[9px] p-4 w-full">
      <Skeleton variant="text" className="w-2/3 h-3" />
      <Skeleton variant="text" className="w-1/2 h-8" />
      <Skeleton variant="text" className="w-3/4 h-3" />
    </div>
  );
}
