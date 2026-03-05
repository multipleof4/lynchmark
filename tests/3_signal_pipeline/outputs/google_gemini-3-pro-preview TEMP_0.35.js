const analyzeSignal = async (yamlInput) => {
  const cdn = 'https://esm.sh/',
    [Yaml, MathPkg, ndarray, fft, DOMPurify] = await Promise.all(
      ['js-yaml', 'mathjs', 'ndarray', 'ndarray-fft', 'dompurify'].map(lib => 
        import(`${cdn}${lib}`).then(m => m.default || m)
      )
    );

  const { sampleRate: sr, duration: dur, components: comps } = Yaml.load(yamlInput),
    N = sr * dur,
    realData = new Float64Array(N),
    imagData = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / sr;
    realData[i] = comps.reduce((acc, { frequency: f, amplitude: a }) => 
      acc + a * MathPkg.sin(2 * MathPkg.pi * f * t), 0);
  }

  const r = ndarray(realData, [N]),
    i = ndarray(imagData, [N]);

  fft(1, r, i);

  const peaks = [];
  for (let k = 0; k <= N / 2; k++) {
    const mag = MathPkg.sqrt(r.get(k) ** 2 + i.get(k) ** 2) / (N / 2);
    if (mag > 0.1) {
      peaks.push({
        frequencyHz: Math.round(k * sr / N),
        magnitude: +mag.toFixed(2)
      });
    }
  }

  peaks.sort((a, b) => b.magnitude - a.magnitude);

  const rows = peaks.map(p => `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`).join(''),
    rawHtml = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`,
    purifier = DOMPurify(self);

  return {
    peaks,
    html: purifier.sanitize(rawHtml),
    signalLength: N
  };
};
export default analyzeSignal;
// Generation time: 50.247s
// Result: PASS