let _jsYaml, _math, _ndarray, _fft, _purify;


  if (!_jsYaml) {
    _jsYaml = (await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs')).default;
  }
  const { sampleRate, duration, components } = _jsYaml.load(yamlString);
  const N = sampleRate * duration;

  if (!_math) {
    _math = await import('https://cdn.jsdelivr.net/npm/mathjs@11.8.0/lib/esm/index.js');
  }

  const signal = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const { frequency, amplitude } of components) {
      sum += amplitude * _math.sin(2 * _math.pi * frequency * t);
    }
    signal[i] = sum;
  }

  if (!_ndarray) {
    const ndMod = await import('https://cdn.jsdelivr.net/npm/ndarray@1.0.19/index.mjs');
    _ndarray = ndMod.default || ndMod.ndarray;
  }
  if (!_fft) {
    const fftMod = await import('https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.0/index.mjs');
    _fft = fftMod.fft || fftMod.default;
  }
  if (!_purify) {
    const purifyMod = await import('https://cdn.jsdelivr.net/npm/dompurify@3.0.3/dist/purify.es.js');
    _purify = purifyMod.default || purifyMod;
  }

  const real = _ndarray(signal, [N]);
  const imag = _ndarray(new Float64Array(N), [N]);

  _fft(1, real, imag);

  const half = N / 2;
  const peaks = [];
  for (let k = 0; k <= half; k++) {
    const re = real.get(k);
    const im = imag.get(k);
    const mag = _math.sqrt(re * re + im * im) / half;
    if (mag > 0.1) {
      const freq = Math.round(k * sampleRate / N);
      const magRounded = Math.round(mag * 100) / 100;
      peaks.push({ frequencyHz: freq, magnitude: magRounded });
    }
  }
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  let html = '<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>';
  for (const p of peaks) {
    html += `<tr><td>${p.frequencyHz}</td><td>${p.magnitude.toFixed(2)}</td></tr>`;
  }
  html += '</table>';

  const sanitized = _purify.sanitize(html);

  return { peaks, html: sanitized, signalLength: N };
}
export default analyzeSignal;
// Generation time: 94.075s
// Result: FAIL