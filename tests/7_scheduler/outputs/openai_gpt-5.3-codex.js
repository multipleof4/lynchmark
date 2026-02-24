async function findAvailableSlots(calendarA = [], calendarB = [], constraints = {}) {
  const { DateTime } = await import('https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm')
  const toUtc = v => DateTime.fromISO(v, { zone: 'utc' }).toUTC()
  const asMillis = d => d.toMillis()
  const maxDt = (a, b) => (asMillis(a) > asMillis(b) ? a : b)
  const minDt = (a, b) => (asMillis(a) < asMillis(b) ? a : b)
  const parseHm = s => {
    const [h, m] = String(s || '').split(':').map(Number)
    return Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h < 24 && m >= 0 && m < 60 ? [h, m] : null
  }

  const durationMinutes = Number(constraints.durationMinutes)
  const range = constraints.searchRange || {}
  const workHours = constraints.workHours || {}
  const whStart = parseHm(workHours.start)
  const whEnd = parseHm(workHours.end)

  if (!(durationMinutes > 0) || !whStart || !whEnd) return []
  if (whEnd[0] < whStart[0] || (whEnd[0] === whStart[0] && whEnd[1] <= whStart[1])) return []

  const searchStart = toUtc(range.start || '')
  const searchEnd = toUtc(range.end || '')
  if (!searchStart.isValid || !searchEnd.isValid || asMillis(searchEnd) <= asMillis(searchStart)) return []

  const busyRaw = [...calendarA, ...calendarB]
    .map(x => ({ s: toUtc(x?.start || ''), e: toUtc(x?.end || '') }))
    .filter(x => x.s.isValid && x.e.isValid && asMillis(x.e) > asMillis(x.s))
    .map(x => ({ s: maxDt(x.s, searchStart), e: minDt(x.e, searchEnd) }))
    .filter(x => asMillis(x.e) > asMillis(x.s))
    .sort((a, b) => asMillis(a.s) - asMillis(b.s))

  const merged = []
  for (const it of busyRaw) {
    const last = merged[merged.length - 1]
    if (!last || asMillis(it.s) > asMillis(last.e)) merged.push({ ...it })
    else if (asMillis(it.e) > asMillis(last.e)) last.e = it.e
  }

  const free = []
  let cursor = searchStart
  for (const b of merged) {
    if (asMillis(b.s) > asMillis(cursor)) free.push({ s: cursor, e: b.s })
    if (asMillis(b.e) > asMillis(cursor)) cursor = b.e
  }
  if (asMillis(searchEnd) > asMillis(cursor)) free.push({ s: cursor, e: searchEnd })

  const out = []
  for (const f of free) {
    for (
      let day = f.s.startOf('day'), endDay = f.e.startOf('day');
      asMillis(day) <= asMillis(endDay);
      day = day.plus({ days: 1 })
    ) {
      const wStart = day.set({ hour: whStart[0], minute: whStart[1], second: 0, millisecond: 0 })
      const wEnd = day.set({ hour: whEnd[0], minute: whEnd[1], second: 0, millisecond: 0 })
      const s = maxDt(f.s, wStart)
      const e = minDt(f.e, wEnd)
      if (asMillis(e) <= asMillis(s)) continue

      for (let t = s, n = t.plus({ minutes: durationMinutes }); asMillis(n) <= asMillis(e); t = n, n = t.plus({ minutes: durationMinutes })) {
        out.push({
          start: t.toISO({ suppressMilliseconds: true }),
          end: n.toISO({ suppressMilliseconds: true })
        })
      }
    }
  }

  return out
}
export default findAvailableSlots;
// Generation time: 42.899s
// Result: PASS