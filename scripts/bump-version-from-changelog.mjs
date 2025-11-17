// scripts/bump-version-from-changelog.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const CHANGELOG_PATH = 'CHANGELOG.md';

const file = fs.readFileSync(CHANGELOG_PATH, 'utf8');

// 1) Split into template block + rest (version history)
const versionHeaderRegex = /^# (\d+\.\d+\.\d+)/m;
const versionMatch = versionHeaderRegex.exec(file);

if (!versionMatch || versionMatch.index === undefined) {
  console.error(
    'Could not find a version header like "# 1.0.0" in CHANGELOG.md',
  );
  process.exit(1);
}

const templateBlock = file.slice(0, versionMatch.index).trimEnd();
const historyBlock = file.slice(versionMatch.index).trimStart();

// Helper to get bullets from one of the template subsections
function extractBullets(template, heading) {
  const sectionRegex = new RegExp(`^## ${heading}[\\s\\S]*?(?=^## |$)`, 'm');
  const match = template.match(sectionRegex);
  if (!match) return [];

  const lines = match[0].split('\n').slice(1); // skip "## Heading"
  return lines.filter((l) => l.trim().startsWith('- '));
}

const breakingBullets = extractBullets(templateBlock, 'Breaking Change');
const addBullets = extractBullets(templateBlock, 'Add');
const removeBullets = extractBullets(templateBlock, 'Remove');
const fixBullets = extractBullets(templateBlock, 'Fix');

// 2) Decide bump level
let bump = null; // 'major' | 'minor' | 'patch' | null

if (breakingBullets.length > 0) {
  bump = 'major';
} else if (addBullets.length > 0) {
  bump = 'minor';
} else if (removeBullets.length > 0 || fixBullets.length > 0) {
  bump = 'patch';
}

if (!bump) {
  // No bullets in Template → nothing to do
  console.log('');
  process.exit(0);
}

// 3) Parse current version from first "# x.y.z" header
const [majorStr, minorStr, patchStr] = versionMatch[1].split('.');
let major = Number(majorStr);
let minor = Number(minorStr);
let patch = Number(patchStr);

if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
  console.error(`Invalid version format in CHANGELOG.md: ${versionMatch[1]}`);
  process.exit(1);
}
if (bump === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bump === 'minor') {
  minor += 1;
  patch = 0;
} else if (bump === 'patch') {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

// 4) Bump package.json + package-lock.json via npm
// NOTE: we do this BEFORE touching CHANGELOG so git is clean for `npm version`.
try {
  execSync(`npm version ${newVersion} --no-git-tag-version`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.error('Failed to run "npm version".', err);
  process.exit(1);
}

// 5) New empty template
const newTemplateBlock = [
  '# Template',
  '## Breaking Change',
  '## Add',
  '## Remove',
  '## Fix',
].join('\n');

// 6) New version block built from bullets (newest at top)
let newVersionBlock = `# ${newVersion}\n`;

if (breakingBullets.length > 0) {
  newVersionBlock += '## Breaking Change\n';
  newVersionBlock += breakingBullets.join('\n') + '\n';
}
if (addBullets.length > 0) {
  newVersionBlock += '## Add\n';
  newVersionBlock += addBullets.join('\n') + '\n';
}
if (removeBullets.length > 0) {
  newVersionBlock += '## Remove\n';
  newVersionBlock += removeBullets.join('\n') + '\n';
}
if (fixBullets.length > 0) {
  newVersionBlock += '## Fix\n';
  newVersionBlock += fixBullets.join('\n') + '\n';
}

const newFileContents = [
  newTemplateBlock,
  '',
  newVersionBlock.trimEnd(), // new version first
  '',
  historyBlock.trimEnd(), // then previous versions
  '',
].join('\n');

fs.writeFileSync(CHANGELOG_PATH, newFileContents, 'utf8');

// Just for logs
console.log(`Bumped to ${newVersion}`);
