#!/usr/bin/env node
/**
 * Применяет русскую типографику к markdown-файлам блога.
 * Изменяет исходные .md напрямую (кавычки, тире, неразрывные пробелы).
 * Rehype-плагин (src/integrations/rehype-typograf.mjs) обрабатывает HTML при сборке,
 * этот скрипт — для «чистоты» самих исходников.
 *
 * Запуск: pnpm typograf:blog
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Typograf = require('typograf');

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

const tp = new Typograf({ locale: ['ru', 'en-US'] });
tp.disableRule('ru/other/phone-number');

/** Обрабатывает только текстовые блоки — не трогает frontmatter и code-блоки */
function processMarkdown(content) {
	const lines = content.split('\n');
	let inFrontmatter = false;
	let frontmatterClosed = false;
	let inCodeBlock = false;

	return lines
		.map((line, i) => {
			// Frontmatter (---...---)
			if (i === 0 && line.trim() === '---') {
				inFrontmatter = true;
				return line;
			}
			if (inFrontmatter && line.trim() === '---') {
				inFrontmatter = false;
				frontmatterClosed = true;
				return line;
			}
			if (inFrontmatter) return line;
			if (!frontmatterClosed) return line;

			// Code-блоки (```...```)
			if (line.trim().startsWith('```')) {
				inCodeBlock = !inCodeBlock;
				return line;
			}
			if (inCodeBlock) return line;

			// Inline code (`...`) — не трогаем строки, содержащие только inline-код
			if (line.includes('`')) {
				// Обрабатываем типографику, но код в backticks будет защищён
				// Typograf не трогает содержимое тегов — здесь обходим эвристикой
				return line; // безопаснее не трогать строки с backticks
			}

			// Пустые строки, заголовки Markdown — применяем типографику
			if (!line.trim()) return line;

			return tp.execute(line);
		})
		.join('\n');
}

async function processFile(filePath) {
	const original = await readFile(filePath, 'utf-8');
	const processed = processMarkdown(original);

	if (original === processed) {
		console.log(`  ✓ ${basename(filePath)} — без изменений`);
		return;
	}

	await writeFile(filePath, processed, 'utf-8');
	console.log(`  ✏️  ${basename(filePath)} — обновлён`);
}

async function main() {
	console.log('Типографика блога: обработка src/content/blog/\n');

	const entries = await readdir(BLOG_DIR);
	const mdFiles = entries
		.filter((f) => extname(f) === '.md')
		.map((f) => join(BLOG_DIR, f));

	if (mdFiles.length === 0) {
		console.log('  Markdown-файлы не найдены.');
		return;
	}

	for (const file of mdFiles) {
		await processFile(file);
	}

	console.log(`\nГотово. Обработано файлов: ${mdFiles.length}`);
}

main().catch((err) => {
	console.error('Ошибка:', err.message);
	process.exit(1);
});
