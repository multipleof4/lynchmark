async function findAvailableSlots(cal1, cal2, constraints) {
  const { DateTime } = await import('https://esm.sh/luxon@3.4.4');
  const { durationMinutes, searchRange, workHours } = constraints;
  const s = DateTime.fromISO(searchRange.start, { zone: 'utc' });
  const e = DateTime.fromISO(searchRange.end, { zone: 'utc' });
  const dur = { minutes: durationMinutes };
  const busy = [...cal1, ...cal2]
    .map(x => [DateTime.fromISO(x.start, { zone: 'utc' }), DateTime.fromISO(x.end, { zone: 'utc' })])
    .filter(([a, b]) => b > s && a < e)
    .map(([a, b]) => [a < s ? s : a, b > e ? e : b])
    .sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [a, b] of busy) {
    const last = merged[merged.length - 1];
    if (!last || a > last[1]) merged.push([a, b]);
    else if (b > last[1]) last[1] = b;
  }
  const [wsh, wsm] = workHours.start.split(':').map(Number);
  const [weh, wem] = workHours.end.split(':').map(Number);
  const slots = [];
  for (let day = s.startOf('day'); day <= e; day = day.plus({ days: 1 })) {
    const ws = day.set({ hour: wsh, minute: wsm, second: 0, millisecond: 0 });
    const we = day.set({ hour: weh, minute: wem, second: 0, millisecond: 0 });
    const winS = ws < s ? s : ws;
    const winE = we > e ? e : we;
    if (winS >= winE) continue;
    let cur = winS;
    for (const [a, b] of merged) {
      if (b <= cur) continue;
      if (a >= winE) break;
      if (a > cur) add(cur, a < winE ? a : winE);
      if (b > cur) cur = b > winE ? winE : b;
      if (cur >= winE) break;
    }
    if (cur < winE) add(cur, winE);
  }
  function add(a, b) {
    let t = a;
    while (t.plus(dur) <= b) {
      const n = t.plus(dur);
      slots.push({ start: t.toUTC().toISO(), end: n.toUTC().toISO() });
      t = n;
    }
  }
  return slots;
}
export default findAvailableSlots;
// Generation time: 191.955s
// Result: PASS