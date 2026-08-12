import { Skeleton } from "../Skeleton"

export function MonthlyTrendSkeleton() {
  return (
    <div className='flex gap-6 w-full h-64'>
      <Skeleton variant="rect" className="w-[50%] h-full" />
      <Skeleton variant="rect" className="w-[50%] h-full" />
    </div>
  )
}