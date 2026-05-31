async function findAvailableSlots(cal1, cal2, constraints) {
  const { DateTime } = await import('https://cdn.skypack.dev/luxon');
  const { durationMinutes: dur, searchRange, workHours } = constraints;
  const opt = { zone: 'utc' };
  const toDT = s => DateTime.fromISO(s, opt);
  const rs = toDT(searchRange.start), re = toDT(searchRange.end);
  const [wsH, wsM] = workHours.start.split(':').map(Number);
  const [weH, weM] = workHours.end.split(':').map(Number);

  const busy = [...cal1, ...cal2]
    .map(b => [toDT(b.start), toDT(b.end)])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [s, e] of busy) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) {
      if (e > last[1]) last[1] = e;
    } else merged.push([s, e]);
  }

  const slots = [];
  for (let day = rs.startOf('day'); day < re; day = day.plus({ days: 1 })) {
    const ws = day.set({ hour: wsH, minute: wsM, second: 0, millisecond: 0 });
    const we = day.set({ hour: weH, minute: weM, second: 0, millisecond: 0 });
    const winS = ws > rs ? ws : rs;
    const winE = we < re ? we : re;
    if (winS >= winE) continue;

    const free = [];
    let cur = winS;
    for (const [bs, be] of merged) {
      if (be <= cur || bs >= winE) continue;
      if (bs > cur) free.push([cur, bs]);
      if (be > cur) cur = be;
      if (cur >= winE) break;
    }
    if (cur < winE) free.push([cur, winE]);

    for (const [fs, fe] of free) {
      let start = fs;
      for (let nxt; (nxt = start.plus({ minutes: dur })) <= fe; start = nxt) {
        slots.push({ start: start.toUTC().toISO(), end: nxt.toUTC().toISO() });
      }
    }
  }

  return slots.sort((a, b) => (a.start < b.start ? -1 : 1));
}
export default findAvailableSlots;
// Generation time: 22.608s
// Result: PASS