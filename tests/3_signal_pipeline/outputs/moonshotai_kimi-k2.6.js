```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signal Processing Pipeline</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a; /* Slate 900 */
            color: #e2e8f0; /* Slate 200 */
        }
        .mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .glass-panel {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .input-focus:focus {
            outline: none;
            border-color: #38bdf8;
            box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #1e293b; 
        }
        ::-webkit-scrollbar-thumb {
            background: #475569; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #64748b; 
        }
        .canvas-container {
            position: relative;
            height: 250px;
            width: 100%;
            background: #020617;
            border-radius: 0.5rem;
            overflow: hidden;
            border: 1px solid #1e293b;
        }
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
        .loader {
            border: 3px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            border-top: 3px solid #38bdf8;
            width: 24px;
            height: 24px;
            -webkit-animation: spin 1s linear infinite; /* Safari */
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-50 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h1 class="text-xl font-bold tracking-tight text-white">Signal<span class="text-cyan-400">Forge</span> <span class="text-xs font-normal text-slate-500 ml-2 border border-slate-700 px-2 py-0.5 rounded-full">FFT Processor</span></h1>
            </div>
            <div class="text-xs text-slate-400 font-mono hidden sm:block">Dynamic Import Pipeline: js-yaml &rarr; mathjs &rarr; ndarray-fft &rarr; DOMPurify</div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Controls -->
        <div class="lg:col-span-4 flex flex-col gap-6">
            
            <!-- Input Panel -->
            <div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        Signal Config (YAML)
                    </h2>
                    <button id="resetBtn" class="text-xs text-slate-400 hover:text-white transition-colors">Reset Default</button>
                </div>
                
                <textarea id="yamlInput" class="mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-lg border border-slate-800 h-64 resize-none input-focus leading-relaxed" spellcheck="false"></textarea>
                
                <div class="flex gap-3 mt-2">
                    <button id="runBtn" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95">
                        <span>Process Signal</span>
                        <div id="btnLoader" class="loader hidden"></div>
                    </button>
                </div>
                
                <div id="errorContainer" class="hidden bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                    <span class="font-bold">Error:</span> <span id="errorMsg"></span>
                </div>
            </div>

            <!-- Info Panel -->
            <div class="glass-panel rounded-xl p-6">
                <h3 class="text-sm font-semibold text-slate-300 mb-3">Pipeline Status</h3>
                <ul class="space-y-3 text-xs text-slate-400">
                    <li class="flex items-center gap-2" id="status-yaml">
                        <span class="w-2 h-2 rounded-full bg-slate-600"></span> js-yaml (Parser)
                    </li>
                    <li class="flex items-center gap-2" id="status-math">
                        <span class="w-2 h-2 rounded-full bg-slate-600"></span> mathjs (Synthesis)
                    </li>
                    <li class="flex items-center gap-2" id="status-fft">
                        <span class="w-2 h-2 rounded-full bg-slate-600"></span> ndarray-fft (Analysis)
                    </li>
                    <li class="flex items-center gap-2" id="status-dom">
                        <span class="w-2 h-2 rounded-full bg-slate-600"></span> DOMPurify (Sanitization)
                    </li>
                </ul>
            </div>
        </div>

        <!-- Right Column: Visualization & Results -->
        <div class="lg:col-span-8 flex flex-col gap-6">
            
            <!-- Charts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Time Domain -->
                <div class="glass-panel p-4 rounded-xl">
                    <div class="flex justify-between items-end mb-3">
                        <h3 class="text-sm font-semibold text-slate-300">Time Domain</h3>
                        <span class="text-xs text-slate-500 mono">signal[i]</span>
                    </div>
                    <div class="canvas-container">
                        <canvas id="timeCanvas"></canvas>
                    </div>
                </div>

                <!-- Frequency Domain -->
                <div class="glass-panel p-4 rounded-xl">
                    <div class="flex justify-between items-end mb-3">
                        <h3 class="text-sm font-semibold text-slate-300">Frequency Domain</h3>
                        <span class="text-xs text-slate-500 mono">|X(k)|</span>
                    </div>
                    <div class="canvas-container">
                        <canvas id="freqCanvas"></canvas>
                    </div>
                </div>
            </div>

            <!-- Results Table -->
            <div class="glass-panel rounded-xl overflow-hidden flex flex-col h-full">
                <div class="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-white">Dominant Frequencies</h3>
                    <span class="text-xs text-slate-500" id="signalLengthDisplay">N = 0</span>
                </div>
                <div class="overflow-x-auto">
                    <div id="htmlOutput" class="p-0">
                        <!-- Sanitized HTML Table will be injected here -->
                        <div class="p-8 text-center text-slate-500 text-sm italic">Run the pipeline to see results...</div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <script>
        // --- Configuration & State ---
        const defaultYaml = `sampleRate: 64
