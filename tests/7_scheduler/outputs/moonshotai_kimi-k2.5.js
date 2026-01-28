const findAvailableSlots = async (c1, c2, c) => {
  const { parseISO, addMinutes, min, max, isBefore, isAfter, compareAsc, startOfDay, addDays } = await import('https://esm.sh/date-fns@3.6.0');
  
  const p = x => parseISO(x.endsWith('Z') ? x : x + 'Z');
  const d = c.durationMinutes;
  const rs = p(c.searchRange.start);
  const re = p(c.searchRange.end);
  const [h1, m1] = c.workHours.start.split(':').map(Number);
  const [h2, m2] = c.workHours.end.split(':').map(Number);
  const wm1 = h1 * 60 + m1;
  const wm2 = h2 * 60 + m2;
  
  const busy = [...c1, ...c2]
    .map(x => ({ s: p(x.start), e: p(x.end) }))
    .sort((a, b) => compareAsc(a.s, b.s));
  
  const m = busy.reduce((a, b) => {
    const l = a[a.length - 1];
    if (!l || isBefore(l.e, b.s)) a.push(b);
    else if (isAfter(b.e, l.e)) l.e = b.e;
    return a;
  }, []);
  
  const free = [];
  let cur = rs;
  for (const b of m) {
    if (isBefore(cur, b.s)) free.push({ s: cur, e: min([b.s, re]) });
    cur = max([b.e, cur]);
    if (!isBefore(cur, re)) break;
  }
  if (isBefore(cur, re)) free.push({ s: cur, e: re });
  
  const r = [];
  const ws = x => addMinutes(startOfDay(x), wm1);
  const we = x => addMinutes(startOfDay(x), wm2);
  
  for (const f of free) {
    let day = startOfDay(f.s);
    while (isBefore(day, f.e)) {
      const a = max([f.s, ws(day), rs]);
      const b = min([f.e, we(day), re]);
      if (!isBefore(b, addMinutes(a, d))) {
        let t = a;
        while (!isAfter(addMinutes(t, d), b)) {
          r.push({ start: t.toISOString(), end: addMinutes(t, d).toISOString() });
          t = addMinutes(t, d);
        }
      }
      day = addDays(day, 1);
    }
  }
  
  return r;
};
export default findAvailableSlots;
// Generation time: 72.333s
// Result: PASS