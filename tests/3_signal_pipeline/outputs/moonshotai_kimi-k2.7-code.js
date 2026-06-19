const analyzeSignal = async (yamlString) => {
  const [yaml, mathMod, ndarrayMod, fftMod, domMod] = await Promise.all([
    import('https://esm.sh/js-yaml@4.1.0'),
    import('https://esm.sh/mathjs@11.11.0'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify@3.0.3')
  ]);
  const math = mathMod.default;
  const ndarray = ndarrayMod.default;
  const fft = fftMod.default;
  const DOMPurify = domMod.default(window);
  const { sampleRate, duration, components } = yaml.load(yamlString);
  const N = sampleRate * duration;
  const half = N / 2;
  const signal = new Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let s = 0;
    for (const { frequency, amplitude } of components) {
      s += amplitude * math.sin(2 * math.pi * frequency * t);
    }
    signal[i] = s;
  }
  const real = ndarray(new Float64Array(signal));
  const imag = ndarray(new Float64Array(N));
  fft(1, real, imag);
  const magnitude = [];
  for (let k = 0; k <= half; k++) {
    magnitude[k] = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half;
  }
  const peaks = magnitude
    .map((m, k) => ({
      frequencyHz: Math.round(k * sampleRate / N),
      magnitude: Math.round(m * 100) / 100
    }))
    .filter(p => p.magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude);
  const html = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join('')}</table>`;
  return { peaks, html: DOMPurify.sanitize(html), signalLength: N };
};
export default analyzeSignal;
// Generation time: 83.104s
// Result: FAIL