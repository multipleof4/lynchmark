async function findAvailableSlots(c1,c2,ct){
const{DateTime:D,Interval:I}=await import('https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm');
const p=s=>D.fromISO(s,{zone:'utc'});
const{durationMinutes:dm,searchRange:{start:rss,end:ree},workHours:{start:wss,end:wee}}=ct;
const rS=p(rss),rE=p(ree);
const[wh,wm]=wss.split(':').map(Number),[eh,em]=wee.split(':').map(Number);
let bs=[];
for(const c of[c1,c2])for(const s of c)bs.push(I.fromDateTimes(p(s.start),p(s.end)));
bs.sort((a,b)=>a.start-b.start);
const mg=[];
for(const iv of bs){
if(!mg.length||mg[mg.length-1].end<iv.start)mg.push(iv);
else{const l=mg[mg.length-1];mg[mg.length-1]=I.fromDateTimes(l.start,D.max(l.end,iv.end));}
}
const fs=[];
let cur=rS;
for(const b of mg){
if(b.end<=cur)continue;
if(b.start>cur){const fe=D.min(b.start,rE);if(fe>cur)fs.push(I.fromDateTimes(cur,fe));}
cur=D.max(cur,b.end);if(cur>=rE)break;
}
if(cur<rE)fs.push(I.fromDateTimes(cur,rE));
const ws=[];
let dy=rS.startOf('day');
const ld=rE.startOf('day');
while(dy<=ld){
const wS=dy.set({hour:wh,minute:wm,second:0,millisecond:0});
const wE=dy.set({hour:eh,minute:em,second:0,millisecond:0});
const wi=I.fromDateTimes(wS,wE).intersection(I.fromDateTimes(rS,rE));
if(wi&&!wi.isEmpty())ws.push(wi);
dy=dy.plus({days:1});
}
const av=[];
for(const f of fs)for(const w of ws){const i=f.intersection(w);if(i&&!i.isEmpty())av.push(i);}
av.sort((a,b)=>a.start-b.start);
const sl=[];
for(const a of av){
let st=a.start;
for(;;){
const en=st.plus({minutes:dm});
if(en>a.end)break;
sl.push({start:st.toISO(),end:en.toISO()});
st=en;
}
}
return sl;
}
export default findAvailableSlots;
// Generation time: 44.730s
// Result: PASS