duration: 1
components:
  - frequency: 5
    amplitude: 1.0
  - frequency: 12
    amplitude: 0.5`;

        const yamlInput = document.getElementById('yamlInput');
        const runBtn = document.getElementById('runBtn');
        const resetBtn = document.getElementById('resetBtn');
        const btnLoader = document.getElementById('btnLoader');
        const errorContainer = document.getElementById('errorContainer');
        const errorMsg = document.getElementById('errorMsg');
        const htmlOutput = document.getElementById('htmlOutput');
        const signalLengthDisplay = document.getElementById('signalLengthDisplay');
        
        const timeCanvas = document.getElementById('timeCanvas');
        const freqCanvas = document.getElementById('freqCanvas');
        const timeCtx = timeCanvas.getContext('2d');
        const freqCtx = freqCanvas.getContext('2d');

        // Status Indicators
        const statusEls = {
            yaml: document.getElementById('status-yaml').firstElementChild,
            math: document.getElementById('status-math').firstElementChild,
            fft: document.getElementById('status-fft').firstElementChild,
            dom: document.getElementById('status-dom').firstElementChild,
        };

        yamlInput.value = defaultYaml;

        // --- Visualization Helpers ---
        function resizeCanvas(canvas) {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        function drawTimeDomain(signal) {
            resizeCanvas(timeCanvas);
            const w = timeCanvas.width;
            const h = timeCanvas.height;
            timeCtx.clearRect(0, 0, w, h);
            
            // Grid
            timeCtx.strokeStyle = '#1e293b';
            timeCtx.lineWidth = 1;
            timeCtx.beginPath();
            timeCtx.moveTo(0, h/2);
            timeCtx.lineTo(w, h/2);
            timeCtx.stroke();

            // Signal
            timeCtx.strokeStyle = '#38bdf8'; // Cyan 400
            timeCtx.lineWidth = 2;
            timeCtx.beginPath();
            
            const step = w / signal.length;
            const amp = h / 2.5; // Scale factor
            
            for(let i=0; i<signal.length; i++) {
                const x = i * step;
                const y = (h/2) - (signal[i] * amp);
                if(i===0) timeCtx.moveTo(x, y);
                else timeCtx.lineTo(x, y);
            }
            timeCtx.stroke();
        }

        function drawFrequencyDomain(magnitude) {
            resizeCanvas(freqCanvas);
            const w = freqCanvas.width;
            const h = freqCanvas.height;
            freqCtx.clearRect(0, 0, w, h);

            // Grid
            freqCtx.strokeStyle = '#1e293b';
            freqCtx.lineWidth = 1;
            freqCtx.beginPath();
            freqCtx.moveTo(0, h);
            freqCtx.lineTo(w, h);
            freqCtx.stroke();

            // Bars
            const barWidth = (w / magnitude.length) * 0.8;
            const gap = (w / magnitude.length) * 0.2;
            
            for(let i=0; i<magnitude.length; i++) {
                const val = magnitude[i];
                const barH = Math.min(h, val * (h * 0.9)); // Scale to fit
                const x = i * (barWidth + gap);
                const y = h - barH;

                // Color based on magnitude intensity
                const intensity = Math.min(255, Math.floor(val * 500));
                freqCtx.fillStyle = `rgb(${56 + intensity/2}, ${189}, ${248})`; // Base cyan + glow
                
                // If peak is significant, highlight
                if(val > 0.1) {
                    freqCtx.fillStyle = '#22d3ee'; // Cyan 400
                    freqCtx.shadowColor = '#06b6d4';
                    freqCtx.shadowBlur = 10;
                } else {
                    freqCtx.shadowBlur = 0;
                }

                freqCtx.fillRect(x, y, barWidth, barH);
            }
            freqCtx.shadowBlur = 0; // Reset
        }

        // --- Core Logic (The Production-Ready Async Function) ---
        
        async function analyzeSignal(yamlString) {
            // 1. Dynamic Imports (Simulating CDN loads with skypack/polyfill for robustness in this environment)
            // Note: In a real build, these would be bare imports handled by bundler, 
            // or full URLs if left as dynamic strings.
            // To ensure stability in this specific "No-Build" output, we use esm.sh which is highly reliable for raw HTML.
            
            const setStatus = (key, active) => {
                statusEls[key].className = `w-2 h-2 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`;
            };

            // Reset status
            Object.keys(statusEls).forEach(k => setStatus(k, false));

            // Import Step
            setStatus('yaml', true);
            const yaml = await import('https://cdn.skypack.dev/js-yaml');
            setStatus('yaml', false);

            setStatus('math', true);
            const math = await import('https://cdn.skypack.dev/mathjs');
            setStatus('math', false);

            setStatus('fft', true);
            const ndarray = (await import('https://cdn.skypack.dev/ndarray')).default;
            const fft = (await import('https://cdn.skypack.dev/ndarray-fft')).default;
            setStatus('fft', false);

            setStatus('dom', true);
            const DOMPurify = (await import('https://cdn.skypack.dev/dompurify')).default;
            setStatus('dom', false);

            // 2. Parse YAML
            const config = yaml.load(yamlString);
            
            const N = config.sampleRate * config.duration;
            const signal = new Array(N).fill(0);

            // 3. Generate Signal
            for (let i = 0; i < N; i++) {
                const t = i / config.sampleRate;
                let sum = 0;
                for (const comp of config.components) {
                    sum += comp.amplitude * math.sin(2 * math.pi * comp.frequency * t);
                }
                signal[i] = sum;
            }

            // 4. Prepare FFT
            const real = ndarray(new Float64Array(signal));
            const imag = ndarray(new Float64Array(N).fill(0));

            // 5. Execute FFT
            fft(1, real, imag);

            // 6. Compute Magnitude Spectrum
            const halfN = N / 2;
            const magnitude = new Array(halfN + 1);
            for (let k = 0; k <= halfN; k++) {
                const r = real.get(k);
                const im = imag.get(k);
                magnitude[k] = math.sqrt(r * r + im * im) / halfN;
            }

            // 7. Find Dominant Frequencies
            const peaks = [];
            for (let k = 0; k <= halfN; k++) {
                if (magnitude[k] > 0.1) {
                    const freqHz = Math.round(k * config.sampleRate / N);
                    const magVal = Math.round(magnitude[k] * 100) / 100;
                    peaks.push({ frequencyHz: freqHz, magnitude: magVal });
                }
            }
            
            // Sort by magnitude descending
            peaks.sort((a, b) => b.magnitude - a.magnitude);

            // 8. Build HTML Table
            let html = `<table class="w-full text-sm text-left text-slate-300"><thead class="text-xs text-slate-400 uppercase bg-slate-800/50"><tr><th scope="col" class="px-6 py-3">Frequency (Hz)</th><th scope="col" class="px-6 py-3">Magnitude</th></tr></thead><tbody>`;
            
            if (peaks.length === 0) {
                 html += `<tr class="bg-slate-800/20 border-b border-slate-800"><td colspan="2" class="px-6 py-4 text-center italic text-slate-500">No dominant frequencies detected (>0.1)</td></tr>`;
            } else {
                peaks.forEach((p, idx) => {
                    const rowClass = idx % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent';
                    html += `<tr class="${rowClass} border-b border-slate-800 hover:bg-slate-700/30 transition-colors"><td class="px-6 py-4 font-medium text-white">${p.frequencyHz}</td><td class="px-6 py-4 text-cyan-400 font-mono">${p.magnitude}</td></tr>`;
                });
            }
            
            html += `</tbody></table>`;

            // 9. Sanitize
            const sanitizedHTML = DOMPurify.sanitize(html, { 
                ALLOWED_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td'],
                ALLOWED_ATTR: ['class', 'scope', 'colspan']
            });

            return {
                peaks,
                html: sanitizedHTML,
                signalLength: N,
                rawSignal: signal,
                rawMagnitude: magnitude
            };
        }

        // --- UI Interaction ---

        runBtn.addEventListener('click', async () => {
            // UI Loading State
            runBtn.disabled = true;
            btnLoader.classList.remove('hidden');
            errorContainer.classList.add('hidden');
            htmlOutput.innerHTML = '<div class="p-8 flex justify-center"><div class="loader"></div></div>';
            
            // Clear canvases
            timeCtx.clearRect(0,0,timeCanvas.width, timeCanvas.height);
            freqCtx.clearRect(0,0,freqCanvas.width, freqCanvas.height);

            try {
                const result = await analyzeSignal(yamlInput.value);
                
                // Update UI
                htmlOutput.innerHTML = result.html;
                signalLengthDisplay.textContent = `N = ${result.signalLength}`;
                
                // Draw Charts
                drawTimeDomain(result.rawSignal);
                drawFrequencyDomain(result.rawMagnitude);

            } catch (err) {
                console.error(err);
                errorContainer.classList.remove('hidden');
                errorMsg.textContent = err.message;
                htmlOutput.innerHTML = '<div class="p-8 text-center text-slate-500 text-sm italic">Error processing signal.</div>';
            } finally {
                runBtn.disabled = false;
                btnLoader.classList.add('hidden');
                // Reset status dots
                Object.keys(statusEls).forEach(k => statusEls[k].className = 'w-2 h-2 rounded-full bg-slate-600');
            }
        });

        resetBtn.addEventListener('click', () => {
            yamlInput.value = defaultYaml;
        });

        // Initial resize
        window.addEventListener('resize', () => {
            // Re-draw if we have data? For now just resize canvases
            resizeCanvas(timeCanvas);
            resizeCanvas(freqCanvas);
        });

    </script>
</body>
</html>
```
export default analyzeSignal;
// Generation time: 141.385s
// Result: FAIL