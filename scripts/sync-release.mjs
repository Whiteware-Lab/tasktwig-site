import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pagePath = resolve(root, 'dist/index.html');
const repository = 'Whiteware-Lab/tasktwig-site';
const start = '<!-- downloads:start -->';
const end = '<!-- downloads:end -->';

const fixtureIndex = process.argv.indexOf('--from-file');
let releases;
if (fixtureIndex >= 0) {
  const fixture = process.argv[fixtureIndex + 1];
  if (!fixture) throw new Error('Missing --from-file path');
  releases = JSON.parse(await readFile(resolve(fixture), 'utf8'));
} else {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'TaskTwig-Pages',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=30`, {
    headers,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub Releases request failed: HTTP ${response.status}`);
  releases = await response.json();
}

if (!Array.isArray(releases)) throw new Error('Expected a list of GitHub Releases');

const assetNames = {
  android: /^TaskTwig-Android-(\d+\.\d+\.\d+)\+(\d+)\.apk$/,
  windows: /^TaskTwig-Setup-(\d+\.\d+\.\d+)\+(\d+)\.exe$/,
};
const selected = {};

for (const release of releases.filter((item) => !item.draft && !item.prerelease)) {
  for (const [platform, pattern] of Object.entries(assetNames)) {
    for (const asset of release.assets ?? []) {
      const version = pattern.exec(asset.name);
      if (!version || asset.size <= 0 || (asset.state && asset.state !== 'uploaded')) continue;
      const build = Number(version[2]);
      if (!Number.isSafeInteger(build) || build <= (selected[platform]?.build ?? 0)) continue;
      selected[platform] = { asset, release, version: version[1], build };
    }
  }
}

function platformCard(platform, title, symbol, emptyMessage) {
  const match = selected[platform];
  if (!match) {
    return `<div class="platform-card" id="${platform}-platform"><span class="platform-icon" aria-hidden="true">${symbol}</span><span><strong>${title}</strong><small>${emptyMessage}</small></span><span class="platform-badge">PRESTO</span></div>`;
  }
  const { asset, release, version, build } = match;
  const label = `${version} · build ${build}`;
  const size = `${(asset.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  const url = `https://github.com/${repository}/releases/download/${encodeURIComponent(release.tag_name)}/${encodeURIComponent(asset.name)}`;
  return `<a class="platform-card available" id="${platform}-platform" href="${url}"><span class="platform-icon" aria-hidden="true">${symbol}</span><span><strong>${title}</strong><small>${label} · ${size}</small></span><span class="platform-arrow" aria-hidden="true">↓</span></a>`;
}

const homepage = await readFile(pagePath, 'utf8');
const first = homepage.indexOf(start);
const last = homepage.indexOf(end);
if (first < 0 || last <= first) throw new Error('Download markers missing from homepage');

const downloadCards = [
  platformCard('android', 'Android', '▯', 'Download in preparazione'),
  platformCard('windows', 'Windows', '▦', 'Installer in preparazione'),
].join('\n              ');

await writeFile(pagePath, `${homepage.slice(0, first + start.length)}\n              ${downloadCards}\n              ${homepage.slice(last)}`);
const latest = Object.fromEntries(
  Object.entries(selected).map(([platform, { version, build }]) => [platform, { version, build }]),
);
await writeFile(resolve(root, 'dist/latest.json'), `${JSON.stringify(latest, null, 2)}\n`);
console.log(`Download disponibili: ${Object.keys(selected).join(', ') || 'nessuno'}`);
