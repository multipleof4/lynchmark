const findAvailableSlots = async (cal1, cal2, { durationMinutes, searchRange, workHours }) => {
  const dayjs = (await import('https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js')).default;
  dayjs.extend((await import('https://cdn.jsdelivr.net/npm/dayjs@1/plugin/utc.js')).default);

  const min = s => (s = s.split(':'), +s[0] * 60 + +s[1]);
  const ts = s => dayjs.utc(s).valueOf();
  const iso = t => new Date(t).toISOString();
  const dur = durationMinutes * 60000;
  const ws = min(workHours.start), we = min(workHours.end);
  const rs = ts(searchRange.start), re = ts(searchRange.end);

  const merged = [...cal1, ...cal2]
    .map(x => ({ s: ts(x.start), e: ts(x.end) }))
    .sort((a, b) => a.s - b.s)
    .reduce((a, c) => {
      if (a.length && c.s <= a[a.length - 1].e) a[a.length - 1].e = Math.max(a[a.length - 1].e, c.e);
      else a.push(c);
      return a;
    }, []);

  const fill = (start, end) => {
    let t = start, res = [];
    while (t + dur <= end) {
      const sod = dayjs.utc(t).startOf('day').valueOf();
      const s = sod + ws * 60000, e = sod + we * 60000;
      if (t < s) t = s;
      if (t >= e) { t = sod + 86400000; continue; }
      if (t + dur <= e) {
        if (t + dur <= end) res.push({ start: iso(t), end: iso(t + dur) }), t += dur;
        else break;
      } else t = sod + 86400000;
    }
    return res;
  };

  let curr = rs, slots = [];
  merged.forEach(b => {
    if (b.s > curr) slots.push(...fill(curr, Math.min(b.s, re)));
    curr = Math.max(curr, b.e);
  });
  if (curr < re) slots.push(...fill(curr, re));
  return slots;
};
export default findAvailableSlots;
// Generation time: 508.729s
// Result: FAIL