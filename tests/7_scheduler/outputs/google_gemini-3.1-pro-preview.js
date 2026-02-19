const findAvailableSlots = async (c1, c2, { durationMinutes: dM, searchRange: sR, workHours: wH }) => {
  const [{ default: D }, { default: U }] = await Promise.all([
    import('https://esm.sh/dayjs'),
    import('https://esm.sh/dayjs/plugin/utc')
  ]);
  D.extend(U);

  let m = [], f = [], a = [], dm = dM * 6e4,
      c = D.utc(sR.start).valueOf(),
      e = D.utc(sR.end).valueOf(),
      [sH, sM] = wH.start.split(':'),
      [eH, eM] = wH.end.split(':');

  [...c1, ...c2]
    .map(x => ({ s: D.utc(x.start).valueOf(), e: D.utc(x.end).valueOf() }))
    .sort((x, y) => x.s - y.s)
    .forEach(x => {
      let l = m[m.length - 1];
      !l || l.e < x.s ? m.push(x) : l.e = Math.max(l.e, x.e);
    });

  m.forEach(x => {
    if (x.s > c && x.s <= e) f.push({ s: c, e: Math.min(x.s, e) });
    c = Math.max(c, x.e);
  });
  if (c < e) f.push({ s: c, e });

  f.forEach(x => {
    for (let p = x.s; p + dm <= x.e; p += dm) {
      let t = D.utc(p),
          w1 = t.clone().hour(sH).minute(sM).second(0).millisecond(0).valueOf(),
          w2 = t.clone().hour(eH).minute(eM).second(0).millisecond(0).valueOf();
      if (p >= w1 && p + dm <= w2) {
        a.push({ start: t.toISOString(), end: D.utc(p + dm).toISOString() });
      }
    }
  });

  return a;
};
export default findAvailableSlots;
// Generation time: 39.017s
// Result: PASS