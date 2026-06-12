const analyzeSignal = async yamlStr => {
  const [yaml, math, ndarray, fft, DOMPurify] = (await Promise.all(
    ['js-yaml', 'mathjs', 'ndarray', 'ndarray-fft', 'dompurify']
      .map(pkg => import(`https://esm.sh/${pkg}`))
  )).map(m => m.default ?? m);

  const { sampleRate, duration, components } = yaml.load(yamlStr);
  const N = sampleRate * duration;

  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;
    return components.reduce(
      (sum, { frequency, amplitude }) =>
        sum + amplitude * math.sin(2 * math.pi * frequency * t),
      0
    );
  });

  const real = ndarray(new Float64Array(signal));
  const imag = ndarray(new Float64Array(N));
  fft(1, real, imag);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const magnitude = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);
    if (magnitude > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * sampleRate / N),
        magnitude: Math.round(magnitude * 100) / 100
      });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join('');
  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
};
export default analyzeSignal;
// Generation time: 16.968s
// Result: PASS