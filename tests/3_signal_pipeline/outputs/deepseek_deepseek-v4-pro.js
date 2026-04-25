async function analyzeSignal(y) {
  const [Y, M, Nd, Fft, P] = await Promise.all([
    import('https://esm.run/js-yaml@4.1.0').then(m => m.default),
    import('https://esm.run/mathjs@11.8.0').then(m => m.default),
    import('https://esm.run/ndarray@1.0.19').then(m => m.default),
    import('https://esm.run/ndarray-fft@1.0.3').then(m => m.default),
    import('https://esm.run/dompurify@3.0.5').then(m => m.default)
  ]);
  const cfg = Y.load(y),
    sr = cfg.sampleRate,
    d = cfg.duration,
    comps = cfg.components,
    N = sr * d,
    sig = Array.from({ length: N }, (_, i) => {
      const t = i / sr;
      return comps.reduce((s, c) => s + c.amplitude * M.sin(2 * M.pi * c.frequency * t), 0);
    }),
    real = Nd(new Float64Array(sig), [N]),
    imag = Nd(new Float64Array(N), [N]);
  Fft(1, real, imag);
  const half = N / 2,
    peaks = [];
  for (let k = 0; k <= half; k++) {
    const re = real.get(k),
      im = imag.get(k),
      mag = M.sqrt(re * re + im * im) / half;
    if (mag > 0.1) peaks.push({ f: Math.round(k * sr / N), m: Math.round(mag * 1e2) / 1e2 });
  }
  peaks.sort((a, b) => b.m - a.m);
  let h = '<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
  for (const p of peaks) h += `<tr><td>${p.f}</td><td>${p.m}</td></tr>`;
  h += '</table>';
  const sH = P.sanitize(h);
  return {
    peaks: peaks.map(p => ({ frequencyHz: p.f, magnitude: p.m })),
    html: sH,
    signalLength: N
  };
}
export default analyzeSignal;
// Generation time: 102.963s
// Result: FAIL