const analyzeSignal = async (yamlStr) => {
  const [yaml, math, ndarray, fft, DOMPurify] = await Promise.all([
    import('https://esm.sh/js-yaml').then(m => m.default),
    import('https://esm.sh/mathjs').then(m => m.default),
    import('https://esm.sh/ndarray').then(m => m.default),
    import('https://esm.sh/ndarray-fft').then(m => m.default),
    import('https://esm.sh/dompurify').then(m => m.default)
  ])

  const { sampleRate: sr, duration, components } = yaml.load(yamlStr)
  const N = sr * duration
  const signal = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const t = i / sr
    signal[i] = components.reduce(
      (s, { amplitude: a, frequency: f }) => s + a * math.sin(2 * math.pi * f * t), 0)
  }

  const re = ndarray(signal, [N])
  const im = ndarray(new Float64Array(N), [N])
  fft(1, re, im)

  const peaks = []
  for (let k = 0; k <= N / 2; k++) {
    const mag = math.sqrt(re.get(k) ** 2 + im.get(k) ** 2) / (N / 2)
    if (mag > 0.1)
      peaks.push({
        frequencyHz: Math.round(k * sr / N),
        magnitude: Math.round(mag * 100) / 100
      })
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude)

  const html = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${peaks
    .map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`)
    .join('')}</table>`

  return { peaks, html: DOMPurify.sanitize(html), signalLength: N }
}
export default analyzeSignal;
// Generation time: 72.180s
// Result: FAIL