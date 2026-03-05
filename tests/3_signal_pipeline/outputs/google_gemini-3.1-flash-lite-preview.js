async function analyzeSignal(yaml) {
  const [yamlLib, math, ndarray, fft, purify] = await Promise.all([
    import('https://cdn.skypack.dev/js-yaml'),
    import('https://cdn.skypack.dev/mathjs'),
    import('https://cdn.skypack.dev/ndarray'),
    import('https://cdn.skypack.dev/ndarray-fft'),
    import('https://cdn.skypack.dev/dompurify')
  ]);

  const { sampleRate, duration, components } = yamlLib.load(yaml);
  const N = sampleRate * duration;
  const real = ndarray(new Float64Array(N));
  const imag = ndarray(new Float64Array(N));

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    real.set(i, components.reduce((acc, c) => 
      acc + c.amplitude * math.sin(2 * math.pi * c.frequency * t), 0));
  }

  fft(1, real, imag);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);
    if (mag > 0.1) peaks.push({ 
      frequencyHz: Math.round(k * sampleRate / N), 
      magnitude: Math.round(mag * 100) / 100 
    });
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const html = purify.sanitize(`<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>` +
    peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('') +
    `</table>`);

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 2.100s
// Result: FAIL