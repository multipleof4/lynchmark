async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { default: dayjs } = await import("https://cdn.skypack.dev/dayjs@1.11.10");
  const { default: utc } = await import("https://cdn.skypack.dev/dayjs@1.11.10/plugin/utc");
  const { default: customParseFormat } = await import("https://cdn.skypack.dev/dayjs@1.11.10/plugin/customParseFormat");

  dayjs.extend(utc);
  dayjs.extend(customParseFormat);

  const { durationMinutes, searchRange, workHours } = constraints;
  const d = (iso) => dayjs.utc(iso);
  const durationMs = durationMinutes * 60 * 1000;

  const mergedBusy = mergeBusySlots(
    [...calendar1, ...calendar2].map((s) => ({ start: d(s.start), end: d(s.end) }))
  );

  const rangeStart = d(searchRange.start);
  const rangeEnd = d(searchRange.end);

  const freeSlots = extractFreeSlots(mergedBusy, rangeStart, rangeEnd);

  return freeSlots.flatMap((free) =>
    generateSlots(free.start, free.end, durationMs, workHours, dayjs)
  );
}

function mergeBusySlots(slots) {
  if (!slots.length) return [];

  const sorted = slots.slice().sort((a, b) => a.start.valueOf() - b.start.valueOf());

  return sorted.reduce((merged, curr) => {
    if (!merged.length) return [{ ...curr }];
    const last = merged[merged.length - 1];
    if (curr.start.valueOf() <= last.end.valueOf()) {
      last.end = curr.end.valueOf() > last.end.valueOf() ? curr.end : last.end;
    } else {
      merged.push({ ...curr });
    }
    return merged;
  }, []);
}

function extractFreeSlots(busySlots, rangeStart, rangeEnd) {
  const free = [];
  let cursor = rangeStart;

  for (const busy of busySlots) {
    if (busy.start.valueOf() > cursor.valueOf()) {
      const freeEnd = busy.start.valueOf() < rangeEnd.valueOf() ? busy.start : rangeEnd;
      if (freeEnd.valueOf() > cursor.valueOf()) {
        free.push({ start: cursor, end: freeEnd });
      }
    }
    if (busy.end.valueOf() > cursor.valueOf()) {
      cursor = busy.end;
    }
    if (cursor.valueOf() >= rangeEnd.valueOf()) break;
  }

  if (cursor.valueOf() < rangeEnd.valueOf()) {
    free.push({ start: cursor, end: rangeEnd });
  }

  return free;
}

function generateSlots(freeStart, freeEnd, durationMs, workHours, dayjs) {
  const [whStartH, whStartM] = workHours.start.split(":").map(Number);
  const [whEndH, whEndM] = workHours.end.split(":").map(Number);
  const slots = [];

  let dayDate = freeStart.utc().startOf("day");
  const lastDay = freeEnd.utc().startOf("day");

  while (dayDate.valueOf() <= lastDay.valueOf()) {
    const wStart = dayDate.hour(whStartH).minute(whStartM).second(0).millisecond(0);
    const wEnd = dayDate.hour(whEndH).minute(whEndM).second(0).millisecond(0);

    const slotStart = Math.max(freeStart.valueOf(), wStart.valueOf());
    const slotEnd = Math.min(freeEnd.valueOf(), wEnd.valueOf());

    let cursor = alignToSlot(slotStart, wStart.valueOf(), durationMs);

    while (cursor + durationMs <= slotEnd) {
      slots.push({
        start: dayjs.utc(cursor).toISOString(),
        end: dayjs.utc(cursor + durationMs).toISOString(),
      });
      cursor += durationMs;
    }

    dayDate = dayDate.add(1, "day");
  }

  return slots;
}

function alignToSlot(ts, workDayStart, durationMs) {
  const offset = ts - workDayStart;
  const remainder = offset % durationMs;
  return remainder === 0 ? ts : ts + (durationMs - remainder);
}
export default findAvailableSlots;
// Generation time: 13.592s
// Result: FAIL