async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { DateTime, Interval } = await import("https://cdn.jsdelivr.net/npm/luxon@3/+esm");

  const { durationMinutes, searchRange, workHours } = constraints;
  const dur = durationMinutes;

  const rangeStart = DateTime.fromISO(searchRange.start, { zone: "utc" });
  const rangeEnd = DateTime.fromISO(searchRange.end, { zone: "utc" });

  const [whStartH, whStartM] = workHours.start.split(":").map(Number);
  const [whEndH, whEndM] = workHours.end.split(":").map(Number);

  const allBusy = [...calendar1, ...calendar2]
    .map(b => ({
      s: DateTime.fromISO(b.start, { zone: "utc" }),
      e: DateTime.fromISO(b.end, { zone: "utc" })
    }))
    .sort((a, b) => a.s - b.s);

  const merged = [];
  for (const slot of allBusy) {
    if (merged.length && slot.s <= merged[merged.length - 1].e) {
      merged[merged.length - 1].e = DateTime.max(merged[merged.length - 1].e, slot.e);
    } else {
      merged.push({ s: slot.s, e: slot.e });
    }
  }

  const freePeriods = [];
  let cursor = rangeStart;

  for (const busy of merged) {
    if (busy.s > cursor) {
      freePeriods.push({ s: cursor, e: DateTime.min(busy.s, rangeEnd) });
    }
    cursor = DateTime.max(cursor, busy.e);
    if (cursor >= rangeEnd) break;
  }

  if (cursor < rangeEnd) {
    freePeriods.push({ s: cursor, e: rangeEnd });
  }

  const workConstrained = [];

  for (const free of freePeriods) {
    let day = free.s.startOf("day");
    const lastDay = free.e.startOf("day");

    while (day <= lastDay) {
      const whS = day.set({ hour: whStartH, minute: whStartM, second: 0, millisecond: 0 });
      const whE = day.set({ hour: whEndH, minute: whEndM, second: 0, millisecond: 0 });

      const overlapStart = DateTime.max(free.s, whS, rangeStart);
      const overlapEnd = DateTime.min(free.e, whE, rangeEnd);

      if (overlapStart < overlapEnd) {
        workConstrained.push({ s: overlapStart, e: overlapEnd });
      }

      day = day.plus({ days: 1 });
    }
  }

  const results = [];

  for (const period of workConstrained) {
    let slotStart = period.s;

    while (true) {
      const slotEnd = slotStart.plus({ minutes: dur });
      if (slotEnd > period.e) break;
      results.push({
        start: slotStart.toISO(),
        end: slotEnd.toISO()
      });
      slotStart = slotEnd;
    }
  }

  results.sort((a, b) => a.start.localeCompare(b.start));

  return results;
}
export default findAvailableSlots;
// Generation time: 11.229s
// Result: PASS