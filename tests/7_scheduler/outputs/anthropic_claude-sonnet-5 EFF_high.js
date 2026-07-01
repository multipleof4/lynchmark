async function findAvailableSlots(calendarA, calendarB, constraints) {
  const { parseISO, addMinutes, addDays, startOfDay, max, min } =
    await import('https://esm.sh/date-fns@3');

  const toRange = c => ({ start: parseISO(c.start), end: parseISO(c.end) });

  const busy = [...calendarA, ...calendarB]
    .map(toRange)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const slot of busy) {
    const last = merged[merged.length - 1];
    if (last && slot.start <= last.end) last.end = max([last.end, slot.end]);
    else merged.push({ ...slot });
  }

  const searchStart = parseISO(constraints.searchRange.start);
  const searchEnd = parseISO(constraints.searchRange.end);
  const duration = constraints.durationMinutes;

  const free = [];
  let cursor = searchStart;
  for (const b of merged) {
    if (b.start >= searchEnd) break;
    if (b.end <= searchStart) continue;
    if (b.start > cursor) free.push({ start: cursor, end: min([b.start, searchEnd]) });
    cursor = max([cursor, b.end]);
  }
  if (cursor < searchEnd) free.push({ start: cursor, end: searchEnd });

  const [wsH, wsM] = constraints.workHours.start.split(':').map(Number);
  const [weH, weM] = constraints.workHours.end.split(':').map(Number);

  const slots = [];
  for (const period of free) {
    let dayStart = startOfDay(period.start);

    while (dayStart < period.end) {
      const y = dayStart.getUTCFullYear(), m = dayStart.getUTCMonth(), d = dayStart.getUTCDate();
      const workStart = new Date(Date.UTC(y, m, d, wsH, wsM));
      const workEnd = new Date(Date.UTC(y, m, d, weH, weM));

      const windowStart = max([workStart, period.start]);
      const windowEnd = min([workEnd, period.end]);

      let slotStart = windowStart;
      while (addMinutes(slotStart, duration) <= windowEnd) {
        const slotEnd = addMinutes(slotStart, duration);
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        slotStart = slotEnd;
      }

      dayStart = addDays(dayStart, 1);
    }
  }

  return slots;
}
export default findAvailableSlots;
// Generation time: 26.434s
// Result: PASS