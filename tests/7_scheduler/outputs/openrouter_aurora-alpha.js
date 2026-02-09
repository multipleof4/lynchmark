async function findAvailableSlots(c1, c2, { durationMinutes: d, searchRange: { start: rs, end: re }, workHours: { start: whs, end: whe } }) {
  const dayjs = (await import('https://cdn.skypack.dev/dayjs')).default;
  const utc = (await import('https://cdn.skypack.dev/dayjs/plugin/utc')).default;
  dayjs.extend(utc);
  const to = s => dayjs.utc(s);
  const busy = [...c1, ...c2].map(o => ({ s: to(o.start), e: to(o.end) })).sort((a, b) => a.s - b.s);
  const merged = [];
  for (const b of busy) {
    if (!merged.length || b.s.isAfter(merged[merged.length - 1].e)) merged.push(b);
    else if (b.e.isAfter(merged[merged.length - 1].e)) merged[merged.length - 1].e = b.e;
  }
  const sr = to(rs), er = to(re);
  const free = [];
  let cur = sr;
  for (const b of merged) {
    if (b.e.isAfter(cur)) {
      if (b.s.isAfter(cur)) free.push({ s: cur, e: b.s });
      cur = dayjs.max(cur, b.e);
    }
  }
  if (cur.isBefore(er)) free.push({ s: cur, e: er });
  const [whsh, whsm] = whs.split(':').map(Number);
  const [wheh, whom] = whe.split(':').map(Number);
  const slots = [];
  for (let day = sr.startOf('day'); day.isBefore(er); day = day.add(1, 'day')) {
    const ws = day.set('hour', whsh).set('minute', whsm);
    const we = day.set('hour', wheh).set('minute', whom);
    for (const f of free) {
      const s = dayjs.max(f.s, ws);
      const e = dayjs.min(f.e, we);
      for (let t = s; !t.add(d, 'minute').isAfter(e); t = t.add(d, 'minute')) {
        slots.push({ start: t.toISOString(), end: t.add(d, 'minute').toISOString() });
      }
    }
  }
  return slots;
}
export default findAvailableSlots;
// Generation time: 3.739s
// Result: FAIL