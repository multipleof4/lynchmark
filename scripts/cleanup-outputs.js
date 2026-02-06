import { promises as fs } from 'fs';
import path from 'path';

const CWD = process.cwd();
const README_PATH = path.join(CWD, 'README');
const TESTS_DIR = path.join(CWD, 'tests');

async function main() {
  const readme = await fs.readFile(README_PATH, 'utf-8');
  const modelBlocks = readme.match(/<!-- (?:MODELS|GEMINI)_START -->\n([\s\S]+?)\n<!-- MODELS_END -->/g) || [];
  
  const validFilenames = new Set();
  modelBlocks.forEach(block => {
    const lines = block.replace(/<!-- .*? -->/g, '').trim().split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        validFilenames.add(`${trimmed.replace(/[\/:]/g, '_')}.js`);
      }
    });
  });

  if (validFilenames.size === 0) {
    console.error('No models found in README. Aborting cleanup to prevent accidental data loss.');
    return;
  }

  const testDirs = (await fs.readdir(TESTS_DIR, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let deletedCount = 0;

  for (const dir of testDirs) {
    for (const outSubDir of ['outputs', 'outputs_gemini']) {
      const outPath = path.join(TESTS_DIR, dir, outSubDir);
      try {
        const files = await fs.readdir(outPath);
        for (const file of files) {
          if (file.endsWith('.js') && !validFilenames.has(file)) {
            console.log(`Deleting stale output: ${dir}/${outSubDir}/${file}`);
            await fs.unlink(path.join(outPath, file));
            deletedCount++;
          }
        }
      } catch (e) {
        // Directory does not exist, move on
      }
    }
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} stale files.`);
}

main().catch(console.error);
