async function findAvailableSlots(cal1, cal2, { durationMinutes, searchRange, workHours }) {
  const { DateTime, Interval } = await import('https://cdn.skypack.dev/luxon');

  const toUTC = (iso) => DateTime.fromISO(iso, { zone: 'utc' });
  const parseTime = (t, d) => DateTime.fromISO(`${d.toISODate()}T${t}:00Z`, { zone: 'utc' });

  const busy = [...cal1, ...cal2].map(s => Interval.fromDateTimes(toUTC(s.start), toUTC(s.end)));
  const merged = Interval.merge(busy);

  const start = toUTC(searchRange.start);
  const end = toUTC(searchRange.end);
  const slots = [];

  let current = start;
  while (current < end) {
    let day = current.startOf('day');
    let workStart = parseTime(workHours.start, day);
    let workEnd = parseTime(workHours.end, day);

    let windowStart = current > workStart ? current : workStart;
    let windowEnd = workEnd;

    for (let s = windowStart; s.plus({ minutes: durationMinutes }) <= windowEnd; ) {
      let slotEnd = s.plus({ minutes: durationMinutes });
      let interval = Interval.fromDateTimes(s, slotEnd);

      if (!merged.some(b => b.overlaps(interval))) {
        slots.push({ start: s.toISO(), end: slotEnd.toISO() });
        s = slotEnd;
      } else {
        s = s.plus({ minutes: 1 });
      }
    }
    current = day.plus({ days: 1 });
  }

  return slots;
}
export default findAvailableSlots;
// Generation time: 2.010s
// Result: PASS