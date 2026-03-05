async function analyzeSignal(yamlStr) {
  const [{ default: yaml }, { default: math }, { default: nd }, { default: fft }, { default: purify }] = await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ]);

  const { sampleRate: sr, duration, components } = yaml.load(yamlStr);
  const N = sr * duration;
  const sig = Array.from({ length: N }, (_, i) =>
    components.reduce((s, { frequency, amplitude }) =>
      s + amplitude * math.sin(2 * math.pi * frequency * i / sr), 0)
  );

  const re = nd(new Float64Array(sig), [N]);
  const im = nd(new Float64Array(N), [N]);
  fft(1, re, im);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(re.get(k) ** 2 + im.get(k) ** 2) / (N / 2);
    if (mag > 0.1) peaks.push({
      frequencyHz: Math.round(k * sr / N),
      magnitude: +mag.toFixed(2)
    });
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  return {
    peaks,
    html: purify.sanitize(`<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${
      peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('')
    }</table>`),
    signalLength: N
  };
}
export default analyzeSignal;
// Generation time: 285.288s
// Result: FAIL