async function analyzeSignal(str) {
  const [
    { load },
    { create, all },
    { default: ndarray },
    { default: ndfft },
    { default: purify }
  ] = await Promise.all([
    import('https://cdn.skypack.dev/js-yaml'),
    import('https://cdn.skypack.dev/mathjs'),
    import('https://cdn.skypack.dev/ndarray'),
    import('https://cdn.skypack.dev/ndarray-fft'),
    import('https://cdn.skypack.dev/dompurify')
  ]);

  const m = create(all);
  const { sampleRate: s, duration: d, components: c } = load(str);
  const N = s * d;
  const sig = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / s;
    let v = 0;
    for (const { frequency: f, amplitude: a } of c) {
      v += a * m.sin(2 * m.pi * f * t);
    }
    sig[i] = v;
  }

  const r = ndarray(sig);
  const im = ndarray(new Float64Array(N));
  ndfft(1, r, im);

  const peaks = [];
  const half = N / 2;

  for (let k = 0; k <= half; k++) {
    const rv = r.get(k);
    const iv = im.get(k);
    const mag = m.sqrt(rv * rv + iv * iv) / half;
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * s / N),
        magnitude: Number(mag.toFixed(2))
      });
    }
  }

  peaks.sort((x, y) => y.magnitude - x.magnitude);

  const html = peaks.reduce((h, p) => 
    `${h}<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`, 
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>`
  ) + "</table>";

  return { peaks, html: purify.sanitize(html), signalLength: N };
}
export default analyzeSignal;
// Generation time: 341.010s
// Result: FAIL