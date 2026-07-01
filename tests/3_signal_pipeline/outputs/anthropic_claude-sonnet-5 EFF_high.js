async function analyzeSignal(yamlString) {
  const [
    { default: yaml },
    { default: math },
    { default: ndarray },
    { default: fft },
    { default: DOMPurify },
  ] = await Promise.all([
    import('https://esm.sh/js-yaml@4'),
    import('https://esm.sh/mathjs@12'),
    import('https://esm.sh/ndarray@1'),
    import('https://esm.sh/ndarray-fft@1'),
    import('https://esm.sh/dompurify@3'),
  ]);

  const config = yaml.load(yamlString);
  const { sampleRate, duration, components } = config;
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

  const half = N / 2;
  const magnitude = Array.from({ length: half + 1 }, (_, k) => {
    const re = real.get(k);
    const im = imag.get(k);
    return math.sqrt(re * re + im * im) / half;
  });

  const peaks = magnitude
    .map((mag, k) => ({ frequencyHz: (k * sampleRate) / N, magnitude: mag }))
    .filter(({ magnitude }) => magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude)
    .map(({ frequencyHz, magnitude }) => ({
      frequencyHz: Math.round(frequencyHz),
      magnitude: Math.round(magnitude * 100) / 100,
    }));

  const rows = peaks
    .map(({ frequencyHz, magnitude }) => `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`)
    .join('');

  const rawHtml = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`;
  const html = DOMPurify.sanitize(rawHtml);

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 8.829s
// Result: FAIL