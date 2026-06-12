const findAvailableSlots = async (calendarA, calendarB, { durationMinutes, searchRange, workHours }) => {
  const { DateTime, Interval } = await import('https://cdn.jsdelivr.net/npm/luxon@3/+esm');

  const utc = s => DateTime.fromISO(s, { zone: 'utc' });
  const parseHM = s => s.split(':').map(Number);

  const range = Interval.fromDateTimes(utc(searchRange.start), utc(searchRange.end));
  const busy = Interval.merge(
    [...calendarA, ...calendarB].map(({ start, end }) => Interval.fromDateTimes(utc(start), utc(end)))
  );
  const free = range.difference(...busy);

  const [wsH, wsM] = parseHM(workHours.start);
  const [weH, weM] = parseHM(workHours.end);
  const slots = [];

  for (const period of free) {
    let day = period.start.startOf('day');
    while (day < period.end) {
      const workWindow = Interval.fromDateTimes(
        day.set({ hour: wsH, minute: wsM }),
        day.set({ hour: weH, minute: weM })
      );
      const window = period.intersection(workWindow);
      if (window) {
        let cursor = window.start;
        let next = cursor.plus({ minutes: durationMinutes });
        while (next <= window.end) {
          slots.push({ start: cursor.toISO(), end: next.toISO() });
          cursor = next;
          next = cursor.plus({ minutes: durationMinutes });
        }
      }
      day = day.plus({ days: 1 });
    }
  }

  return slots;
};
export default findAvailableSlots;
// Generation time: 20.786s
// Result: PASS