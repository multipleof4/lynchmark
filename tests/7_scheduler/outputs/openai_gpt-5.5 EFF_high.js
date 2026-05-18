let luxonPromise;

async function findAvailableSlots(calendarA = [], calendarB = [], constraints = {}) {
  const { DateTime } = await (luxonPromise ||= import("https://esm.sh/luxon@3.5.0?bundle"));
  const M = 6e4, D = 864e5;
  const err = (E, m) => { throw new E(m); };

  const toMs = v => {
    if (typeof v !== "string") err(TypeError, `Invalid ISO date: ${v}`);
    const d = DateTime.fromISO(v, { zone: "utc" });
    if (!d.isValid) err(TypeError, `Invalid ISO date: ${v}`);
    return d.toUTC().toMillis();
  };

  const toMinutes = v => {
    if (typeof v !== "string") err(TypeError, `Invalid UTC time: ${v}`);
    const m = /^(\d{2}):(\d{2})$/.exec(v);
    if (!m) err(TypeError, `Invalid UTC time: ${v}`);

    const h = +m[1], n = +m[2];
    if (h > 24 || n > 59 || h === 24 && n)
      err(RangeError, `Invalid UTC time: ${v}`);

    return h * 60 + n;
  };

  if (!Array.isArray(calendarA) || !Array.isArray(calendarB))
    err(TypeError, "Calendars must be arrays");

  if (!constraints || typeof constraints !== "object" || Array.isArray(constraints))
    err(TypeError, "Constraints must be an object");

  if (typeof constraints.durationMinutes !== "number")
    err(TypeError, "durationMinutes must be a number");

  const duration = constraints.durationMinutes * M;
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isInteger(duration))
    err(RangeError, "durationMinutes must resolve to a positive whole millisecond value");

  const rangeStart = toMs(constraints.searchRange?.start);
  const rangeEnd = toMs(constraints.searchRange?.end);

  if (rangeEnd <= rangeStart)
    err(RangeError, "searchRange.end must be after searchRange.start");

  const workStart = toMinutes(constraints.workHours?.start);
  const workEnd = toMinutes(constraints.workHours?.end);

  if (workStart === 1440)
    err(RangeError, "workHours.start must be before 24:00");

  const midnight = ms => DateTime.fromMillis(ms, { zone: "utc" }).startOf("day").toMillis();
  const overnight = workEnd <= workStart;
  const work = [];

  const addWork = (s, e) => {
    const a = Math.max(s, rangeStart), b = Math.min(e, rangeEnd);
    if (a >= b) return;

    const l = work[work.length - 1];
    if (l && a <= l[1]) l[1] = Math.max(l[1], b);
    else work.push([a, b]);
  };

  for (
    let d = midnight(rangeStart) - (overnight ? D : 0), end = midnight(rangeEnd);
    d <= end;
    d += D
  )
    addWork(d + workStart * M, d + workEnd * M + (overnight ? D : 0));

  const busy = calendarA.concat(calendarB)
    .map(slot => {
      if (!slot || typeof slot !== "object")
        err(TypeError, "Busy slots must be objects");

      const s = toMs(slot.start), e = toMs(slot.end);
      if (e <= s) err(RangeError, "Busy slot end must be after start");

      return [Math.max(s, rangeStart), Math.min(e, rangeEnd)];
    })
    .filter(([s, e]) => s < e)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged = [];

  for (const [s, e] of busy) {
    const l = merged[merged.length - 1];
    if (l && s <= l[1]) l[1] = Math.max(l[1], e);
    else merged.push([s, e]);
  }

  const slots = [];
  const addSlots = (s, e) => {
    for (; s + duration <= e; s += duration)
      slots.push([s, s + duration]);
  };

  let i = 0;

  for (const [ws, we] of work) {
    while (merged[i]?.[1] <= ws) i++;

    let p = ws;

    for (let j = i; merged[j]?.[0] < we; j++) {
      const [bs, be] = merged[j];

      if (bs > p) addSlots(p, Math.min(bs, we));

      p = Math.max(p, Math.min(be, we));
      if (p >= we) break;
    }

    if (p < we) addSlots(p, we);
  }

  const iso = ms => DateTime.fromMillis(ms, { zone: "utc" }).toISO();

  return slots.map(([start, end]) => ({
    start: iso(start),
    end: iso(end)
  }));
}
export default findAvailableSlots;
// Generation time: 263.158s
// Result: PASS