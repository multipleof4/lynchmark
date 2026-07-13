async function analyzeSignal(yamlString) {
  const [
    yamlModule,
    mathModule,
    ndarrayModule,
    fftModule,
    purifierModule
  ] = await Promise.all([
    import('https://esm.sh/js-yaml@4.1.0'),
    import('https://esm.sh/mathjs@13.2.0'),
    import('https://esm.sh/ndarray@1.0.19'),
    import('https://esm.sh/ndarray-fft@1.0.0'),
    import('https://esm.sh/dompurify@3.2.4')
  ]);

  if (typeof yamlString !== 'string') {
    throw new TypeError('yamlString must be a string');
  }

  const yaml = yamlModule.default ?? yamlModule;
  const ndarray = ndarrayModule.default ?? ndarrayModule.ndarray ?? ndarrayModule;
  const fft = fftModule.default ?? fftModule.fft ?? fftModule;
  const DOMPurify = purifierModule.default ??
    purifierModule.DOMPurify ??
    purifierModule;

  const math = mathModule.default?.sin
    ? mathModule.default
    : typeof mathModule.create === 'function' && mathModule.all
      ? mathModule.create(mathModule.all)
      : mathModule;

  const config = yaml.load(yamlString);

  if (
    !config ||
    Array.isArray(config) ||
    typeof config !== 'object'
  ) {
    throw new TypeError('YAML must describe an object');
  }

  const { sampleRate, duration, components } = config;

  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new RangeError('sampleRate must be a positive number');
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new RangeError('duration must be a positive number');
  }

  if (!Array.isArray(components)) {
    throw new TypeError('components must be an array');
  }

  const N = sampleRate * duration;

  if (!Number.isSafeInteger(N) || N < 2) {
    throw new RangeError('sampleRate * duration must be an integer of at least 2');
  }

  const signalComponents = components.map(component => {
    if (!component || typeof component !== 'object') {
      throw new TypeError('Each component must be an object');
    }

    const { frequency, amplitude } = component;

    if (!Number.isFinite(frequency) || !Number.isFinite(amplitude)) {
      throw new TypeError('Component frequency and amplitude must be numbers');
    }

    return { frequency, amplitude };
  });

  const signal = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;

    for (const { frequency, amplitude } of signalComponents) {
      signal[i] += amplitude *
        math.sin(2 * math.pi * frequency * t);
    }
  }

  const real = ndarray(signal, [N]);
  const imag = ndarray(new Float64Array(N), [N]);

  fft(1, real, imag);

  const ranked = [];

  for (let k = 0; k <= N / 2; k++) {
    const magnitude =
      math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);

    if (magnitude > 0.1) {
      ranked.push({
        frequencyHz: k * sampleRate / N,
        magnitude
      });
    }
  }

  ranked.sort((a, b) => b.magnitude - a.magnitude);

  const peaks = ranked.map(({ frequencyHz, magnitude }) => ({
    frequencyHz: Math.round(frequencyHz),
    magnitude: Math.round(magnitude * 100) / 100
  }));

  const rows = peaks
    .map(({ frequencyHz, magnitude }) =>
      `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`
    )
    .join('');

  const html = DOMPurify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows}</table>`
  );

  return {
    peaks,
    html,
    signalLength: N
  };
}
export default analyzeSignal;
// Generation time: 51.151s
// Result: FAIL