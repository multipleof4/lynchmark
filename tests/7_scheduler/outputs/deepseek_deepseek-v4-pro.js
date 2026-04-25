let _dayjsPromise;

const loadDayjs = () => _dayjsPromise || (_dayjsPromise = (async () => {
  const dayjs = (await import('https://cdn.skypack.dev/dayjs@1')).default;
  const utc = (await import('https://cdn.skypack.dev/dayjs@1/plugin/utc')).default;
  dayjs.extend(utc);
  return dayjs;
})());

async function findAvailableSlots(cal1, cal2, constraints) {
  const dayjs = await loadDayjs();
  const { durationMinutes, searchRange, workHours } = constraints;
  const rStart = dayjs.utc(searchRange.start);
  const rEnd = dayjs.utc(searchRange.end);
  const [wSh, wSm] = workHours.start.split(':').map(Number);
  const [wEh, wEm] = workHours.end.split(':').map(Number);

  // Merge all busy slots
  const allBusy = [...cal1, ...cal2]
    .map(s => ({ start: dayjs.utc(s.start), end: dayjs.utc(s.end) }))
    .filter(s => s.start.isValid() && s.end.isValid() && s.start.isBefore(s.end));

  allBusy.sort((a, b) => a.start.valueOf() - b.start.valueOf());

  const merged = [];
  for (const busy of allBusy) {
    if (!merged.length || busy.start.isAfter(merged[merged.length - 1].end)) {
      merged.push({ start: busy.start, end: busy.end });
    } else if (busy.end.isAfter(merged[merged.length - 1].end)) {
      merged[merged.length - 1].end = busy.end;
    }
  }

  const result = [];
  let day = rStart.startOf('day');
  const endDay = rEnd.startOf('day');

  while (day.isBefore(endDay) || day.isSame(endDay, 'day')) {
    const workStart = day.hour(wSh).minute(wSm).second(0);
    const workEnd = day.hour(wEh).minute(wEm).second(0);
    const dStart = dayjs.max(workStart, rStart);
    const dEnd = dayjs.min(workEnd, rEnd);

    if (dStart.isBefore(dEnd)) {
      let gapStart = dStart;

      for (const busy of merged) {
        if (busy.end.isBefore(dStart) || busy.start.isAfter(dEnd)) continue;
        if (busy.start.isAfter(gapStart)) {
          const freeStart = gapStart;
          const freeEnd = busy.start;
          let slotStart = freeStart;
          while (slotStart.add(durationMinutes, 'minute').isBefore(freeEnd) || slotStart.add(durationMinutes, 'minute').isSame(freeEnd)) {
            const slotEnd = slotStart.add(durationMinutes, 'minute');
            if (slotEnd.isAfter(freeEnd)) break;
            result.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
            slotStart = slotEnd;
          }
          gapStart = busy.end;
        } else if (busy.end.isAfter(gapStart)) {
          gapStart = busy.end;
        }
      }

      if (gapStart.isBefore(dEnd)) {
        let slotStart = gapStart;
        while (slotStart.add(durationMinutes, 'minute').isBefore(dEnd) || slotStart.add(durationMinutes, 'minute').isSame(dEnd)) {
          const slotEnd = slotStart.add(durationMinutes, 'minute');
          if (slotEnd.isAfter(dEnd)) break;
          result.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
          slotStart = slotEnd;
        }
      }
    }
    day = day.add(1, 'day');
  }

  return result.sort((a, b) => a.start.localeCompare(b.start));
}
export default findAvailableSlots;
// Generation time: 135.095s
// Result: FAIL