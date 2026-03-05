const libsPromise = (async () => {
  const [y, m, n, f, d] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm"),
    import("https://esm.sh/mathjs@13.0.3"),
    import("https://esm.sh/ndarray@1.0.19"),
    import("https://esm.sh/ndarray-fft@1.0.3"),
    import("https://unpkg.com/dompurify@3.1.6/dist/purify.es.mjs")
  ]);
  return {
    yaml: y.default?.load ? y.default : y,
    math: m.default?.sin ? m.default : m,
    ndarray: n.default || n,
    fft: f.default || f.fft || f,
    DOMPurify: d.default?.sanitize ? d.default : d
  };
})();

async function analyzeSignal(yamlString) {
  const { yaml, math, ndarray, fft, DOMPurify } = await libsPromise;
  const cfg = yaml.load(String(yamlString || "")) || {};
  const sampleRate = Number(cfg.sampleRate) || 64;
  const duration = Number(cfg.duration) || 1;
  const components = Array.isArray(cfg.components) ? cfg.components : [];
  const N = Math.max(1, Math.floor(sampleRate * duration));
  const signal = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let v = 0;
    for (let j = 0; j < components.length; j++) {
      const c = components[j] || {};
      v += (Number(c.amplitude) || 0) * math.sin(2 * math.pi * (Number(c.frequency) || 0) * t);
    }
    signal[i] = v;
  }

  const realData = new Float64Array(signal);
  const imagData = new Float64Array(N);
  const real = ndarray(realData, [N]);
  const imag = ndarray(imagData, [N]);
  fft(1, real, imag);

  const half = Math.floor(N / 2);
  const norm = N / 2 || 1;
  const peaks = [];

  for (let k = 0; k <= half; k++) {
    const mag = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / norm;
    if (mag > 0.1) peaks.push({
      frequencyHz: Math.round((k * sampleRate) / N),
      magnitude: Number(mag.toFixed(2))
    });
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join("");
  const html = DOMPurify.sanitize(`<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`);

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 28.814s
// Result: PASS