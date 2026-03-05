async function analyzeSignal(yamlString) {
  const [
    { default: jsYaml },
    math,
    { default: ndarray },
    ndarrayFft,
    DOMPurify
  ] = await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ]);

  const cfg = jsYaml.load(yamlString);
  const N = cfg.sampleRate * cfg.duration;
  const signal = Array(N).fill(0).map((_, i) => {
    const t = i / cfg.sampleRate;
    return cfg.components.reduce((s, c) =>
      s + c.amplitude * math.sin(2 * math.pi * c.frequency * t), 0);
  });

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  ndarrayFft(1, real, imag);

  const half = N / 2;
  const mags = Array(half + 1).fill(0).map((_, k) =>
    math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half);

  const peaks = mags
    .map((m, k) => ({ frequencyHz: Math.round(k * cfg.sampleRate / N), magnitude: +m.toFixed(2) }))
    .filter(p => p.magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('');
  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 6.922s
// Result: FAIL