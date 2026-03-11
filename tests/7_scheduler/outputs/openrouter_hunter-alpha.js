async function findAvailableSlots(cal1, cal2, constraints) {
  const { default: dayjs } = await import('https://cdn.skypack.dev/dayjs@1.11.10');
  const { default: utc } = await import('https://cdn.skypack.dev/dayjs@1.11.10/plugin/utc');
  dayjs.extend(utc);

  const toMin = d => dayjs.utc(d).diff(dayjs.utc(constraints.searchRange.start), 'minute');
  const toISO = m => dayjs.utc(constraints.searchRange.start).add(m, 'minute').toISOString();
  const parseHM = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const allBusy = [...cal1, ...cal2]
    .map(({ start, end }) => [toMin(start), toMin(end)])
    .filter(([s, e]) => s < e && e > 0)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged = allBusy.reduce((acc, [s, e]) => {
    if (!acc.length || s > acc[acc.length - 1][1]) acc.push([s, e]);
    else acc[acc.length - 1][1] = Math.max(acc[acc.length - 1][1], e);
    return acc;
  }, []);

  const rangeStart = 0;
  const rangeEnd = toMin(constraints.searchRange.end);
  const workStartMin = parseHM(constraints.workHours.start);
  const workEndMin = parseHM(constraints.workHours.end);
  const duration = constraints.durationMinutes;
  const slots = [];

  const dayStart = dayjs.utc(constraints.searchRange.start).startOf('day');
  let current = rangeStart;

  while (current < rangeEnd) {
    const dayDiff = Math.floor(current / 1440);
    const dayBase = dayStart.add(dayDiff, 'day');
    const dayStartMin = dayDiff * 1440;
    const dayWorkStart = dayBase.add(workStartMin, 'minute');
    const dayWorkEnd = dayBase.add(workEndMin, 'minute');
    const dayWorkStartMin = toMin(dayWorkStart);
    const dayWorkEndMin = toMin(dayWorkEnd);

    if (current < dayWorkStartMin) {
      current = dayWorkStartMin;
      continue;
    }

    if (current >= dayWorkEndMin) {
      current = dayStartMin + 1440;
      continue;
    }

    const busyBlock = merged.find(([s]) => s > current);
    const nextBusyStart = busyBlock ? busyBlock[0] : rangeEnd;
    const freeEnd = Math.min(nextBusyStart, dayWorkEndMin, rangeEnd);

    if (freeEnd - current >= duration) {
      let slotStart = current;
      while (slotStart + duration <= freeEnd) {
        slots.push({ start: toISO(slotStart), end: toISO(slotStart + duration) });
        slotStart += duration;
      }
      current = slotStart;
    } else {
      current = freeEnd;
    }
  }

  return slots;
}
export default findAvailableSlots;
// Generation time: 25.925s
// Result: FAIL