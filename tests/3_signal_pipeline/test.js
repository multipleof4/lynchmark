export default {
  functionName: 'analyzeSignal',
  prompt: `// Write an async JavaScript function 'analyzeSignal' that builds a signal processing pipeline chaining four libraries.
// - The function accepts a YAML string describing signal parameters and returns analysis results.
// - You MUST use dynamic import() to load ALL FOUR of these libraries from CDNs:
//   1. 'js-yaml' — to parse the YAML config string into a JS object.
//   2. 'mathjs' — to generate a composite sine wave signal using math.sin, math.pi, etc.
//   3. 'ndarray' and 'ndarray-fft' — to perform an in-place Fast Fourier Transform on the signal.
//   4. 'DOMPurify' — to sanitize the final HTML output string.
//
// YAML format:
//   sampleRate: 64
//   duration: 1
//   components:
//     - frequency: 5
//       amplitude: 1.0
//     - frequency: 12
//       amplitude: 0.5
//
// Pipeline steps:
//   1. Parse the YAML string with js-yaml to extract config.
//   2. Generate a time-domain signal array of length (sampleRate * duration).
//      For each sample index i, compute t = i / sampleRate, then sum over all components:
//        signal[i] = sum( amplitude * math.sin(2 * math.pi * frequency * t) )
//      Use mathjs functions (math.sin, math.pi) for the computation.
//   3. Create two ndarray instances of length N (same as signal length):
//      - 'real' initialized with the signal values
//      - 'imag' initialized with all zeros
//      Run ndarray-fft(1, real, imag) to compute the forward FFT in-place.
//   4. Compute the magnitude spectrum: for each bin k from 0 to N/2 (inclusive),
//      magnitude[k] = math.sqrt(real.get(k)**2 + imag.get(k)**2) / (N/2)
//      (Normalize by dividing by N/2 so that a pure sine of amplitude A gives a peak of ~A.)
//   5. Find the dominant frequencies: collect all bins where magnitude > 0.1,
//      as objects { frequencyHz: k * sampleRate / N, magnitude: magnitude[k] }.
//      Sort them by magnitude descending. Round frequencyHz to the nearest integer.
//      Round magnitude to 2 decimal places.
//   6. Build an HTML table string:
//      <table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>
//      For each dominant frequency: <tr><td>{frequencyHz}</td><td>{magnitude}</td></tr>
//      </table>
//   7. Sanitize the HTML string using DOMPurify.sanitize().
//   8. Return an object: { peaks: dominantFrequenciesArray, html: sanitizedHTMLString, signalLength: N }
//      where dominantFrequenciesArray is the sorted array from step 5.`,
  runTest: async (analyzeSignal) => {
    const assert = {
      strictEqual: (a, e, m) => { if (a !== e) throw new Error(m || `FAIL: ${a} !== ${e}`) },
      ok: (v, m) => { if (!v) throw new Error(m) },
    };

    const yaml = `sampleRate: 64
duration: 1
components:
  - frequency: 5
    amplitude: 1.0
  - frequency: 12
    amplitude: 0.5`;

    const result = await analyzeSignal(yaml);

    assert.ok(result && typeof result === 'object', 'Should return an object');
    assert.strictEqual(result.signalLength, 64, `signalLength should be 64, got ${result.signalLength}`);

    assert.ok(Array.isArray(result.peaks), 'peaks should be an array');
    assert.ok(result.peaks.length >= 2, `Should detect at least 2 peaks, got ${result.peaks.length}`);

    const freqs = result.peaks.map(p => p.frequencyHz);
    assert.ok(freqs.includes(5), `Should detect 5 Hz peak, found: ${freqs}`);
    assert.ok(freqs.includes(12), `Should detect 12 Hz peak, found: ${freqs}`);

    const peak5 = result.peaks.find(p => p.frequencyHz === 5);
    const peak12 = result.peaks.find(p => p.frequencyHz === 12);
    assert.ok(peak5.magnitude > 0.8 && peak5.magnitude < 1.2, `5 Hz magnitude should be ~1.0, got ${peak5.magnitude}`);
    assert.ok(peak12.magnitude > 0.3 && peak12.magnitude < 0.7, `12 Hz magnitude should be ~0.5, got ${peak12.magnitude}`);

    assert.ok(result.peaks[0].magnitude >= result.peaks[1].magnitude, 'Peaks should be sorted by magnitude descending');

    assert.ok(typeof result.html === 'string', 'html should be a string');
    assert.ok(result.html.includes('<table>'), 'HTML should contain a table');
    assert.ok(result.html.includes('Frequency (Hz)'), 'HTML should contain header');
    assert.ok(result.html.includes('Magnitude'), 'HTML should contain Magnitude header');
    assert.ok(result.html.includes('<td>5</td>'), 'HTML table should contain 5 Hz row');
    assert.ok(result.html.includes('<td>12</td>'), 'HTML table should contain 12 Hz row');

    assert.ok(!result.html.includes('<script'), 'DOMPurify should strip script tags if any');
  }
};
