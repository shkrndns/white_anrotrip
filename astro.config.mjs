// @ts-check
import { statSync } from 'node:fs';
import { join } from 'node:path';
import node from '@astrojs/node';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { rehypeFaIcons } from './src/integrations/rehype-fa-icons.mjs';
import { rehypeTypograf } from './src/integrations/rehype-typograf.mjs';

/** Доверенные Host / X-Forwarded-* (Astro 7). Без whitelist clientAddress = IP прокси, rate-limit ломается. */
const prodAllowedDomains = [
	{ hostname: 'anrotrip.ru', protocol: 'https' },
	{ hostname: 'www.anrotrip.ru', protocol: 'https' },
];

const devAllowedDomains = [
	{ hostname: 'localhost', protocol: 'http' },
	{ hostname: '127.0.0.1', protocol: 'http' },
	...prodAllowedDomains,
];

/** Лимит тела POST для /api/* (отзыв до 8 KB; 64 KB с запасом). Дефолт адаптера — 1 GB. */
const API_BODY_SIZE_LIMIT = 64 * 1024;

/** mtime og-image.* после prebuild — cache-buster без stat() на каждый SSR-запрос */
function readOgImageVersion() {
	for (const file of ['og-image.png', 'og-image.jpg']) {
		try {
			return String(
				Math.floor(
					statSync(join(process.cwd(), 'public', file)).mtimeMs / 1000,
				),
			);
		} catch {
			/* try next */
		}
	}
	return '';
}

// https://astro.build/config
export default defineConfig({
	/** Astro 7: 'jsx' по умолчанию сжимает пробелы между inline-элементами; true — как в v6 */
	compressHTML: true,
	markdown: {
		processor: unified({
			rehypePlugins: [rehypeFaIcons, rehypeTypograf],
		}),
	},
	/** Прод: anrotrip.ru (Beget VPS + Docker + Caddy).
	 *  Локальный тест: docker run -p 4321:4321 — открыть http://localhost:4321
	 *  GitHub Pages (архив): был site=hyperdevops.github.io, base=/white_anrotrip/ — более не используется.
	 *  Подробнее: .doc/deploy/server-vps-stack-plan.md */
	site: 'https://anrotrip.ru',
	output: 'server',
	adapter: node({ mode: 'standalone', bodySizeLimit: API_BODY_SIZE_LIMIT }),

	security: {
		allowedDomains:
			process.env.NODE_ENV === 'production'
				? prodAllowedDomains
				: devAllowedDomains,
	},

	vite: {
		plugins: [tailwindcss()],
		define: {
			'import.meta.env.OG_IMAGE_VERSION': JSON.stringify(readOgImageVersion()),
		},
		build: {
			/** Не minify CSS: иначе пропадает backdrop-blur (Tailwind v4 + Vite).
			 *  См. AGENTS.md → «Blur в production» и .doc/deploy/notes-blur-production.md */
			cssMinify: false,
		},
	},

	integrations: [sitemap()],
});
