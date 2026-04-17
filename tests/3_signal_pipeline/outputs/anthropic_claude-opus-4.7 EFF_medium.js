async function analyzeSignal(yamlStr) {
  const [yaml, math, ndarray, fft, DOMPurify] = (await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ])).map(m => m.default ?? m);

  const cfg = yaml.load(yamlStr);
  const N = cfg.sampleRate * cfg.duration;
  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / cfg.sampleRate;
    return cfg.components.reduce(
      (s, c) => s + c.amplitude * math.sin(2 * math.pi * c.frequency * t),
      0
    );
  });

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const half = N / 2;
  const peaks = [];
  for (let k = 0; k <= half; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half;
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * cfg.sampleRate / N),
        magnitude: Math.round(mag * 100) / 100
      });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('');
  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 9.148s
// Result: PASS