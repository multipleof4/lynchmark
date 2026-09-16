async function analyzeSignal(yamlString) {
  if (typeof yamlString !== "string")
    throw new TypeError("Expected a YAML string.");

  const [yaml, math, { default: ndarray }, { default: fft }, { default: DOMPurify }] =
    await Promise.all([
      import("https://esm.sh/js-yaml@4.1.1"),
      import("https://esm.sh/mathjs@14.8.1"),
      import("https://esm.sh/ndarray@1.0.19?bundle"),
      import("https://esm.sh/ndarray-fft@1.0.3?bundle"),
      import("https://esm.sh/dompurify@3.3.1")
    ]);

  if (!DOMPurify.isSupported)
    throw new Error("HTML sanitization is unavailable in this browser.");

  const config = yaml.load(yamlString, { schema: yaml.JSON_SCHEMA });

  if (!config || typeof config !== "object" || Array.isArray(config))
    throw new TypeError("Configuration must be a YAML mapping.");

  const { sampleRate, duration, components } = config;

  if (![sampleRate, duration].every(v => Number.isFinite(v) && v > 0))
    throw new RangeError("sampleRate and duration must be positive finite numbers.");

  if (
    !Array.isArray(components) ||
    components.some(c =>
      !c || !Number.isFinite(c.frequency) || !Number.isFinite(c.amplitude)
    )
  )
    throw new TypeError("components must contain finite frequency and amplitude values.");

  const N = sampleRate * duration;

  if (!Number.isSafeInteger(N) || N < 1)
    throw new RangeError("sampleRate * duration must be a positive safe integer.");

  const signal = new Float64Array(N);
  const tau = 2 * math.pi;

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    let value = 0;

    for (const { frequency, amplitude } of components)
      value += amplitude * math.sin(tau * frequency * t);

    if (!Number.isFinite(value))
      throw new RangeError(`Signal computation overflowed at sample ${i}.`);

    signal[i] = value;
  }

  const real = ndarray(signal, [N]);
  const imag = ndarray(new Float64Array(N), [N]);

  fft(1, real, imag);

  const spectrum = new Float64Array(Math.floor(N / 2) + 1);
  const candidates = [];

  for (let k = 0; k < spectrum.length; k++) {
    const magnitude = math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / (N / 2);

    if (!Number.isFinite(magnitude))
      throw new RangeError(`Spectrum computation overflowed at bin ${k}.`);

    spectrum[k] = magnitude;

    if (magnitude > 0.1)
      candidates.push({ frequencyHz: k * sampleRate / N, magnitude });
  }

  const peaks = candidates
    .sort((a, b) => b.magnitude - a.magnitude)
    .map(({ frequencyHz, magnitude }) => ({
      frequencyHz: Math.round(frequencyHz),
      magnitude: Number(magnitude.toFixed(2))
    }));

  const table =
    "<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>" +
    peaks.map(({ frequencyHz, magnitude }) =>
      `<tr><td>${frequencyHz}</td><td>${magnitude.toFixed(2)}</td></tr>`
    ).join("") +
    "</table>";

  const html = DOMPurify.sanitize(table, {
    ALLOWED_TAGS: ["table", "tbody", "tr", "th", "td"],
    ALLOWED_ATTR: [],
    RETURN_TRUSTED_TYPE: false
  });

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 203.858s
// Result: PASS