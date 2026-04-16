import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const runtimeTargets = [
  'game.js',
  'combat.js',
  'index.html',
  'styles.css',
  'data'
];

function collectRuntimeAssetReferences() {
  const references = new Set();
  const assetPattern = /(portraits|landscapes)\/[A-Za-z0-9_./-]+\.(?:png|webp|jpg|jpeg)/g;

  const scanFile = (fullPath) => {
    const text = fs.readFileSync(fullPath, 'utf8');
    for (const match of text.matchAll(assetPattern)) {
      references.add(match[0]);
    }
  };

  const walk = (fullPath) => {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.readdirSync(fullPath).forEach((name) => walk(path.join(fullPath, name)));
      return;
    }
    scanFile(fullPath);
  };

  runtimeTargets.forEach((target) => walk(path.join(projectRoot, target)));
  return [...references].sort();
}

test('runtime asset references all resolve to files in the repo', () => {
  const missing = collectRuntimeAssetReferences().filter((ref) => !fs.existsSync(path.join(projectRoot, ref)));
  expect(missing).toEqual([]);
});
