const analyzeSignal=async y=>{
  const[{load},{sin,pi,sqrt},ndarray,fft,{default:DOMPurify}]=await Promise.all([
    import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs'),
    import('https://cdn.jsdelivr.net/npm/mathjs@11.8.0/lib/esm/index.js'),
    import('https://cdn.jsdelivr.net/npm/ndarray@1.0.19/+esm'),
    import('https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.3/+esm'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3.0.3/dist/purify.es.mjs')
  ]);
  const{sampleRate:s,duration:d,components:c}=load(y),N=s*d,
  signal=Array(N).fill().map((_,i)=>{
    const t=i/s;
    return c.reduce((a,{frequency:f,amplitude:m})=>a+m*sin(2*pi*f*t),0)
  }),
  real=ndarray(signal),
  imag=ndarray(Array(N).fill(0));
  fft(1,real,imag);
  const H=N/2,
  mags=Array(H+1).fill().map((_,k)=>sqrt(real.get(k)**2+imag.get(k)**2)/H),
  peaks=mags.map((m,k)=>({frequencyHz:Math.round(k*s/N),magnitude:Math.round(m*100)/100}))
    .filter(p=>p.magnitude>.1)
    .sort((a,b)=>b.magnitude-a.magnitude),
  html=`<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${peaks.map(p=>`<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('')}</table>`;
  return{peaks,html:DOMPurify.sanitize(html),signalLength:N}
}
export default analyzeSignal;
// Generation time: 171.544s
// Result: FAIL