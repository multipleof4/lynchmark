async function findShortestPath(g,s,e){const{PriorityQueue}=await import('https://cdn.jsdelivr.net/npm/js-priority-queue@0.1.0/index.min.js');const d=new Map(),q=new PriorityQueue({comparator:(a,b)=>a[0]-b[0]});d.set(s,0);q.queue([0,s]);const v=new Set();while(q.length){const[c,u]=q.dequeue();if(v.has(u))continue;v.add(u);if(u===e)return c;for(const[n,w]of Object.entries(g[u]||{})){const t=c+w;if(!d.has(n)||t<d.get(n)){d.set(n,t);q.queue([t,n])}}};return Infinity}
export default findShortestPath;
// Generation time: 1.299s
// Result: FAIL