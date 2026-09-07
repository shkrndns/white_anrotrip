/**
 * Rehype: `<i class="fa-solid fa-*">` в Markdown → inline SVG (Iconify fa6-*).
 * Нужен для HTML-блоков в .md без MDX.
 *
 * Astro запускает кастомные rehype-плагины до rehype-raw, поэтому HTML из
 * markdown сначала лежит в узлах `raw`, а не `element`. Обрабатываем оба случая.
 */
import { fromHtml } from 'hast-util-from-html';
import { visit } from 'unist-util-visit';

const STYLE_MAP = {
	'fa-solid': 'fa6-solid',
	'fa-regular': 'fa6-regular',
	'fa-brands': 'fa6-brands',
};

/** `<i class="fa-solid fa-*"></i>` в сыром HTML markdown-блоков */
const FA_I_TAG_RE =
	/<i\s+class="([^"]*\bfa-(?:solid|regular|brands)\b[^"]*)"\s*>\s*<\/i>/gi;

/** @type {Map<string, string>} */
const cache = new Map();

/** @param {string} classes */
function parseFaClasses(classes) {
	const parts = classes.trim().split(/\s+/).filter(Boolean);
	let prefix = 'fa6-solid';
	let icon = 'link';
	for (const part of parts) {
		if (part in STYLE_MAP) prefix = STYLE_MAP[part];
		else if (
			part.startsWith('fa-') &&
			part !== 'fa-solid' &&
			part !== 'fa-regular' &&
			part !== 'fa-brands'
		) {
			icon = part.slice(3);
		}
	}
	return `${prefix}:${icon}`;
}

/** @param {string} name */
async function loadSvg(name) {
	if (cache.has(name)) return cache.get(name);
	const [prefix, icon] = name.split(':');
	const res = await fetch(`https://api.iconify.design/${prefix}/${icon}.svg`);
	if (!res.ok) {
		throw new Error(`[rehype-fa-icons] ${name}: HTTP ${res.status}`);
	}
	const svg = await res.text();
	cache.set(name, svg);
	return svg;
}

/** @param {string} svgRaw */
function svgToInlineHtml(svgRaw) {
	const formatted = svgRaw.replace(
		/<svg\b/,
		'<svg width="1em" height="1em" fill="currentColor" aria-hidden="true"',
	);
	return `<span class="inline-flex leading-none" aria-hidden="true">${formatted}</span>`;
}

/** @param {string} html */
async function replaceFaIconsInRawHtml(html) {
	FA_I_TAG_RE.lastIndex = 0;
	if (!FA_I_TAG_RE.test(html)) return html;

	FA_I_TAG_RE.lastIndex = 0;
	const matches = [...html.matchAll(FA_I_TAG_RE)];
	let result = html;

	for (const match of matches) {
		const classes = match[1];
		const iconName = parseFaClasses(classes);
		const svgRaw = await loadSvg(iconName);
		result = result.replace(match[0], svgToInlineHtml(svgRaw));
	}

	return result;
}

/** @param {import('hast').Element} svgNode */
function applySvgProps(svgNode) {
	svgNode.properties = {
		...svgNode.properties,
		width: '1em',
		height: '1em',
		fill: 'currentColor',
		'aria-hidden': 'true',
	};
}

/** @returns {import('unified').Plugin} */
export function rehypeFaIcons() {
	return async (tree) => {
		/** @type {import('hast').RootContent[]} */
		const rawNodes = [];
		/** @type {{ node: import('hast').Element; index: number; parent: import('hast').Element; classes: string }[]} */
		const elementTasks = [];

		visit(tree, 'raw', (node) => {
			if (/\bfa-(solid|regular|brands)\b/.test(node.value)) {
				rawNodes.push(node);
			}
		});

		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'i' || parent == null || index == null) return;
			const cls = node.properties?.className;
			const classes = Array.isArray(cls)
				? cls.join(' ')
				: typeof cls === 'string'
					? cls
					: '';
			if (!/\bfa-(solid|regular|brands)\b/.test(classes)) return;
			elementTasks.push({ node, index, parent, classes });
		});

		for (const node of rawNodes) {
			node.value = await replaceFaIconsInRawHtml(node.value);
		}

		for (const { index, parent, classes } of elementTasks) {
			const iconName = parseFaClasses(classes);
			const svgRaw = await loadSvg(iconName);
			const fragment = fromHtml(svgRaw, { fragment: true });
			const svgNode = fragment.children.find((n) => n.type === 'element');
			if (!svgNode || svgNode.type !== 'element') continue;

			applySvgProps(svgNode);

			parent.children[index] = {
				type: 'element',
				tagName: 'span',
				properties: {
					className: ['inline-flex', 'leading-none'],
					'aria-hidden': 'true',
				},
				children: [svgNode],
			};
		}
	};
}
