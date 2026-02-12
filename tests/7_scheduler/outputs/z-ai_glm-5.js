const findAvailableSlots = async (c1, c2, { durationMinutes, searchRange, workHours }) => {
  const { parseISO, addMinutes, eachDayOfInterval, min, max } = await import('https://esm.sh/date-fns');
  const iso = d => d.toISOString();
  const busy = [...c1, ...c2]
    .map(b => ({ start: parseISO(b.start), end: parseISO(b.end) }))
    .sort((a, b) => a.start - b.start)
    .reduce((a, c) => {
      if (!a.length || a[a.length - 1].end < c.start) a.push(c);
      else a[a.length - 1].end = new Date(Math.max(a[a.length - 1].end, c.end));
      return a;
    }, []);

  const range = { start: parseISO(searchRange.start), end: parseISO(searchRange.end) };
  
  return eachDayOfInterval(range).flatMap(day => {
    const [sh, sm] = workHours.start.split(':').map(Number);
    const [eh, em] = workHours.end.split(':').map(Number);
    let s = new Date(day); s.setUTCHours(sh, sm, 0, 0);
    let e = new Date(day); e.setUTCHours(eh, em, 0, 0);
    s = max([s, range.start]);
    e = min([e, range.end]);
    if (s >= e) return [];
    
    const slots = [];
    let cur = s;
    while (cur < e) {
      const nxt = addMinutes(cur, durationMinutes);
      const overlap = busy.find(b => cur < b.end && b.start < nxt);
      if (overlap) cur = overlap.end;
      else if (nxt <= e) slots.push({ start: iso(cur), end: iso(nxt) }), cur = nxt;
      else break;
    }
    return slots;
  });
};
export default findAvailableSlots;
// Generation time: 257.354s
// Result: PASS