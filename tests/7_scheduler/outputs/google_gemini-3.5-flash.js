export async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { DateTime } = await import('https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm');

  const { durationMinutes: dur, searchRange, workHours } = constraints;
  const parse = s => DateTime.fromISO(s, { zone: 'utc' });
  const sStart = parse(searchRange.start);
  const sEnd = parse(searchRange.end);

  const busy = [...calendar1, ...calendar2]
    .map(b => ({ start: parse(b.start), end: parse(b.end) }))
    .filter(b => b.end > sStart && b.start < sEnd)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const b of busy) {
    const last = merged[merged.length - 1];
    if (!last || b.start > last.end) merged.push(b);
    else if (b.end > last.end) last.end = b.end;
  }

  const [sh, sm] = workHours.start.split(':').map(Number);
  const [eh, em] = workHours.end.split(':').map(Number);
  const slots = [];

  const addSlots = (from, to) => {
    while (from.plus({ minutes: dur }) <= to) {
      const next = from.plus({ minutes: dur });
      slots.push({ start: from.toISO(), end: next.toISO() });
      from = next;
    }
  };

  let day = sStart.startOf('day');
  while (day <= sEnd) {
    const dStart = day.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
    const dEnd = day.set({ hour: eh, minute: em, second: 0, millisecond: 0 });
    const activeStart = sStart > dStart ? sStart : dStart;
    const activeEnd = sEnd < dEnd ? sEnd : dEnd;

    if (activeStart < activeEnd) {
      let time = activeStart;
      for (const b of merged) {
        if (b.end <= time) continue;
        if (b.start >= activeEnd) break;
        if (b.start > time) addSlots(time, b.start);
        if (b.end > time) time = b.end;
      }
      if (time < activeEnd) addSlots(time, activeEnd);
    }
    day = day.plus({ days: 1 });
  }

  return slots;
}
export default findAvailableSlots;
// Generation time: 23.364s
// Result: PASS