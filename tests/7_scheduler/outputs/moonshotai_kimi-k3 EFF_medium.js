export async function findAvailableSlots(calendar1, calendar2, constraints) {
  const { DateTime } = await import('https://cdn.jsdelivr.net/npm/luxon@3/+esm');
  const utc = (s) => DateTime.fromISO(s, { zone: 'utc' });
  const { durationMinutes, searchRange, workHours } = constraints;
  const rs = utc(searchRange.start);
  const re = utc(searchRange.end);

  const busy = [...calendar1, ...calendar2]
    .map(({ start, end }) => [utc(start), utc(end)])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [s, e] of busy) {
    const last = merged.at(-1);
    if (last && s <= last[1]) last[1] = e > last[1] ? e : last[1];
    else merged.push([s, e]);
  }

  const free = [];
  let cur = rs;
  for (const [s, e] of merged) {
    const bs = s < rs ? rs : s;
    const be = e > re ? re : e;
    if (be <= rs || bs >= re) continue;
    if (bs > cur) free.push([cur, bs]);
    if (be > cur) cur = be;
  }
  if (cur < re) free.push([cur, re]);

  const [sh, sm] = workHours.start.split(':').map(Number);
  const [eh, em] = workHours.end.split(':').map(Number);
  const windows = [];
  for (let d = rs.startOf('day'); d < re; d = d.plus({ days: 1 })) {
    const ws = d.plus({ hours: sh, minutes: sm });
    let we = d.plus({ hours: eh, minutes: em });
    if (we <= ws) we = we.plus({ days: 1 });
    const s = ws > rs ? ws : rs;
    const e = we < re ? we : re;
    if (s < e) windows.push([s, e]);
  }

  const dur = { minutes: durationMinutes };
  const iso = (d) => d.toISO({ suppressMilliseconds: true });
  const slots = [];
  for (const [fs, fe] of free) {
    for (const [ws, we] of windows) {
      if (we <= fs) continue;
      if (ws >= fe) break;
      let t = fs > ws ? fs : ws;
      const end = fe < we ? fe : we;
      while (true) {
        const n = t.plus(dur);
        if (n > end) break;
        slots.push({ start: iso(t), end: iso(n) });
        t = n;
      }
    }
  }
  return slots;
}
export default findAvailableSlots;
// Generation time: 113.083s
// Result: PASS