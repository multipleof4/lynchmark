const luxonP = import('https://esm.sh/luxon@3.4.4');

const findAvailableSlots = async (a, b, c) => {
  const { DateTime, Duration } = await luxonP;
  if (c.durationMinutes <= 0) return [];

  const u = s => DateTime.fromISO(s, { zone: 'utc' });
  const hm = s => { const [h, m] = s.split(':'); return +h * 60 + +m; };

  const D = Duration.fromObject({ days: 1 });
  const z = Duration.fromObject({ minutes: c.durationMinutes });
  const w0 = hm(c.workHours.start);
  const w1 = hm(c.workHours.end);
  const rng = { s: u(c.searchRange.start), e: u(c.searchRange.end) };

  const busy = [...a, ...b]
    .map(x => ({ s: u(x.start), e: u(x.end) }))
    .filter(x => +x.s < +x.e)
    .sort((x, y) => +x.s - +y.s || +x.e - +y.e);

  const mrg = [];
  for (const x of busy) {
    const l = mrg[mrg.length - 1];
    if (l && +x.s <= +l.e) l.e = DateTime.max(l.e, x.e);
    else mrg.push({ s: x.s, e: x.e });
  }

  const free = [];
  let cur = rng.s;
  for (const x of mrg) {
    if (x.s > cur) free.push({ s: DateTime.max(cur, rng.s), e: DateTime.min(x.s, rng.e) });
    cur = DateTime.max(cur, x.e);
    if (cur >= rng.e) break;
  }
  if (cur < rng.e) free.push({ s: cur, e: rng.e });

  const slots = [];
  for (const x of free) {
    if (x.s >= x.e) continue;
    for (let d = x.s.startOf('day'); d <= x.e; d = d.plus(D)) {
      const i = DateTime.max(x.s, d.plus({ minutes: w0 }), rng.s);
      const j = DateTime.min(x.e, d.plus({ minutes: w1 }), rng.e);
      for (let t = i; j >= t.plus(z); t = t.plus(z)) {
        const v = t.plus(z);
        slots.push({ start: t.toJSDate().toISOString(), end: v.toJSDate().toISOString() });
      }
    }
  }

  return slots;
};
export default findAvailableSlots;
// Generation time: 173.316s
// Result: PASS