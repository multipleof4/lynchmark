async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { durationMinutes, searchRange: { start: rangeStart, end: rangeEnd }, workHours: { start: whStart, end: whEnd } } = constraints;
  const [sh, sm] = whStart.split(':').map(Number);
  const [eh, em] = whEnd.split(':').map(Number);
  const workStartMin = sh * 60 + sm;
  const workEndMin = eh * 60 + em;
  const { parseISO, addMinutes, startOfDay, eachDayOfInterval, mergeOverlappingIntervals, min, max } = await import('https://cdn.jsdelivr.net/npm/date-fns@2.30.0/esm/index.js');

  const rangeStartDate = parseISO(rangeStart);
  const rangeEndDate = parseISO(rangeEnd);

  const allBusy = [...calendar1, ...calendar2]
    .map(({ start, end }) => ({ start: parseISO(start), end: parseISO(end) }))
    .filter(({ start, end }) => start < end);

  const mergedBusy = mergeOverlappingIntervals(allBusy);

  const busyInRange = mergedBusy
    .map(b => ({ start: max(b.start, rangeStartDate), end: min(b.end, rangeEndDate) }))
    .filter(b => b.start < b.end);

  const freeWindows = [];
  let cur = rangeStartDate;
  for (const busy of busyInRange) {
    if (cur < busy.start) freeWindows.push({ start: cur, end: busy.start });
    cur = max(cur, busy.end);
  }
  if (cur < rangeEndDate) freeWindows.push({ start: cur, end: rangeEndDate });

  const slots = [];
  for (const win of freeWindows) {
    const days = eachDayOfInterval({ start: win.start, end: win.end });
    for (const day of days) {
      const dayStart = startOfDay(day);
      const dailyStart = addMinutes(dayStart, workStartMin);
      const dailyEnd = addMinutes(dayStart, workEndMin);
      const intersectStart = max(win.start, dailyStart);
      const intersectEnd = min(win.end, dailyEnd);
      if (intersectStart >= intersectEnd) continue;
      let slotStart = intersectStart;
      while (addMinutes(slotStart, durationMinutes) <= intersectEnd) {
        const slotEnd = addMinutes(slotStart, durationMinutes);
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        slotStart = slotEnd;
      }
    }
  }
  return slots;
}
export default findAvailableSlots;
// Generation time: 159.679s
// Result: FAIL