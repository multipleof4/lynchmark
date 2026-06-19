async function analyzeSignal(yamlStr) {
  const [{ default: yaml }, { default: math }, { default: ndarray }, { default: fft }, { default: DOMPurify }] = await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ]);

  const { sampleRate, duration, components } = yaml.load(yamlStr);
  const N = sampleRate * duration;
  const signal = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    signal[i] = components.reduce((s, c) => s + c.amplitude * math.sin(2 * math.pi * c.frequency * t), 0);
  }

  const real = ndarray(signal, [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * sampleRate / N),
        magnitude: parseFloat(mag.toFixed(2))
      });
    }
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);
  
  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('');
  const html = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`;

  return { peaks, html: DOMPurify.sanitize(html), signalLength: N };
}
export default analyzeSignal;
// Generation time: 34.195s
// Result: FAIL