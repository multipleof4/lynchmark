export async function analyzeSignal(yamlStr) {
  const [yamlMod, mathMod, ndarrayMod, fftMod, purifyMod] = await Promise.all([
    import('https://esm.sh/js-yaml'),
    import('https://esm.sh/mathjs'),
    import('https://esm.sh/ndarray'),
    import('https://esm.sh/ndarray-fft'),
    import('https://esm.sh/dompurify')
  ]);

  const yaml = yamlMod.load || yamlMod.default;
  const { sin, pi, sqrt } = mathMod.default || mathMod;
  const ndarray = ndarrayMod.default || ndarrayMod;
  const fft = fftMod.default || fftMod;
  const DOMPurify = purifyMod.default || purifyMod;

  const { sampleRate, duration, components } = yaml(yamlStr);
  const N = sampleRate * duration;

  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;
    return components.reduce((sum, { frequency, amplitude }) => 
      sum + amplitude * sin(2 * pi * frequency * t), 0
    );
  });

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const peaks = [];
  const halfN = N / 2;
  for (let k = 0; k <= halfN; k++) {
    const mag = sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / halfN;
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round((k * sampleRate) / N),
        magnitude: +mag.toFixed(2)
      });
    }
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join('');
  const table = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`;
  const html = DOMPurify.sanitize(table);

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 35.362s
// Result: PASS