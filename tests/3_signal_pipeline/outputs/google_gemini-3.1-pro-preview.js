export async function analyzeSignal(y) {
  const [yM, mM, nM, fM, dM] = await Promise.all([
    'js-yaml', 'mathjs', 'ndarray', 'ndarray-fft', 'dompurify'
  ].map(p => import(`https://esm.sh/${p}`)));

  const load = yM.load || yM.default.load || yM.default;
  const { sin, pi, sqrt } = mM.default || mM;
  const ndarray = nM.default || nM;
  const fft = fM.default || fM;
  const DP = dM.default || dM;

  const c = load(y);
  const N = c.sampleRate * c.duration;
  const R = new Float64Array(N), I = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    let t = i / c.sampleRate, s = 0;
    for (const p of c.components) s += p.amplitude * sin(2 * pi * p.frequency * t);
    R[i] = s;
  }

  const r = ndarray(R), img = ndarray(I);
  fft(1, r, img);

  const pks = [], norm = N / 2;
  for (let k = 0; k <= norm; k++) {
    const m = sqrt(r.get(k) ** 2 + img.get(k) ** 2) / norm;
    if (m > 0.1) pks.push({
      frequencyHz: Math.round(k * c.sampleRate / N),
      magnitude: +m.toFixed(2)
    });
  }

  pks.sort((a, b) => b.magnitude - a.magnitude);

  const h = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${
    pks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('')
  }</table>`;

  return { peaks: pks, html: DP.sanitize(h), signalLength: N };
}
export default analyzeSignal;
// Generation time: 50.698s
// Result: PASS