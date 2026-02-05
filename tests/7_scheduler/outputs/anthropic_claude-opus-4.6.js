async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { DateTime, Interval } = await import("https://cdn.jsdelivr.net/npm/luxon@3/+esm");

  const { durationMinutes, searchRange, workHours } = constraints;
  const dur = { minutes: durationMinutes };

  const rangeStart = DateTime.fromISO(searchRange.start, { zone: "utc" });
  const rangeEnd = DateTime.fromISO(searchRange.end, { zone: "utc" });

  const [whStartH, whStartM] = workHours.start.split(":").map(Number);
  const [whEndH, whEndM] = workHours.end.split(":").map(Number);

  const allBusy = [...calendar1, ...calendar2].map(b =>
    Interval.fromDateTimes(
      DateTime.fromISO(b.start, { zone: "utc" }),
      DateTime.fromISO(b.end, { zone: "utc" })
    )
  );

  const merged = Interval.merge(allBusy.filter(i => i.isValid));

  const searchInterval = Interval.fromDateTimes(rangeStart, rangeEnd);

  let freeIntervals = [searchInterval];
  for (const busy of merged) {
    const next = [];
    for (const free of freeIntervals) {
      const diff = free.difference(busy);
      next.push(...diff);
    }
    freeIntervals = next;
  }

  const results = [];

  for (const free of freeIntervals) {
    let cursor = free.start;
    const freeEnd = free.end;

    while (cursor < freeEnd) {
      const dayStart = cursor.startOf("day").set({ hour: whStartH, minute: whStartM });
      const dayEnd = cursor.startOf("day").set({ hour: whEndH, minute: whEndM });

      if (cursor < dayStart) {
        cursor = dayStart;
        continue;
      }

      if (cursor >= dayEnd) {
        cursor = cursor.startOf("day").plus({ days: 1 }).set({ hour: whStartH, minute: whStartM });
        continue;
      }

      const slotEnd = cursor.plus(dur);

      if (slotEnd > dayEnd) {
        cursor = cursor.startOf("day").plus({ days: 1 }).set({ hour: whStartH, minute: whStartM });
        continue;
      }

      if (slotEnd > freeEnd) {
        break;
      }

      if (slotEnd > rangeEnd) {
        break;
      }

      if (cursor < rangeStart) {
        cursor = rangeStart;
        continue;
      }

      results.push({
        start: cursor.toISO(),
        end: slotEnd.toISO()
      });

      cursor = slotEnd;
    }
  }

  results.sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);

  return results;
}
export default findAvailableSlots;
// Generation time: 11.283s
// Result: PASS