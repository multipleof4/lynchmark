const findAvailableSlots = async (c1, c2, cn) => {
  const { DateTime: D } = await import('https://cdn.jsdelivr.net/npm/luxon@3/+esm');
  const f = s => D.fromISO(s, { zone: 'UTC' });
  const m = t => { const [h, v] = t.split(':'); return +h * 60 + +v; };
  const g = d => d.hour * 60 + d.minute;
  const ws = m(cn.workHours.start), we = m(cn.workHours.end), dur = cn.durationMinutes;
  let merged = [...c1, ...c2].map(x => ({ s: f(x.start), e: f(x.end) })).sort((a, b) => a.s - b.s);
  let busy = [];
  for (let b of merged) {
    if (!busy.length || b.s > busy[busy.length - 1].e) busy.push(b);
    else if (b.e > busy[busy.length - 1].e) busy[busy.length - 1].e = b.e;
  }
  let res = [], cur = f(cn.searchRange.start), end = f(cn.searchRange.end);
  const nWs = d => d.plus({ days: 1 }).startOf('day').plus({ minutes: ws });
  const proc = (fS, fE) => {
    let c = fS;
    if (g(c) < ws) c = c.startOf('day').plus({ minutes: ws });
    while (c < fE) {
      if (g(c) >= we) { c = nWs(c); continue; }
      let e = c.plus({ minutes: dur });
      if (e > fE) break;
      if (g(e) <= we) { res.push({ start: c.toISO(), end: e.toISO() }); c = e; }
      else { if (g(c) <= ws) break; c = nWs(c); }
    }
  };
  for (let b of busy) {
    if (cur < b.s) proc(cur, b.s);
    if (cur < b.e) cur = b.e;
  }
  if (cur < end) proc(cur, end);
  return res;
};
export default findAvailableSlots;
// Generation time: 134.745s
// Result: PASS