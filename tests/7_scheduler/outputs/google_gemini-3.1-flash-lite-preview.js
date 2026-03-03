async function findAvailableSlots(cals, { durationMinutes: dur, searchRange: range, workHours: work }) {
  const { DateTime, Interval } = await import('https://cdn.skypack.dev/luxon');

  const parseOrNull = (date) => DateTime.fromISO(date, { zone: 'utc' });
  const toUtcTime = (time, baseDate) => {
    const [h, m] = time.split(':');
    return baseDate.set({ hour: h, minute: m, second: 0, millisecond: 0 });
  };

  const rangeStart = parseOrNull(range.start);
  const rangeEnd = parseOrNull(range.end);

  const busyIntervals = [...cals.flat()]
    .map(s => Interval.fromDateTimes(parseOrNull(s.start), parseOrNull(s.end)))
    .filter(i => i.overlaps(Interval.fromDateTimes(rangeStart, rangeEnd)))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const interval of busyIntervals) {
    if (!merged.length || !merged[merged.length - 1].overlaps(interval)) merged.push(interval);
    else merged[merged.length - 1] = merged[merged.length - 1].union(interval);
  }

  const freeSlots = [];
  let current = rangeStart;

  while (current < rangeEnd) {
    const dayStart = toUtcTime(work.start, current);
    const dayEnd = toUtcTime(work.end, current);
    
    let pointer = current < dayStart ? dayStart : current;
    const limit = current.plus({ days: 1 }).startOf('day') < rangeEnd 
      ? dayEnd 
      : (rangeEnd < dayEnd ? rangeEnd : dayEnd);

    while (pointer.plus({ minutes: dur }) <= limit) {
      const slot = Interval.after(pointer, { minutes: dur });
      if (!merged.some(m => m.overlaps(slot))) {
        freeSlots.push({ start: slot.start.toISO(), end: slot.end.toISO() });
        pointer = slot.end;
      } else {
        const nextBusy = merged.find(m => m.overlaps(slot));
        pointer = nextBusy.end > pointer ? nextBusy.end : pointer.plus({ minutes: 1 });
      }
    }
    current = current.plus({ days: 1 }).startOf('day');
  }

  return freeSlots;
}
export default findAvailableSlots;
// Generation time: 2.149s
// Result: FAIL