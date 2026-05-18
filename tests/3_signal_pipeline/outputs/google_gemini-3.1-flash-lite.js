async function analyzeSignal(yamlStr) {
  const [yaml, math, { default: ndarray }, fft, { sanitize }] = await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ]);

  const cfg = yaml.load(yamlStr);
  const N = cfg.sampleRate * cfg.duration;
  const real = ndarray(new Float64Array(N));
  const imag = ndarray(new Float64Array(N));

  for (let i = 0; i < N; i++) {
    const t = i / cfg.sampleRate;
    const v = cfg.components.reduce((acc, c) => 
      acc + c.amplitude * math.sin(2 * math.pi * c.frequency * t), 0);
    real.set(i, v);
  }

  fft(1, real, imag);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);
    if (mag > 0.1) peaks.push({ frequencyHz: Math.round(k * cfg.sampleRate / N), magnitude: +mag.toFixed(2) });
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  let html = '<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
  peaks.forEach(p => html += `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`);
  html += '</table>';

  return { peaks, html: sanitize(html), signalLength: N };
}
export default analyzeSignal;
// Generation time: 1.769s
// Result: FAIL