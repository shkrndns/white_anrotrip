#!/usr/bin/env node
/**
 * Импорт постов MAX-канала в черновики блога.
 *
 * Запуск: pnpm import:max-blog
 * Опции:
 *   --limit N        импортировать не более N новых постов (по умолчанию 20)
 *   --dry-run        только показать, что будет создано
 *   --sync-images    докачать/обновить hero/card у существующих черновиков
 *   --force-images   вместе с --sync-images: перекачать даже если heroImage уже есть
 *
 * Требует в .env: MAX_BOT_TOKEN, MAX_CHANNEL_ID
 */

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { get as httpsGet, request as httpsRequest } from 'node:https';
import { basename, join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DRAFTS_DIR = join(ROOT, 'src', 'content', 'blog', '_drafts');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const IMAGES_DIR = join(ROOT, 'src', 'assets', 'blog', 'max');
const API_HOST = 'platform-api2.max.ru';

/** @typedef {{ body?: { mid?: string; text?: string; attachments?: unknown[] }; timestamp?: number; url?: string }} MaxMessage */

/**
 * @param {string} name
 * @returns {string | undefined}
 */
function env(name) {
	const value = process.env[name]?.trim();
	return value || undefined;
}

/** @param {string} envPath */
async function loadDotEnv(envPath) {
	try {
		const text = await readFile(envPath, 'utf8');
		for (const line of text.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!process.env[key]) process.env[key] = value;
		}
	} catch {
		// .env необязателен, если переменные уже в окружении
	}
}

/**
 * @param {string} path
 * @param {string} token
 * @param {RequestInit & { method?: string; body?: string }} [options]
 */
function maxApi(path, token, options = {}) {
	const method = options.method ?? 'GET';
	return new Promise((resolve, reject) => {
		const req = httpsRequest(
			{
				hostname: API_HOST,
				path,
				method,
				headers: {
					Authorization: token,
					...(options.body ? { 'Content-Type': 'application/json' } : {}),
				},
				rejectUnauthorized: false,
			},
			(res) => {
				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					if (res.statusCode && res.statusCode >= 400) {
						reject(
							new Error(
								`MAX API ${method} ${path}: HTTP ${res.statusCode} — ${data}`,
							),
						);
						return;
					}
					try {
						resolve(data ? JSON.parse(data) : {});
					} catch (error) {
						reject(error);
					}
				});
			},
		);
		req.on('error', reject);
		if (options.body) req.write(options.body);
		req.end();
	});
}

/** @param {string} url @param {number} [redirects] */
function downloadBinary(url, redirects = 0) {
	return new Promise((resolve, reject) => {
		const fetchUrl = upgradeImageUrl(url);
		httpsGet(fetchUrl, { rejectUnauthorized: false }, (res) => {
			if (
				res.statusCode &&
				res.statusCode >= 300 &&
				res.statusCode < 400 &&
				res.headers.location
			) {
				if (redirects > 5) {
					reject(new Error(`Too many redirects: ${url}`));
					return;
				}
				const next = new URL(res.headers.location, fetchUrl).href;
				downloadBinary(next, redirects + 1)
					.then(resolve)
					.catch(reject);
				return;
			}
			if (res.statusCode && res.statusCode >= 400) {
				reject(
					new Error(`Download failed HTTP ${res.statusCode}: ${fetchUrl}`),
				);
				return;
			}
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => resolve(Buffer.concat(chunks)));
		}).on('error', reject);
	});
}

/** @param {string} url */
function upgradeImageUrl(url) {
	try {
		const parsed = new URL(url);
		if (parsed.hostname === 'i.oneme.ru' && !parsed.searchParams.has('fn')) {
			parsed.searchParams.set('fn', 'w_1440');
			return parsed.href;
		}
	} catch {
		// оставляем как есть
	}
	return url;
}

/** @param {string} url */
function isLikelyImageUrl(url) {
	try {
		const { hostname, pathname } = new URL(url);
		if (/\.(jpe?g|png|webp|gif|avif|bmp)(\?|$)/i.test(pathname)) return true;
		if (hostname === 'i.oneme.ru') return true;
		if (hostname.endsWith('.okcdn.ru')) return true;
		if (hostname === 'pimg.mycdn.me') return true;
		if (hostname === 'i.mycdn.me') return true;
		return false;
	} catch {
		return false;
	}
}

/**
 * @param {unknown} attachment
 * @returns {{ url: string; kind: 'photo' | 'preview' | 'video-thumb' } | null}
 */
