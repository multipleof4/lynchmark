const analyzeSignal = async (yamlString) => {
    const { load } = await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm');
    const math = await import('https://cdn.jsdelivr.net/npm/mathjs@11.9.1/+esm');
    const ndarray = await import('https://cdn.jsdelivr.net/npm/ndarray@1.0.19/+esm');
    const fft = await import('https://cdn.jsdelivr.net/npm/ndarray-fft@1.0.6/+esm');
    const DOMPurify = await import('https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm');

    const config = load(yamlString);
    const { sampleRate, duration, components } = config;
    const N = sampleRate * duration;
    const signal = new Float64Array(N);

    for (let i = 0; i < N; i++) {
        let t = i / sampleRate;
        let value = 0;
        for (const comp of components) {
            value += comp.amplitude * math.sin(2 * math.pi * comp.frequency * t);
        }
        signal[i] = value;
    }

    const real = ndarray.default(signal.slice());
    const imag = ndarray.default(new Float64Array(N));
    fft.default(1, real, imag);

    const magnitudes = [];
    const halfN = Math.floor(N / 2);
    for (let k = 0; k <= halfN; k++) {
        const re = real.get(k);
        const im = imag.get(k);
        magnitudes[k] = Math.sqrt(re * re + im * im) / halfN;
    }

    const peaks = [];
    for (let k = 0; k <= halfN; k++) {
        if (magnitudes[k] > 0.1) {
            peaks.push({
                frequencyHz: Math.round(k * sampleRate / N),
                magnitude: Math.round(magnitudes[k] * 100) / 100
            });
        }
    }
    peaks.sort((a, b) => b.magnitude - a.magnitude);

    let html = `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>`;
    peaks.forEach(p => {
        html += `<tr><td>${p.frequencyHz}</td><td>${p.magnitude}</td></tr>`;
    });
    html += `</table>`;

    return {
        peaks,
        html: DOMPurify.default.sanitize(html),
        signalLength: N
    };
};
export default analyzeSignal;
// Generation time: 19.364s
// Result: FAIL