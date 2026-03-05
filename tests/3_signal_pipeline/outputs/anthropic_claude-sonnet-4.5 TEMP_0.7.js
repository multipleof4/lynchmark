const analyzeSignal = async (yamlStr) => {
  const [
    { load: loadYaml },
    math,
    ndarray,
    { fft },
    DOMPurify
  ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.mjs'),
    import('https://cdn.jsdelivr.net/npm/mathjs@12/lib/esm/index.js'),
    import('https://cdn.jsdelivr.net/npm/ndarray@1/+esm'),
    import('https://cdn.jsdelivr.net/npm/ndarray-fft@1/+esm'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs')
  ]);

  const config = loadYaml(yamlStr);
  const N = config.sampleRate * config.duration;
  
  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / config.sampleRate;
    return config.components.reduce((sum, { frequency, amplitude }) =>
      sum + amplitude * math.sin(2 * math.pi * frequency * t), 0);
  });

  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  
  fft(1, real, imag);

  const magnitude = Array.from({ length: Math.floor(N / 2) + 1 }, (_, k) =>
    math.sqrt(math.pow(real.get(k), 2) + math.pow(imag.get(k), 2)) / (N / 2));

  const peaks = magnitude
    .map((mag, k) => ({ 
      frequencyHz: Math.round(k * config.sampleRate / N), 
      magnitude: Math.round(mag * 100) / 100 
    }))
    .filter(({ magnitude }) => magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude);

  const html = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${
    peaks.map(({ frequencyHz, magnitude }) => 
      `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`).join('')
  }</table>`;

  return {
    peaks,
    html: DOMPurify.sanitize(html),
    signalLength: N
  };
};
export default analyzeSignal;
// Generation time: 8.641s
// Result: FAIL