function attachmentImageCandidate(attachment) {
	if (!attachment || typeof attachment !== 'object') return null;
	const att = /** @type {Record<string, unknown>} */ (attachment);
	const type = typeof att.type === 'string' ? att.type : '';
	const payload =
		att.payload && typeof att.payload === 'object'
			? /** @type {Record<string, unknown>} */ (att.payload)
			: null;

	if (type === 'image' && payload && typeof payload.url === 'string') {
		if (isLikelyImageUrl(payload.url)) {
			return { url: payload.url, kind: 'photo' };
		}
	}

	if (typeof att.image_url === 'string' && isLikelyImageUrl(att.image_url)) {
		return { url: att.image_url, kind: type === 'share' ? 'preview' : 'photo' };
	}

	if (type === 'video') {
		const thumb =
			att.thumbnail && typeof att.thumbnail === 'object'
				? /** @type {Record<string, unknown>} */ (att.thumbnail)
				: null;
		if (thumb && typeof thumb.url === 'string' && isLikelyImageUrl(thumb.url)) {
			return { url: thumb.url, kind: 'video-thumb' };
		}
	}

	if (
		payload &&
		typeof payload.url === 'string' &&
		isLikelyImageUrl(payload.url)
	) {
		return { url: payload.url, kind: 'preview' };
	}

	if (typeof att.url === 'string' && isLikelyImageUrl(att.url)) {
		return { url: att.url, kind: 'preview' };
	}

	return null;
}

/** @param {MaxMessage} message */
function collectImageUrls(message) {
	const attachments = message.body?.attachments ?? [];
	/** @type {{ url: string; score: number }[]} */
	const ranked = [];

	for (const attachment of attachments) {
		const candidate = attachmentImageCandidate(attachment);
		if (!candidate) continue;

		let score = 0;
		if (candidate.kind === 'photo') score = 100;
		else if (candidate.kind === 'video-thumb') score = 60;
		else score = 30;

		if (!ranked.some((item) => item.url === candidate.url)) {
			ranked.push({ url: candidate.url, score });
		}
	}

	ranked.sort((a, b) => b.score - a.score);
	return ranked.map((item) => item.url);
}

/** @param {string} dir */
async function listMarkdownFiles(dir) {
	/** @type {string[]} */
	const files = [];
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return files;
	}
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === '_drafts') continue;
			files.push(...(await listMarkdownFiles(full)));
		} else if (/\.mdx?$/i.test(entry.name)) {
			files.push(full);
		}
	}
	return files;
}

/** @param {string} filePath */
async function readSourceId(filePath) {
	const content = await readFile(filePath, 'utf8');
	const match = content.match(/^sourceId:\s*['"]?([^\s'"]+)['"]?\s*$/m);
	return match?.[1] ?? null;
}

/** @param {string} text */
function yamlSingleQuote(text) {
	return `'${text.replace(/'/g, "''")}'`;
}

/** @param {string} text */
function firstLine(text) {
	return (
		text
			.split(/\r?\n/)
			.find((line) => line.trim())
			?.trim() ?? ''
	);
}

/** @param {string} text @param {number} max */
function truncate(text, max) {
	const normalized = text.replace(/\s+/g, ' ').trim();
	if (normalized.length <= max) return normalized;
	return `${normalized.slice(0, max - 1).trim()}…`;
}

/** @param {string} mid */
function slugFromMid(mid) {
	return mid.replace(/^mid\./, '').replace(/[^\w-]+/g, '-');
}

/** @param {number} ms */
function isoDateFromMs(ms) {
	return new Date(ms).toISOString().slice(0, 10);
}

/**
 * @param {string} url
 * @param {string} baseName
 * @param {{ force?: boolean }} [options]
 */
async function saveImageAsWebp(url, baseName, options = {}) {
	await mkdir(IMAGES_DIR, { recursive: true });
	const outPath = join(IMAGES_DIR, `${baseName}.webp`);
	if (!options.force) {
		try {
			await stat(outPath);
			return `../../../assets/blog/max/${baseName}.webp`;
		} catch {
			// новый файл
		}
	}
	const buffer = await downloadBinary(url);
	await sharp(buffer).webp({ quality: 92 }).toFile(outPath);
	return `../../../assets/blog/max/${baseName}.webp`;
}

/**
 * @param {MaxMessage} message
 * @param {string} slug
 * @param {{ force?: boolean }} [options]
 */
async function importImages(message, slug, options = {}) {
	const urls = collectImageUrls(message);
	if (urls.length === 0) return { heroImage: null, cardImage: null, count: 0 };

	const heroRel = await saveImageAsWebp(urls[0], `${slug}-hero`, options);
	let cardRel = heroRel;
	if (urls.length > 1) {
		cardRel = await saveImageAsWebp(urls[1], `${slug}-card`, options);
	}
	return { heroImage: heroRel, cardImage: cardRel, count: urls.length };
}

