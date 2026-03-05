async function analyzeSignal(yamlStr) {
  const [
    { load: parseYaml },
    math,
    ndarray,
    fft,
    { default: purify }
  ] = await Promise.all([
    import('https://cdn.skypack.dev/js-yaml'),
    import('https://cdn.skypack.dev/mathjs'),
    import('https://cdn.skypack.dev/ndarray'),
    import('https://cdn.skypack.dev/ndarray-fft'),
    import('https://cdn.skypack.dev/dompurify')
  ]);

  const { sampleRate: fs, duration, components } = parseYaml(yamlStr);
  const N = fs * duration;
  const signal = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / fs;
    signal[i] = components.reduce((acc, { frequency: f, amplitude: a }) => 
      acc + a * math.sin(2 * math.pi * f * t), 0);
  }

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * fs / N),
        magnitude: +mag.toFixed(2)
      });
    }
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('');
  const rawHtml = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`;

  return {
    peaks,
    html: purify.sanitize(rawHtml),
    signalLength: N
  };
}
export default analyzeSignal;
// Generation time: 4.379s
// Result: FAIL