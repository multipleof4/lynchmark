async function analyzeSignal(yamlString) {
  const [
    yamlMod,
    math,
    ndarrayMod,
    fftMod,
    purifyMod
  ] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm"),
    import("https://cdn.jsdelivr.net/npm/mathjs@13.2.0/+esm"),
    import("https://cdn.jsdelivr.net/npm/ndarray@1.0.19/+esm"),
    import("https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.3/+esm"),
    import("https://cdn.jsdelivr.net/npm/dompurify@3.1.6/+esm")
  ]);

  const yaml = yamlMod.default || yamlMod;
  const ndarray = ndarrayMod.default || ndarrayMod;
  const fft = fftMod.default || fftMod;
  const DOMPurify = purifyMod.default || purifyMod;

  const cfg = yaml.load(yamlString);
  const sampleRate = Number(cfg.sampleRate);
  const duration = Number(cfg.duration);
  const components = Array.isArray(cfg.components) ? cfg.components : [];
  const N = Math.max(0, Math.floor(sampleRate * duration));

  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new Error("Invalid sampleRate");
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Invalid duration");
  if (!N) throw new Error("Signal length must be greater than zero");

  const signal = Float64Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;

    return components.reduce((sum, c) => {
      const a = Number(c.amplitude);
      const f = Number(c.frequency);

      return Number.isFinite(a) && Number.isFinite(f)
        ? sum + a * math.sin(2 * math.pi * f * t)
        : sum;
    }, 0);
  });

  const real = ndarray(signal.slice(), [N]);
  const imag = ndarray(new Float64Array(N), [N]);

  fft(1, real, imag);

  const peaks = Array.from({ length: Math.floor(N / 2) + 1 }, (_, k) => {
    const re = real.get(k);
    const im = imag.get(k);
    const magnitude = math.sqrt(re ** 2 + im ** 2) / (N / 2);

    return {
      frequencyHz: Math.round(k * sampleRate / N),
      magnitude: Math.round(magnitude * 100) / 100,
      rawMagnitude: magnitude
    };
  })
    .filter(p => p.rawMagnitude > 0.1)
    .sort((a, b) => b.rawMagnitude - a.rawMagnitude)
    .map(({ frequencyHz, magnitude }) => ({ frequencyHz, magnitude }));

  const rows = peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join("");

  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 16.732s
// Result: PASS