/**
 * @param {string} content
 * @param {{ heroImage: string | null; cardImage: string | null }} images
 */
function patchFrontmatterImages(content, images) {
	const lines = content.split('\n');
	const fmEnd = lines.findIndex(
		(line, idx) => idx > 0 && line.trim() === '---',
	);
	if (fmEnd === -1) return content;

	const frontmatter = lines.slice(1, fmEnd);
	const body = lines.slice(fmEnd + 1);
	const filtered = frontmatter.filter(
		(line) => !/^heroImage:/.test(line) && !/^cardImage:/.test(line),
	);

	const authorIdx = filtered.findIndex((line) => /^author:/.test(line));
	const insertAt = authorIdx === -1 ? filtered.length : authorIdx + 1;
	if (images.heroImage)
		filtered.splice(insertAt, 0, `heroImage: '${images.heroImage}'`);
	if (images.cardImage && images.cardImage !== images.heroImage) {
		const offset = images.heroImage ? insertAt + 1 : insertAt;
		filtered.splice(offset, 0, `cardImage: '${images.cardImage}'`);
	}

	return ['---', ...filtered, '---', ...body].join('\n');
}

/** @param {string} token @param {string[]} mids */
async function fetchMessagesByIds(token, mids) {
	/** @type {MaxMessage[]} */
	const messages = [];
	for (let i = 0; i < mids.length; i += 50) {
		const batch = mids.slice(i, i + 50);
		const params = new URLSearchParams({
			message_ids: batch.join(','),
		});
		const data = /** @type {{ messages?: MaxMessage[] }} */ (
			await maxApi(`/messages?${params}`, token)
		);
		messages.push(...(data.messages ?? []));
	}
	return messages;
}

/**
 * @param {MaxMessage} message
 * @param {string} slug
 * @param {{ heroImage: string | null; cardImage: string | null }} images
 */
function buildDraftMarkdown(message, slug, images) {
	const text = message.body?.text?.trim() ?? '';
	const mid = message.body?.mid ?? slug;
	const pubDate = isoDateFromMs(message.timestamp ?? Date.now());
	const importedAt = isoDateFromMs(Date.now());
	const titleRaw = firstLine(text) || `Пост от ${pubDate}`;
	const title = truncate(titleRaw, 100);
	const description = truncate(text, 160);

	const lines = [
		'---',
		`title: ${yamlSingleQuote(title)}`,
		'description: |',
		...description.split('\n').map((line) => `  ${line}`),
		`pubDate: '${pubDate}'`,
		'draft: true',
		'source: max',
		`sourceId: ${yamlSingleQuote(mid)}`,
	];

	if (message.url) lines.push(`sourceUrl: ${yamlSingleQuote(message.url)}`);
	lines.push(`importedAt: '${importedAt}'`);
	lines.push(`author: 'Команда ANRO TRIP'`);
	if (images.heroImage) lines.push(`heroImage: '${images.heroImage}'`);
	if (images.cardImage && images.cardImage !== images.heroImage) {
		lines.push(`cardImage: '${images.cardImage}'`);
	}
	lines.push('---', '', text, '');

	return lines.join('\n');
}

/** @param {string} token @param {string} chatId @param {number} count */
async function fetchChannelMessages(token, chatId, count) {
	/** @type {MaxMessage[]} */
	const all = [];
	/** @type {number | undefined} */
	let to;

	while (all.length < count) {
		const batchSize = Math.min(100, count - all.length);
		const params = new URLSearchParams({
			chat_id: chatId,
			count: String(batchSize),
		});
		if (to !== undefined) params.set('to', String(to));

		const data = /** @type {{ messages?: MaxMessage[] }} */ (
			await maxApi(`/messages?${params}`, token)
		);
		const batch = data.messages ?? [];
		if (batch.length === 0) break;

		all.push(...batch);
		const oldest = batch[batch.length - 1];
		if (!oldest?.timestamp) break;
		to = oldest.timestamp - 1;
		if (batch.length < batchSize) break;
	}

	return all;
}

