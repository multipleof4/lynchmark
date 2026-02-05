async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { DateTime, Interval } = await import("https://cdn.jsdelivr.net/npm/luxon@3/+esm");

  const { durationMinutes, searchRange, workHours } = constraints;
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
  }
  if (cursor < rangeEnd) {
    freePeriods.push({ s: cursor, e: rangeEnd });
  }

  const workWindows = [];
  let day = rangeStart.startOf("day");
  const lastDay = rangeEnd.startOf("day").plus({ days: 1 });

  while (day < lastDay) {
    const ws = day.set({ hour: whStartH, minute: whStartM, second: 0, millisecond: 0 });
    const we = day.set({ hour: whEndH, minute: whEndM, second: 0, millisecond: 0 });
    if (we > ws) {
      const clampedStart = DateTime.max(ws, rangeStart);
      const clampedEnd = DateTime.min(we, rangeEnd);
      if (clampedStart < clampedEnd) {
        workWindows.push({ s: clampedStart, e: clampedEnd });
      }
    }
    day = day.plus({ days: 1 });
  }

  const effectiveFree = [];
  for (const free of freePeriods) {
    for (const ww of workWindows) {
      const s = DateTime.max(free.s, ww.s);
      const e = DateTime.min(free.e, ww.e);
      if (s < e) {
        effectiveFree.push({ s, e });
      }
    }
  }

  effectiveFree.sort((a, b) => a.s - b.s);

  const results = [];
  const dur = { minutes: durationMinutes };

  for (const period of effectiveFree) {
    let slotStart = period.s;
    while (true) {
      const slotEnd = slotStart.plus(dur);
      if (slotEnd > period.e) break;
      results.push({
        start: slotStart.toISO(),
        end: slotEnd.toISO()
      });
      slotStart = slotEnd;
    }
  }

  return results;
}
export default findAvailableSlots;
// Generation time: 12.695s
// Result: PASS