async function findAvailableSlots(cal1, cal2, c) {
  const { DateTime } = await import('https://esm.sh/luxon@3');
  const s = DateTime.fromISO(c.searchRange.start, { zone: 'utc' });
  const e = DateTime.fromISO(c.searchRange.end, { zone: 'utc' });
  
  let work = [];
  let cur = s;
  const [wSH, wSM] = c.workHours.start.split(':').map(Number);
  const [wEH, wEM] = c.workHours.end.split(':').map(Number);
  
  while (cur < e) {
    const ws = cur.set({ hour: wSH, minute: wSM, second: 0, millisecond: 0 });
    const we = cur.set({ hour: wEH, minute: wEM, second: 0, millisecond: 0 });
    if (we > ws) work.push({ start: ws, end: we });
    cur = cur.plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  }
  
  const busy = [...cal1, ...cal2]
    .map(b => ({ 
      start: DateTime.fromISO(b.start, { zone: 'utc' }), 
      end: DateTime.fromISO(b.end, { zone: 'utc' }) 
    }))
    .filter(b => b.start < b.end)
    .sort((a, b) => a.start - b.start);
    
  let merged = [];
  for (const b of busy) {
    const last = merged[merged.length - 1];
    if (merged.length && b.start <= last.end) last.end = DateTime.max(last.end, b.end);
    else merged.push({ ...b });
  }
  
  let free = [];
  for (const w of work) {
    let cs = w.start;
    for (const b of merged) {
      if (b.end <= cs) continue;
      if (b.start >= w.end) break;
      if (b.start > cs) free.push({ start: cs, end: b.start });
      cs = DateTime.max(cs, b.end);
      if (cs >= w.end) break;
    }
    if (cs < w.end) free.push({ start: cs, end: w.end });
  }
  
  const d = c.durationMinutes;
  const slots = [];
  for (const f of free) {
    let ss = f.start;
    while (ss.plus({ minutes: d }) <= f.end) {
      slots.push({ 
        start: ss.toISO({ suppressMilliseconds: true }), 
        end: ss.plus({ minutes: d }).toISO({ suppressMilliseconds: true }) 
      });
      ss = ss.plus({ minutes: d });
    }
  }
  return slots;
}
export default findAvailableSlots;
// Generation time: 59.287s
// Result: PASS