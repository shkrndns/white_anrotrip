#!/usr/bin/env node
/**
 * Restore agent skills from skills-lock.json (skills.sh ecosystem).
 * Custom project skill: skills/anrotrip → .agents/skills/anrotrip
 *
 * Usage: node scripts/install-agent-skills.mjs
 *        pnpm skills:install
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lockFile = join(root, 'skills-lock.json');

if (!existsSync(lockFile)) {
	console.error(
		'skills-lock.json not found. Run from repo root after pulling latest main.',
	);
	process.exit(1);
}

console.log('Installing skills from skills-lock.json…');
const install = spawnSync('npx', ['skills', 'experimental_install'], {
	cwd: root,
	stdio: 'inherit',
	shell: true,
});

if (install.status !== 0) {
	process.exit(install.status ?? 1);
}

const src = join(root, 'skills/anrotrip');
const dest = join(root, '.agents/skills/anrotrip');
mkdirSync(dest, { recursive: true });
cpSync(join(src, 'SKILL.md'), join(dest, 'SKILL.md'));
console.log('Installed custom skill: anrotrip');
console.log('Done. Verify: npx skills ls');
