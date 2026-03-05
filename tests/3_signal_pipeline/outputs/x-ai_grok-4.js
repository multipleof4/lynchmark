async function analyzeSignal(yamlString) {
  const { load } = await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs');
  const { create, all } = await import('https://cdn.jsdelivr.net/npm/mathjs@12.4.1/+esm');
  const math = create(all);
  const ndarray = (await import('https://unpkg.com/ndarray@1.0.19?module')).default;
  const fft = (await import('https://unpkg.com/ndarray-fft@1.0.3?module')).default;
  const DOMPurify = (await import('https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.es.js')).default;
  const config = load(yamlString);
  const sampleRate = config.sampleRate;
  const duration = config.duration;
  const N = sampleRate * duration;
  const signal = new Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let val = 0;
    for (let comp of config.components) {
      val += comp.amplitude * math.sin(2 * math.pi * comp.frequency * t);
    }
    signal[i] = val;
  }
  const real = ndarray(new Float64Array(signal), [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);
  const halfN = N / 2;
  const magnitude = new Array(Math.floor(halfN) + 1);
  for (let k = 0; k < magnitude.length; k++) {
    magnitude[k] = math.sqrt(math.pow(real.get(k), 2) + math.pow(imag.get(k), 2)) / halfN;
  }
  const peaks = [];
  for (let k = 0; k < magnitude.length; k++) {
    const m = magnitude[k];
    if (m > 0.1) {
      const freq = k * sampleRate / N;
      peaks.push({
        frequencyHz: Math.round(freq),
        magnitude: Number(m.toFixed(2))
      });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);
  let html = '<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
  for (let p of peaks) {
    html += `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`;
  }
  html += '</table>';
  const sanitized = DOMPurify.sanitize(html);
  return { peaks, html: sanitized, signalLength: N };
}
export default analyzeSignal;
// Generation time: 85.724s
// Result: FAIL