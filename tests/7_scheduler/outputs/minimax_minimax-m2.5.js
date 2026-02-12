async function findAvailableSlots(A,B,C){
  const D=(await import('https://cdn.jsdelivr.net/npm/dayjs@1.11.7/dayjs.esm.min.js')).default;
  const E=D.utc;
  const F=[...A,...B].sort((a,b)=>E(a.start).diff(E(b.start)));
  const G=[];
  for(const{start:s,end:e}of F){
    const S=E(s),E0=E(e);
    if(!G.length||S.isAfter(G[G.length-1].e))G.push({s:S,e:E0});
    else if(E0.isAfter(G[G.length-1].e))G[G.length-1].e=E0;
  }
  const{durationMinutes:d,searchRange:{start:S0,end:E1},workHours:{start:wS,end:wE}}=C;
  const T=t=>+t.slice(0,2)*60+ +t.slice(3);
  const wSmin=T(wS),wEmin=T(wE);
  const S=E(S0),En=E(E1);
  const R=[];
  let cur=S;
  for(const{s:b,e:ee}of G){
    if(b.isAfter(cur)&&b.isBefore(En))R.push({s:cur,e:b});
    if(ee.isAfter(cur))cur=ee;
    if(cur.isSame(En)||cur.isAfter(En))break;
  }
  if(cur.isBefore(En))R.push({s:cur,e:En});
  const O=[];
  for(const{s:f,e:g}of R){
    let x=f;
    while(true){
      const y=x.add(d,'minute');
      if(y.isAfter(g))break;
      const m1=x.hour()*60+x.minute(),m2=y.hour()*60+y.minute();
      if(m1>=wSmin&&m2<=wEmin)O.push({start:x.toISO(),end:y.toISO()});
      x=y;
    }
  }
  return O;
}
export default findAvailableSlots;
// Generation time: 175.444s
// Result: FAIL