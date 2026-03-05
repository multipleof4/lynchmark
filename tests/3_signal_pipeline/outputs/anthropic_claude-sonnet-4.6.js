async function analyzeSignal(yamlString) {
  const CDN = "https://cdn.jsdelivr.net/npm";

  const [{ default: jsyaml }, { create, all }, { default: ndarray }, { default: fft }, { default: DOMPurify }] =
    await Promise.all([
      import(`${CDN}/js-yaml/dist/js-yaml.mjs`),
      import(`${CDN}/mathjs/src/entry/allLimitedExports.mjs`),
      import(`${CDN}/ndarray/ndarray.mjs`),
      import(`${CDN}/ndarray-fft/dist/ndarray-fft.mjs`),
      import(`${CDN}/dompurify/dist/purify.es.mjs`),
    ]);

  const math = create(all);
  const config = jsyaml.load(yamlString);

  const { sampleRate, duration, components } = config;
  const N = sampleRate * duration;

  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;
    return components.reduce((sum, { frequency, amplitude }) =>
      sum + amplitude * math.sin(2 * math.pi * frequency * t), 0);
  });

  const realData = new Float64Array(signal);
  const imagData = new Float64Array(N);
  const real = ndarray(realData, [N]);
  const imag = ndarray(imagData, [N]);

  fft(1, real, imag);

  const half = N / 2;
  const magnitude = Array.from({ length: half + 1 }, (_, k) =>
    math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half
  );

  const peaks = magnitude
    .reduce((acc, mag, k) => {
      if (mag > 0.1) acc.push({
        frequencyHz: Math.round(k * sampleRate / N),
        magnitude: Math.round(mag * 100) / 100,
      });
      return acc;
    }, [])
    .sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(({ frequencyHz, magnitude }) =>
    `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`
  ).join("");

  const rawHtml =
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`;

  const html = DOMPurify.sanitize(rawHtml);

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 8.705s
// Result: FAIL