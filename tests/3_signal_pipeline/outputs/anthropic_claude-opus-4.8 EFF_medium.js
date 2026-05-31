const CDN = {
  yaml: "https://cdn.jsdelivr.net/npm/js-yaml/+esm",
  math: "https://cdn.jsdelivr.net/npm/mathjs/+esm",
  ndarray: "https://cdn.jsdelivr.net/npm/ndarray/+esm",
  fft: "https://cdn.jsdelivr.net/npm/ndarray-fft/+esm",
  purify: "https://cdn.jsdelivr.net/npm/dompurify/+esm"
};

const def = m => m.default ?? m;

export async function analyzeSignal(yamlStr) {
  const [yamlMod, math, ndMod, fftMod, purifyMod] = await Promise.all([
    import(CDN.yaml),
    import(CDN.math),
    import(CDN.ndarray),
    import(CDN.fft),
    import(CDN.purify)
  ]);

  const yaml = def(yamlMod);
  const ndarray = def(ndMod);
  const fft = def(fftMod);
  const DOMPurify = def(purifyMod);

  const cfg = yaml.load(yamlStr);
  const { sampleRate, duration, components = [] } = cfg;
  const N = sampleRate * duration;

  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;
    return components.reduce(
      (s, { amplitude, frequency }) =>
        s + amplitude * math.sin(2 * math.pi * frequency * t),
      0
    );
  });

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const half = N / 2;
  const peaks = [];
  for (let k = 0; k <= half; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half;
    if (mag > 0.1)
      peaks.push({
        frequencyHz: Math.round((k * sampleRate) / N),
        magnitude: Math.round(mag * 100) / 100
      });
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join("");
  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 11.820s
// Result: PASS