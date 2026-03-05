export async function findAvailableSlots(calendarA, calendarB, constraints) {
  const { DateTime, Interval } = await import('https://cdn.jsdelivr.net/npm/luxon@3/+esm')
  const { durationMinutes, searchRange, workHours } = constraints
  const toUtc = v => DateTime.fromISO(v, { zone: 'utc' })
  const pad = v => `${v}`.padStart(2, '0')
  const [whs, wms] = workHours.start.split(':').map(Number)
  const [whe, wme] = workHours.end.split(':').map(Number)
  const rangeStart = toUtc(searchRange.start)
  const rangeEnd = toUtc(searchRange.end)
  const duration = { minutes: durationMinutes }
  const stepMs = durationMinutes * 6e4

  if (
    !rangeStart.isValid ||
    !rangeEnd.isValid ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0 ||
    rangeEnd <= rangeStart ||
    [whs, wms, whe, wme].some(v => !Number.isInteger(v))
  ) return []

  const clip = ({ start, end }) => {
    const s = toUtc(start)
    const e = toUtc(end)
    if (!s.isValid || !e.isValid || e <= s) return null
    const a = s < rangeStart ? rangeStart : s
    const b = e > rangeEnd ? rangeEnd : e
    return b > a ? { start: a, end: b } : null
  }

  const busy = [...calendarA, ...calendarB]
    .map(clip)
    .filter(Boolean)
    .sort((a, b) => a.start.toMillis() - b.start.toMillis())

  const merged = []
  for (const slot of busy) {
    const last = merged[merged.length - 1]
    if (!last || slot.start > last.end) merged.push({ ...slot })
    else if (slot.end > last.end) last.end = slot.end
  }

  const free = []
  let cursor = rangeStart
  for (const slot of merged) {
    if (slot.start > cursor) free.push({ start: cursor, end: slot.start })
    if (slot.end > cursor) cursor = slot.end
  }
  if (cursor < rangeEnd) free.push({ start: cursor, end: rangeEnd })

  const dayWindows = []
  for (
    let d = rangeStart.startOf('day');
    d < rangeEnd;
    d = d.plus({ days: 1 })
  ) {
    const ws = d.set({
      hour: whs,
      minute: wms,
      second: 0,
      millisecond: 0
    })
    const we = d.set({
      hour: whe,
      minute: wme,
      second: 0,
      millisecond: 0
    })
    if (we <= ws) continue
    const start = ws < rangeStart ? rangeStart : ws
    const end = we > rangeEnd ? rangeEnd : we
    if (end > start) dayWindows.push({ start, end })
  }

  const results = []
  let wi = 0

  for (const f of free) {
    while (wi < dayWindows.length && dayWindows[wi].end <= f.start) wi++
    for (let i = wi; i < dayWindows.length; i++) {
      const w = dayWindows[i]
      if (w.start >= f.end) break
      const start = f.start > w.start ? f.start : w.start
      const end = f.end < w.end ? f.end : w.end
      if (end <= start) continue
      const ms = end.toMillis() - start.toMillis()
      const count = Math.floor(ms / stepMs)
      for (let j = 0; j < count; j++) {
        const s = start.plus({ minutes: j * durationMinutes })
        const e = s.plus(duration)
        if (e <= end && Interval.fromDateTimes(s, e).length('minutes') === durationMinutes) {
          results.push({
            start: s.toUTC().toISO({ suppressMilliseconds: true }),
            end: e.toUTC().toISO({ suppressMilliseconds: true })
          })
        }
      }
    }
  }

  return results
}
export default findAvailableSlots;
// Generation time: 9.884s
// Result: PASS