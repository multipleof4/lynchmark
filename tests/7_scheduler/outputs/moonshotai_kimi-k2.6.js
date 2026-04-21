const findAvailableSlots = async (c1, c2, c) => {
  const { parseISO, addMinutes, min, max, isBefore, isAfter } = await import('https://esm.sh/date-fns@3.6.0');
  const dur = c.durationMinutes;
  if (dur <= 0) return [];
  const utc = s => parseISO(/Z|[+-]\d{2}:?\d{2}$/.test(s) ? s : s.includes('T') ? s + 'Z' : s + 'T00:00:00Z');
  const mins = s => { const [h, m] = s.split(':'); return (+h * 60 + +m) * 6e4; };
  const rs = utc(c.searchRange.start), re = utc(c.searchRange.end);
  const ws = mins(c.workHours.start), we = mins(c.workHours.end);
  const day = 864e5;

  const b = [...(c1 || []), ...(c2 || [])]
    .map(x => ({ s: utc(x.start), e: utc(x.end) }))
    .filter(x => isBefore(x.s, re) && isAfter(x.e, rs))
    .map(x => ({ s: max([x.s, rs]), e: min([x.e, re]) }))
    .sort((a, b) => +a.s - +b.s || +a.e - +b.e);

  const m = [];
  for (const x of b) {
    const l = m[m.length - 1];
    if (l && +x.s <= +l.e) l.e = max([l.e, x.e]);
    else m.push({ s: x.s, e: x.e });
  }

  const f = [];
  let p = rs;
  for (const x of m) {
    if (isBefore(p, x.s)) f.push([p, x.s]);
    p = max([p, x.e]);
  }
  if (isBefore(p, re)) f.push([p, re]);

  const r = [];
  for (const [a, z] of f) {
    let cur = a;
    while (!isAfter(cur, z)) {
      const end = addMinutes(cur, dur);
      if (isAfter(end, z)) break;
      const st = +cur, en = +end;
      if (Math.floor(st / day) === Math.floor(en / day)) {
        const sm = st % day, em = en % day;
        if (sm >= ws && em <= we) r.push({ start: cur.toISOString(), end: end.toISOString() });
      }
      cur = end;
    }
  }
  return r;
};
export default findAvailableSlots;
// Generation time: 492.497s
// Result: PASS