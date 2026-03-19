async function analyzeSignal(yamlString) {
  const [{ load }, math, { default: ndarray }, { default: fft }, { default: sanitize }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm'),
    import('https://cdn.jsdelivr.net/npm/mathjs@11.5.0/+esm'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://cdn.jsdelivr.net/npm/dompurify@2.4.0/+esm')
  ]);

  const { sampleRate, duration, components } = load(yamlString);
  const N = sampleRate * duration;

  const signal = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const { frequency, amplitude } of components) {
      const omega = math.multiply(2 * math.pi, frequency);
      sum += amplitude * math.sin(math.multiply(omega, t));
    }
    signal[i] = sum;
  }

  const real = ndarray(signal, [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const halfN = N / 2;
  const peaks = [];
  for (let k = 0; k <= halfN; k++) {
    const re = real.get(k);
    const im = imag.get(k);
    const magnitude = math.sqrt(re * re + im * im) / halfN;
    if (magnitude > 0.1) {
      const frequencyHz = Math.round(k * sampleRate / N);
      peaks.push({ frequencyHz, magnitude: Math.round(magnitude * 100) / 100 });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  let html = '<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
  for (const { frequencyHz, magnitude } of peaks) {
    html += `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`;
  }
  html += '</table>';

  return { peaks, html: sanitize(html), signalLength: N };
}
export default analyzeSignal;
// Generation time: 134.381s
// Result: FAIL