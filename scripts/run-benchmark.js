import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import axios from 'axios';
import { performance } from 'perf_hooks';
import { chromium } from 'playwright';

const CWD = process.cwd();
const [README, TESTS] = ['README', 'tests'].map(f => path.join(CWD, f));
const getArg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const isGemini = process.argv.includes('--gemini');
const OUT_DIR_NAME = isGemini ? 'outputs_gemini' : 'outputs';

const apiCall = async (prompt, model, temp, effort) => {
  if (isGemini) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_KEY}`;
    const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: temp } };
    const res = await axios.post(url, body);
    return res.data.candidates[0].content.parts[0].text;
  }
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { 
      model, 
      messages: [{ role: 'user', content: prompt }], 
      ...(temp !== undefined && { temperature: temp }),
      ...(effort && { reasoning: { effort } })
    },
    { headers: { Authorization: `Bearer ${process.env.OPENROUTER_KEY}` } }
  );
  if (!res.data.choices || !res.data.choices[0]) {
    console.error('API Response:', JSON.stringify(res.data, null, 2));
    throw new Error('Invalid API response structure');
  }
  return res.data.choices[0].message.content;
};

const getLlmCode = async (prompt, model, funcName, temp, effort) => {
  const start = performance.now();
  try {
    const content = await apiCall(prompt, model, temp, effort);
    const duration = (performance.now() - start) / 1000;
    const code = content.match(/```(?:javascript|js)?\n([\s\S]+?)\n```/)?.[1].trim() ?? content.trim();
    const clean = code.replace(/export\s+default\s+.*$/m, '');
    return { code: `${clean}\nexport default ${funcName};\n// Generation time: ${duration.toFixed(3)}s`, duration };
  } catch (e) { console.error(`API Error ${model}: ${e.message}`); return null; }
};

const verify = async (page, code, testCode) => {
  try {
    await page.evaluate(async ({ c, t }) => {
      const b = s => URL.createObjectURL(new Blob([s], {type:'text/javascript'}));
      const [uC, uT] = [b(c), b(t)];
      try {
        const [mC, mT] = await Promise.all([import(uC), import(uT)]);
        await mT.default.runTest(mC.default);
      } finally { URL.revokeObjectURL(uC); URL.revokeObjectURL(uT); }
    }, { c: code, t: testCode });
    return 'PASS';
  } catch (e) { return 'FAIL'; }
};

const main = async () => {
  const readme = await fs.readFile(README, 'utf-8');
  const regex = isGemini ? /<!-- GEMINI_START -->\n([\s\S]+?)\n<!-- MODELS_END -->/ : /<!-- MODELS_START -->\n([\s\S]+?)\n<!-- MODELS_END -->/;
  const allModels = readme.match(regex)[1].trim().split('\n').filter(Boolean);
  const pct = parseInt(readme.match(/RUN_PERCENTAGE:\s*(\d+)/)?.[1] ?? '100', 10);
  const shared = readme.match(/SHARED_PROMPT:\s*"([\s\S]+?)"/)?.[1] ?? '';
  
  const sModel = getArg('--model');
  const sTest = getArg('--test');
  if (sModel && !allModels.includes(sModel)) throw new Error(`Model "${sModel}" not found in README.`);
  const models = sModel ? [sModel] : allModels;

  const testDirs = (await fs.readdir(TESTS, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => parseInt(a) - parseInt(b));
    
  let targetTests = [];
  
  const candidates = sTest 
    ? testDirs.filter(d => d.startsWith(`${sTest}_`))
    : testDirs.slice(0, Math.ceil(testDirs.length * (pct / 100)));

  for (const dir of candidates) {
    try {
      await fs.access(path.join(TESTS, dir, 'test.js'));
      targetTests.push(dir);
    } catch {
      if (sTest) console.warn(`Skipping ${dir}: test.js not found`);
    }
  }

  if (sTest && !targetTests.length) throw new Error(`No valid tests found for "${sTest}"`);

  const clean = dir => fs.rm(path.join(TESTS, dir, OUT_DIR_NAME, sModel ? `${sModel.replace(/[\/:]/g, '_')}.js` : ''), { recursive: !sModel, force: true });
  await Promise.all(targetTests.map(clean));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const mSpec of models) {
    const parts = mSpec.split(/\s+/);
    const model = parts[0];
    const tStr = parts.find(p => p.startsWith('TEMP:'))?.split(':')[1];
    const eStr = parts.find(p => p.startsWith('EFF:'))?.split(':')[1];
    const temp = tStr ? parseFloat(tStr) : undefined;
    
    for (const dir of targetTests) {
      const testPath = path.join(TESTS, dir, 'test.js');
      const { prompt, functionName } = (await import(pathToFileURL(testPath))).default;
      const testCode = await fs.readFile(testPath, 'utf-8');

      console.log(`Gen ${dir} for ${mSpec} in ${OUT_DIR_NAME}...`);
      const res = await getLlmCode(`${shared}\n\n${prompt.trim()}`, model, functionName, temp, eStr);
      
      if (!res) continue;

      const result = await verify(page, res.code, testCode);
      console.log(`  -> ${result}`);

      const outDir = path.join(TESTS, dir, OUT_DIR_NAME);
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, `${mSpec.replace(/[\/:]/g, '_')}.js`), `${res.code}\n// Result: ${result}`);
    }
  }
  await browser.close();
  console.log('Done.');
};

main().catch(console.error);
