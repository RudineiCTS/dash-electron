import { Skeleton } from "../Skeleton";

function PeriodoSeletorSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Skeleton variant="circle" className="h-2 w-2" />
        <Skeleton variant="text" className="w-32 h-3" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="text" className="w-10 h-3" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="text" className="w-10 h-3" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

function CardIndicadorSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm">
      <Skeleton variant="rect" className="h-1 w-full rounded-none" />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton variant="rect" className="h-9 w-9" />
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" className="w-28 h-3" />
              <Skeleton variant="text" className="w-40 h-3" />
            </div>
          </div>
          <Skeleton variant="rect" className="h-6 w-16" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="text" className="w-28 h-6" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="text" className="w-28 h-6" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <Skeleton variant="text" className="w-28 h-3" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      </div>
    </div>
  );
}

export function ComparativoPeriodosSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full gap-6">
        <PeriodoSeletorSkeleton />
        <PeriodoSeletorSkeleton />
      </div>
      <div className="flex w-full gap-6">
        <CardIndicadorSkeleton />
        <CardIndicadorSkeleton />
      </div>
    </div>
  );
}
