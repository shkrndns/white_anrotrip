/**
 * Rehype: типографика русского текста в Markdown (блог).
 * Не трогает code/pre/script/style. Исходные .md в CMS остаются «чистыми».
 */
import Typograf from 'typograf';
import { visit } from 'unist-util-visit';

const tp = new Typograf({ locale: ['ru', 'en-US'] });
tp.disableRule('ru/other/phone-number');

/** «ж/д» не разрывается по слэшу. */
function protectRailwayAbbrev(text) {
	return text.replace(/ж\/д/gi, (abbr) => abbr.replace('/', '\u2060/\u2060'));
}

/** Типограф срезает пробелы по краям строки — у узлов вокруг <strong>/<em> их нельзя терять. */
function typografKeepEdges(value) {
	const lead = /^\s*/.exec(value)?.[0] ?? '';
	const trail = /\s*$/.exec(value)?.[0] ?? '';
	const core = value.slice(lead.length, value.length - trail.length);
	if (!core) return value;
	return `${lead}${protectRailwayAbbrev(tp.execute(core))}${trail}`;
}

const SKIP_TAGS = new Set([
	'code',
	'pre',
	'script',
	'style',
	'kbd',
	'samp',
	'table',
]);

const INLINE_EMPHASIS_TAGS = new Set(['strong', 'em', 'b']);

function isInsideSkippedTag(node) {
	let parent = node.parent;
	while (parent) {
		if (parent.type === 'element' && SKIP_TAGS.has(parent.tagName)) {
			return true;
		}
		parent = parent.parent;
	}
	return false;
}

/**
 * Пробел снаружи <strong> схлопывается. Ставим nbsp внутрь тега —
 * его не съест minify, плюс CSS padding даёт видимый зазор.
 */
function padEmphasisWithNbsp(tree) {
	visit(tree, (node) => {
		const children = node.children;
		if (!children?.length) return;

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (
				child.type !== 'element' ||
				!INLINE_EMPHASIS_TAGS.has(child.tagName)
			) {
				continue;
			}

			const prev = children[i - 1];
			if (prev?.type === 'text' && typeof prev.value === 'string') {
				prev.value = prev.value.replace(/[\s\u00a0]+$/u, '');
			}

			const next = children[i + 1];
			if (next?.type === 'text' && typeof next.value === 'string') {
				next.value = next.value.replace(/^[\s\u00a0]+/u, '');
			}

			if (!child.children?.length) continue;

			const first = child.children[0];
			if (first?.type === 'text' && typeof first.value === 'string') {
				first.value = first.value.replace(/^[\s\u00a0]*/u, '\u00a0');
			} else {
				child.children.unshift({ type: 'text', value: '\u00a0' });
			}

			const last = child.children[child.children.length - 1];
			if (last?.type === 'text' && typeof last.value === 'string') {
				last.value = last.value.replace(/[\s\u00a0]*$/u, '\u00a0');
			} else {
				child.children.push({ type: 'text', value: '\u00a0' });
			}
		}
	});
}

/** @returns {import('unified').Plugin} */
export function rehypeTypograf() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.children) {
				for (const child of node.children) {
					child.parent = node;
				}
			}
		});

		visit(tree, 'text', (node) => {
			if (!node.value?.trim() || isInsideSkippedTag(node)) return;
			node.value = typografKeepEdges(node.value);
		});

		padEmphasisWithNbsp(tree);
	};
}
