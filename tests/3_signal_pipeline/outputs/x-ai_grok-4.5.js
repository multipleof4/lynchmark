async function analyzeSignal(y){
const[m1,m2,m3,m4,m5]=await Promise.all([
import('https://esm.sh/js-yaml'),
import('https://esm.sh/mathjs'),
import('https://esm.sh/ndarray'),
import('https://esm.sh/ndarray-fft'),
import('https://esm.sh/dompurify')
]);
const yaml=m1.default,math=m2.default,nd=m3.default,fft=m4.default,DP=m5.default;
const c=yaml.load(y),{sampleRate:sr,duration:d,components:cs}=c,N=sr*d;
const s=Array.from({length:N},(_,i)=>cs.reduce((a,{frequency:f,amplitude:A})=>a+A*math.sin(2*math.pi*f*i/sr),0));
const re=nd(s),im=nd(new Float64Array(N));
fft(1,re,im);
const mag=[],h=N/2;
for(let k=0;k<=h;k++)mag[k]=math.sqrt(re.get(k)**2+im.get(k)**2)/h;
const peaks=[];
for(let k=0;k<=h;k++)if(mag[k]>0.1)peaks.push({frequencyHz:Math.round(k*sr/N),magnitude:+mag[k].toFixed(2)});
peaks.sort((a,b)=>b.magnitude-a.magnitude);
let htm='<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
for(const p of peaks)htm+=`<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`;
htm+='</table>';
return{peaks,html:DP.sanitize(htm),signalLength:N}
}
export default analyzeSignal;
// Generation time: 30.792s
// Result: FAIL