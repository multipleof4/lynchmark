async function findAvailableSlots(calendarA, calendarB, constraints) {
  const { parseISO, isValid } = await import(
    "https://cdn.jsdelivr.net/npm/date-fns@4.1.0/+esm"
  );

  const minute = 60000;
  const day = 1440 * minute;

  const instant = (value, label) => {
    if (typeof value !== "string") {
      throw new TypeError(`${label} must be an ISO date string`);
    }

    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
    const normalized = dateOnly
      ? `${value}T00:00:00Z`
      : hasZone
        ? value
        : `${value}Z`;
    const date = parseISO(normalized);

    if (!isValid(date)) {
      throw new RangeError(`${label} is not a valid ISO date string`);
    }

    return date.getTime();
  };

  const clock = (value, label) => {
    if (value === "24:00") return day;

    const match = typeof value === "string"
      ? /^(\d{2}):(\d{2})$/.exec(value)
      : null;

    if (
      !match ||
      Number(match[1]) > 23 ||
      Number(match[2]) > 59
    ) {
      throw new RangeError(`${label} must use HH:mm format`);
    }

    return (Number(match[1]) * 60 + Number(match[2])) * minute;
  };

  if (!constraints || typeof constraints !== "object") {
    throw new TypeError("constraints must be an object");
  }

  const { durationMinutes, searchRange, workHours } = constraints;

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new RangeError("durationMinutes must be a positive number");
  }

  const duration = durationMinutes * minute;

  if (!Number.isSafeInteger(duration)) {
    throw new RangeError("durationMinutes must resolve to whole milliseconds");
  }

  if (!searchRange || typeof searchRange !== "object") {
    throw new TypeError("searchRange must be an object");
  }

  if (!workHours || typeof workHours !== "object") {
    throw new TypeError("workHours must be an object");
  }

  const range = {
    start: instant(searchRange.start, "searchRange.start"),
    end: instant(searchRange.end, "searchRange.end")
  };

  if (range.start >= range.end) {
    throw new RangeError("searchRange.start must be before searchRange.end");
  }

  const workStart = clock(workHours.start, "workHours.start");
  const workEnd = clock(workHours.end, "workHours.end");

  if (workStart >= workEnd) {
    throw new RangeError("workHours.start must be before workHours.end");
  }

  const readCalendar = (calendar, label) => {
    if (!Array.isArray(calendar)) {
      throw new TypeError(`${label} must be an array`);
    }

    return calendar
      .map((slot, index) => {
        if (!slot || typeof slot !== "object") {
          throw new TypeError(`${label}[${index}] must be an object`);
        }

        const start = instant(slot.start, `${label}[${index}].start`);
        const end = instant(slot.end, `${label}[${index}].end`);

        if (start >= end) {
          throw new RangeError(
            `${label}[${index}].start must be before ${label}[${index}].end`
          );
        }

        return {
          start: Math.max(start, range.start),
          end: Math.min(end, range.end)
        };
      })
      .filter(slot => slot.start < slot.end);
  };

  const busy = [
    ...readCalendar(calendarA, "calendarA"),
    ...readCalendar(calendarB, "calendarB")
  ].sort((a, b) => a.start - b.start || a.end - b.end);

  const merged = [];

  for (const slot of busy) {
    const last = merged[merged.length - 1];

    if (!last || slot.start > last.end) {
      merged.push({ ...slot });
    } else {
      last.end = Math.max(last.end, slot.end);
    }
  }

  const result = [];
  const addSlots = (start, end) => {
    for (
      let cursor = start;
      cursor + duration <= end;
      cursor += duration
    ) {
      result.push({
        start: new Date(cursor).toISOString(),
        end: new Date(cursor + duration).toISOString()
      });
    }
  };

  const firstDay = new Date(range.start);
  firstDay.setUTCHours(0, 0, 0, 0);

  let busyIndex = 0;

  for (
    let dayStart = firstDay.getTime();
    dayStart < range.end;
    dayStart += day
  ) {
    const windowStart = Math.max(range.start, dayStart + workStart);
    const windowEnd = Math.min(range.end, dayStart + workEnd);

    if (windowStart >= windowEnd) continue;

    while (
      busyIndex < merged.length &&
      merged[busyIndex].end <= windowStart
    ) {
      busyIndex++;
    }

    let cursor = windowStart;

    for (
      let index = busyIndex;
      index < merged.length && merged[index].start < windowEnd;
      index++
    ) {
      const blocked = merged[index];

      if (blocked.start > cursor) {
        addSlots(cursor, Math.min(blocked.start, windowEnd));
      }

      cursor = Math.max(cursor, blocked.end);

      if (cursor >= windowEnd) break;
    }

    addSlots(cursor, windowEnd);
  }

  return result;
}
export default findAvailableSlots;
// Generation time: 80.821s
// Result: PASS