/** @param {string} token @param {{ force?: boolean }} [options] */
async function syncDraftImages(token, options = {}) {
	const draftFiles = await listMarkdownFiles(DRAFTS_DIR);
	/** @type {{ file: string; sourceId: string; slug: string }[]} */
	const targets = [];

	for (const file of draftFiles) {
		const sourceId = await readSourceId(file);
		if (!sourceId) continue;
		const content = await readFile(file, 'utf8');
		if (!options.force && /^heroImage:/m.test(content)) continue;
		targets.push({ file, sourceId, slug: slugFromMid(sourceId) });
	}

	if (targets.length === 0) {
		console.info('[import-max-blog] sync-images: нечего обновлять');
		return;
	}

	console.info(
		`[import-max-blog] sync-images: ${targets.length} черновик(ов)${options.force ? ' (force)' : ' без heroImage'}`,
	);
	const messages = await fetchMessagesByIds(
		token,
		targets.map((t) => t.sourceId),
	);
	const byMid = new Map(
		messages
			.map((m) => [m.body?.mid, m])
			.filter(([mid]) => typeof mid === 'string'),
	);

	let updated = 0;
	for (const target of targets) {
		const message = byMid.get(target.sourceId);
		if (!message) {
			console.warn(
				`[import-max-blog] sync-images: пост не найден — ${target.sourceId}`,
			);
			continue;
		}
		const images = await importImages(message, target.slug, options);
		if (!images.heroImage) {
			console.warn(
				`[import-max-blog] sync-images: нет картинок — ${basename(target.file)}`,
			);
			continue;
		}
		const content = await readFile(target.file, 'utf8');
		await writeFile(
			target.file,
			patchFrontmatterImages(content, images),
			'utf8',
		);
		updated += 1;
		console.info(
			`[import-max-blog] sync-images: ${basename(target.file)} (${images.count} img)`,
		);
	}

	console.info(`[import-max-blog] sync-images: обновлено ${updated}`);
}

async function main() {
	await loadDotEnv(join(ROOT, '.env'));

	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const syncImages = args.includes('--sync-images');
	const forceImages = args.includes('--force-images');
	const limitArg = args.find((a) => a.startsWith('--limit='));
	const limitFlagIdx = args.indexOf('--limit');
	let limit = 20;
	if (limitArg) {
		limit = Number.parseInt(limitArg.split('=')[1], 10);
	} else if (limitFlagIdx !== -1 && args[limitFlagIdx + 1]) {
		limit = Number.parseInt(args[limitFlagIdx + 1], 10);
	}
	if (!Number.isFinite(limit) || limit < 1) limit = 20;

	const token = env('MAX_BOT_TOKEN');
	const chatId = env('MAX_CHANNEL_ID');
	if (!token || !chatId) {
		console.error(
			'[import-max-blog] Нужны MAX_BOT_TOKEN и MAX_CHANNEL_ID в .env',
		);
		process.exit(1);
	}

	if (syncImages) {
		await syncDraftImages(token, { force: forceImages });
		return;
	}

	console.info('[import-max-blog] Загрузка постов канала…');
	const messages = await fetchChannelMessages(token, chatId, limit);
	console.info(`[import-max-blog] Получено постов из API: ${messages.length}`);

	await mkdir(DRAFTS_DIR, { recursive: true });

	const draftFiles = await listMarkdownFiles(DRAFTS_DIR);
	const publishedFiles = await listMarkdownFiles(BLOG_DIR);
	const allFiles = [...draftFiles, ...publishedFiles];

	/** @type {Set<string>} */
	const knownSourceIds = new Set();
	for (const file of allFiles) {
		const sourceId = await readSourceId(file);
		if (sourceId) knownSourceIds.add(sourceId);
	}

	let created = 0;
	let skipped = 0;

	for (const message of messages) {
		const mid = message.body?.mid;
		if (!mid) {
			skipped += 1;
			continue;
		}
		if (knownSourceIds.has(mid)) {
			skipped += 1;
			continue;
		}

		const slug = slugFromMid(mid);
		const outPath = join(DRAFTS_DIR, `max-${slug}.md`);
		try {
			await stat(outPath);
			skipped += 1;
			knownSourceIds.add(mid);
			continue;
		} catch {
			// файла нет — создаём
		}

		if (dryRun) {
			console.info(`[dry-run] создать: ${basename(outPath)} (${mid})`);
			created += 1;
			continue;
		}

		const images = await importImages(message, slug);
		const markdown = buildDraftMarkdown(message, slug, images);
		await writeFile(outPath, markdown, 'utf8');
		knownSourceIds.add(mid);
		created += 1;
		const imgNote = images.heroImage ? `, ${images.count} img` : ', без img';
		console.info(`[import-max-blog] + ${basename(outPath)}${imgNote}`);
	}

	console.info(
		`[import-max-blog] Готово: создано ${created}, пропущено ${skipped}${dryRun ? ' (dry-run)' : ''}`,
	);
}

main().catch((error) => {
	console.error(
		'[import-max-blog]',
		error instanceof Error ? error.message : error,
	);
	process.exit(1);
});
