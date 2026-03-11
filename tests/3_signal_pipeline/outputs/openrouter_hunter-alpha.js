const analyzeSignal = async yamlStr => {
  const [{default: yaml}, {default: math}, {default: ndarray}, {default: fft}, {default: DOMPurify}] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs'),
    import('https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js'),
    import('https://cdn.skypack.dev/ndarray@1.0.19'),
    import('https://cdn.skypack.dev/ndarray-fft@1.0.3'),
    import('https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js'),
  ])

  const config = yaml.load(yamlStr)
  const N = config.sampleRate * config.duration

  const signal = Array.from({length: N}, (_, i) => {
    const t = i / config.sampleRate
    return config.components.reduce((sum, {frequency, amplitude}) =>
      sum + amplitude * math.sin(2 * math.pi * frequency * t), 0)
  })

  const real = ndarray(signal)
  const imag = ndarray(Array(N).fill(0))

  fft(1, real, imag)

  const magnitudes = Array.from({length: Math.floor(N / 2) + 1}, (_, k) => ({
    magnitude: math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2),
    frequencyHz: Math.round(k * config.sampleRate / N)
  }))

  const peaks = magnitudes
    .filter(({magnitude}) => magnitude > 0.1)
    .map(({frequencyHz, magnitude}) => ({
      frequencyHz,
      magnitude: Math.round(magnitude * 100) / 100
    }))
    .sort((a, b) => b.magnitude - a.magnitude)

  const html = DOMPurify.sanitize(`
    <table>
      <tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>
      ${peaks.map(({frequencyHz, magnitude}) =>
        `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`).join('')}
    </table>
  `)

  return {peaks, html, signalLength: N}
}
export default analyzeSignal;
// Generation time: 22.772s
// Result: FAIL