async function analyzeSignal(yamlString) {
  const [
    jsYaml,
    math,
    ndarray,
    ndarrayFft,
    DOMPurify
  ] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/js-yaml@4/+esm").then(m => m.default || m),
    import("https://cdn.jsdelivr.net/npm/mathjs@13/+esm").then(m => m.default || m),
    import("https://cdn.jsdelivr.net/npm/ndarray@1/+esm").then(m => m.default || m),
    import("https://cdn.jsdelivr.net/npm/ndarray-fft@1/+esm").then(m => m.default || m),
    import("https://cdn.jsdelivr.net/npm/dompurify@3/+esm").then(m => m.default || m),
  ]);

  const config = jsYaml.load(yamlString);
  const { sampleRate, duration, components } = config;
  const N = sampleRate * duration;

  const signalData = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const { frequency, amplitude } of components)
      sum += amplitude * math.sin(2 * math.pi * frequency * t);
    signalData[i] = sum;
  }

  const real = ndarray(new Float64Array(signalData), [N]);
  const imag = ndarray(new Float64Array(N), [N]);

  ndarrayFft(1, real, imag);

  const half = N / 2;
  const magnitudes = [];
  for (let k = 0; k <= half; k++) {
    const r = real.get(k);
    const im = imag.get(k);
    magnitudes.push(math.sqrt(r ** 2 + im ** 2) / half);
  }

  const peaks = magnitudes
    .map((mag, k) => ({
      frequencyHz: Math.round(k * sampleRate / N),
      magnitude: Math.round(mag * 100) / 100
    }))
    .filter(p => p.magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join("");

  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 9.844s
// Result: PASS