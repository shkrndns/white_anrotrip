#!/usr/bin/env node
/**
 * Оптимизация изображений в src/assets — без потери качества.
 * Правила: max 1200px по длинной стороне, quality 92 (WebP/JPEG), 85 (AVIF).
 *
 * Запуск: pnpm optimize:images
 * Точечно (в т.ч. tours/, обычно пропускается): pnpm optimize:images -- --file src/assets/tours/vietnam.webp
 * Автоматически: перед pnpm build (prebuild)
 */

import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = join(process.cwd(), 'src', 'assets');
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 92;
const AVIF_QUALITY = 85;
const JPEG_QUALITY = 92;

// Исключения: мелкие логотипы, hero/welcome (полноэкранные), tours (ассеты скоро заменятся — см. audit 1.10)
const SKIP_PATTERNS = [
	/favicon\.(png|ico)$/i,
	/partners\//,
	/our-partners\//,
	/hero\//,
	/welcome\//,
	/tours\//,
];

async function getAllImages(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			await getAllImages(fullPath, files);
		} else {
			const ext = extname(entry.name).toLowerCase();
			if (['.webp', '.jpg', '.jpeg', '.png', '.avif'].includes(ext)) {
				const relative = fullPath.replace(process.cwd(), '').replace(/^\//, '');
				if (!SKIP_PATTERNS.some((p) => p.test(relative))) {
					files.push(fullPath);
				}
			}
		}
	}
	return files;
}

/**
 * @param {string} filePath
 * @param {{ force?: boolean; webpQuality?: number }} [options] — force: для --file; webpQuality: переопределение качества WebP
 */
async function optimizeImage(filePath, options = {}) {
	const { force = false, webpQuality = WEBP_QUALITY } = options;
	const { size: origSize } = await stat(filePath);
	const ext = extname(filePath).toLowerCase();
	const meta = await sharp(filePath).metadata();
	const { width, height } = meta;

	const needsResize = width > MAX_WIDTH || height > MAX_WIDTH;
	if (!force && !needsResize && origSize < 80_000) {
		return null;
	}

	let pipeline = sharp(filePath);
	if (needsResize) {
		pipeline = pipeline.resize(MAX_WIDTH, MAX_WIDTH, {
			fit: 'inside',
			withoutEnlargement: true,
		});
	}

	let buffer;
	switch (ext) {
		case '.avif':
			buffer = await pipeline.avif({ quality: AVIF_QUALITY }).toBuffer();
			break;
		case '.jpg':
		case '.jpeg':
			buffer = await pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer();
			break;
		case '.png':
			buffer = await pipeline
				.png({ compressionLevel: 9, adaptiveFiltering: true })
				.toBuffer();
			break;
		default:
			buffer = await pipeline
				.webp({ quality: webpQuality, effort: 6 })
				.toBuffer();
	}

	const newSize = buffer.length;
	if (newSize >= origSize) return null;

	const fs = await import('node:fs/promises');
	await fs.writeFile(filePath, buffer);

	return {
		path: filePath,
		origSize,
		newSize,
		saved: ((1 - newSize / origSize) * 100).toFixed(1),
	};
}

async function main() {
	const argv = process.argv.slice(2);
	const fileIdx = argv.indexOf('--file');
	const singleFileArg = fileIdx >= 0 ? argv[fileIdx + 1] : null;

	const results = [];

	if (singleFileArg) {
		const { resolve } = await import('node:path');
		const { access } = await import('node:fs/promises');
		const abs = resolve(process.cwd(), singleFileArg);
		try {
			await access(abs);
		} catch {
			console.error(`Файл не найден: ${singleFileArg}`);
			process.exit(1);
		}
		console.log(`Режим --file: ${abs}`);
		try {
			let r = await optimizeImage(abs, { force: true });
			if (!r && extname(abs).toLowerCase() === '.webp') {
				for (const q of [85, 80, 75]) {
					console.log(`Повторное сжатие WebP (quality ${q})…`);
					r = await optimizeImage(abs, { force: true, webpQuality: q });
					if (r) break;
				}
			}
			if (r) {
				results.push(r);
				console.log(
					`  ${r.path.replace(process.cwd(), '')}: ${(r.origSize / 1024).toFixed(0)} KB → ${(r.newSize / 1024).toFixed(0)} KB (−${r.saved}%)`,
				);
			} else {
				console.log(
					'Изменение не дало выигрыша по размеру (уже сжато или пересжатие не уменьшило файл).',
				);
			}
		} catch (err) {
			console.warn(`⚠ ${abs}: ${err.message}`);
			process.exit(1);
		}
	} else {
		const images = await getAllImages(ASSETS_DIR);
		console.log(`Найдено изображений: ${images.length}`);

		for (const img of images) {
			try {
				const r = await optimizeImage(img);
				if (r) results.push(r);
			} catch (err) {
				console.warn(`⚠ ${img}: ${err.message}`);
			}
		}
	}

	// OG image 1200×630 для соцсетей (логотип на фоне primary)
	const logoPath = join(ASSETS_DIR, 'favicon.png');
	const ogPngPath = join(process.cwd(), 'public', 'og-image.png');
	const ogJpgPath = join(process.cwd(), 'public', 'og-image.jpg');
	try {
		const logoSize = 380;
		const logo = await sharp(logoPath)
			.resize(logoSize, logoSize, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toBuffer();

		const ogBase = sharp({
			create: {
				width: 1200,
				height: 630,
				channels: 3,
				background: { r: 255, g: 255, b: 255 },
			},
		}).composite([
			{
				input: logo,
				left: Math.round((1200 - logoSize) / 2),
				top: Math.round((630 - logoSize) / 2),
			},
		]);

		await ogBase.clone().png({ compressionLevel: 9 }).toFile(ogPngPath);
		await ogBase.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(ogJpgPath);
		console.log(
			'OG image: public/og-image.png + og-image.jpg (1200×630, logo on white)',
		);
	} catch (e) {
		console.warn('⚠ OG image:', e.message);
	}

	if (results.length === 0 && !singleFileArg) {
		console.log('Все изображения уже оптимизированы.');
		return;
	}

	if (results.length > 0 && !singleFileArg) {
		console.log(`\nОптимизировано: ${results.length}`);
		let totalSaved = 0;
		for (const r of results) {
			totalSaved += r.origSize - r.newSize;
			console.log(
				`  ${r.path.replace(process.cwd(), '')}: ${(r.origSize / 1024).toFixed(0)} KB → ${(r.newSize / 1024).toFixed(0)} KB (−${r.saved}%)`,
			);
		}
		console.log(`\nВсего сэкономлено: ${(totalSaved / 1024).toFixed(0)} KB`);
	} else if (results.length > 0 && singleFileArg) {
		const r = results[0];
		console.log(
			`\nВсего сэкономлено: ${((r.origSize - r.newSize) / 1024).toFixed(0)} KB`,
		);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
