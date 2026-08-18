import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"

dayjs.extend(isSameOrBefore)

export function isValidPeriod(start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false

  const startDay = dayjs(start)
  const endDay = dayjs(end)

  if (!startDay.isValid() || !endDay.isValid()) return false

  return startDay.isSameOrBefore(endDay)
}