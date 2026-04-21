async function processCSV(csv,{filterColumn,filterValue,groupBy:g,aggregateColumn,operation}){
const[Papa,{groupBy,sum}]=await Promise.all([
import('https://esm.sh/papaparse@5.4.1').then(m=>m.default),
import('https://esm.sh/lodash-es@4.17.21')
]);
const{data}=Papa.parse(csv,{header:true,skipEmptyLines:true});
const filtered=data.filter(r=>r[filterColumn]==filterValue);
const groups=groupBy(filtered,r=>r[g]);
return Object.entries(groups).map(([k,v])=>{
const n=v.map(r=>+r[aggregateColumn]||0);
const result=operation==='sum'?sum(n):operation==='avg'?sum(n)/n.length:v.length;
return{[g]:k,result};
});
}
export default processCSV;
// Generation time: 205.075s
// Result: PASS