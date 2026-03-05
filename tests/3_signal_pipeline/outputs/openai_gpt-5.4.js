async function analyzeSignal(yamlString) {
  const [
    yamlMod,
    mathMod,
    ndarrayMod,
    fftMod,
    purifyMod
  ] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/js-yaml@4/+esm'),
    import('https://cdn.jsdelivr.net/npm/mathjs@13/+esm'),
    import('https://cdn.jsdelivr.net/npm/ndarray@1.0.19/+esm'),
    import('https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.3/+esm'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3/+esm')
  ])

  const yaml = yamlMod.load ? yamlMod : yamlMod.default || yamlMod
  const math = mathMod.create && mathMod.all ? mathMod.create(mathMod.all) : mathMod.default || mathMod
  const ndarray = ndarrayMod.default || ndarrayMod
  const fft = fftMod.default || fftMod
  const DOMPurify = purifyMod.default || purifyMod

  const cfg = yaml.load(yamlString) || {}
  const sampleRate = Number(cfg.sampleRate) || 0
  const duration = Number(cfg.duration) || 0
  const components = Array.isArray(cfg.components) ? cfg.components : []
  const N = Math.max(0, Math.floor(sampleRate * duration))

  const signal = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate
    let sum = 0
    for (let j = 0; j < components.length; j++) {
      const c = components[j] || {}
      sum += (Number(c.amplitude) || 0) * math.sin(2 * math.pi * (Number(c.frequency) || 0) * t)
    }
    signal[i] = sum
  }

  const realData = new Float64Array(signal)
  const imagData = new Float64Array(N)
  const real = ndarray(realData, [N])
  const imag = ndarray(imagData, [N])

  if (N) fft(1, real, imag)

  const peaks = []
  const half = N / 2

  for (let k = 0; k <= Math.floor(half); k++) {
    const magnitude = half ? math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half : 0
    if (magnitude > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * sampleRate / N),
        magnitude: Math.round(magnitude * 100) / 100
      })
    }
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude)

  const rows = peaks.map(({ frequencyHz, magnitude }) =>
    `<tr><td>${frequencyHz}</td><td>${magnitude.toFixed(2)}</td></tr>`
  ).join('')

  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  )

  return { peaks, html, signalLength: N }
}
export default analyzeSignal;
// Generation time: 7.472s
// Result: PASS