const CDN = [
  'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm',
  'https://cdn.jsdelivr.net/npm/mathjs@13/+esm',
  'https://cdn.jsdelivr.net/npm/ndarray@1.0.19/+esm',
  'https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.3/+esm',
  'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/+esm'
];

let libs;
const loadLibs = () => (libs ??= Promise.all(CDN.map((u) => import(u))));
const pick = (m, k) => (m?.[k] !== undefined ? m : m?.default ?? m);

async function analyzeSignal(yamlString) {
  if (typeof yamlString !== 'string') throw new TypeError('analyzeSignal expects a YAML string');

  const [yamlM, mathM, ndM, fftM, dpM] = await loadLibs();
  const { load } = pick(yamlM, 'load');
  const math = pick(mathM, 'sin');
  const ndarray = ndM?.default ?? ndM;
  const fft = fftM?.default ?? fftM;
  const DOMPurify = dpM?.default ?? dpM;

  const { sampleRate, duration, components = [] } = load(yamlString);
  const N = sampleRate * duration;
  if (!Number.isInteger(N) || N < 2 || (N & (N - 1))) {
    throw new RangeError(`sampleRate * duration must be a power of two >= 2 (got ${N})`);
  }

  const data = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    data[i] = components.reduce((s, { frequency: f, amplitude: a }) => s + a * math.sin(2 * math.pi * f * t), 0);
  }

  const real = ndarray(data, [N]);
  const imag = ndarray(new Float64Array(N), [N]);
  fft(1, real, imag);

  const half = N >> 1;
  const peaks = Array.from({ length: half + 1 }, (_, k) => ({
    k,
    m: math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half
  }))
    .filter(({ m }) => m > 0.1)
    .sort((a, b) => b.m - a.m)
    .map(({ k, m }) => ({ frequencyHz: Math.round(k * sampleRate / N), magnitude: +m.toFixed(2) }));

  const rows = peaks.map(({ frequencyHz, magnitude }) => `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`).join('');
  const html = DOMPurify.sanitize(`<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`);

  return { peaks, html, signalLength: N };
}

globalThis.analyzeSignal = analyzeSignal;
export default analyzeSignal;
// Generation time: 203.454s
// Result: PASS