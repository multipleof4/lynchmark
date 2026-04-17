async function findAvailableSlots(cal1, cal2, { durationMinutes, searchRange, workHours }) {
  const { parseISO, addMinutes } = await import('https://cdn.skypack.dev/date-fns');
  const ms = s => parseISO(s).getTime();
  const iso = t => new Date(t).toISOString();
  const parseHM = t => {
    const [h, m] = t.split(':').map(Number);
    return (h * 60 + m) * 60000;
  };

  const rs = ms(searchRange.start);
  const re = ms(searchRange.end);
  const durMs = durationMinutes * 60000;
  const whS = parseHM(workHours.start);
  const whE = parseHM(workHours.end);
  const DAY = 86400000;

  const merged = [...cal1, ...cal2]
    .map(b => [ms(b.start), ms(b.end)])
    .filter(([s, e]) => e > rs && s < re)
    .map(([s, e]) => [Math.max(s, rs), Math.min(e, re)])
    .sort((a, b) => a[0] - b[0])
    .reduce((acc, [s, e]) => {
      const last = acc.at(-1);
      if (last && s <= last[1]) last[1] = Math.max(last[1], e);
      else acc.push([s, e]);
      return acc;
    }, []);

  const free = [];
  let cur = rs;
  for (const [s, e] of merged) {
    if (s > cur) free.push([cur, s]);
    cur = Math.max(cur, e);
  }
  if (cur < re) free.push([cur, re]);

  const slots = [];
  for (const [fs, fe] of free) {
    for (let day = Math.floor(fs / DAY) * DAY; day < fe; day += DAY) {
      const s = Math.max(fs, day + whS);
      const e = Math.min(fe, day + whE);
      for (let t = s; t + durMs <= e; t = addMinutes(new Date(t), durationMinutes).getTime()) {
        slots.push({ start: iso(t), end: iso(t + durMs) });
      }
    }
  }

  return slots;
}
export default findAvailableSlots;
// Generation time: 28.829s
// Result: PASS