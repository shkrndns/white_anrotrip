/**
 * Rehype: типографика русского текста в Markdown (блог).
 * Не трогает code/pre/script/style. Исходные .md в CMS остаются «чистыми».
 */
import Typograf from 'typograf';
import { visit } from 'unist-util-visit';

const tp = new Typograf({ locale: ['ru', 'en-US'] });
tp.disableRule('ru/other/phone-number');

const SKIP_TAGS = new Set(['code', 'pre', 'script', 'style', 'kbd', 'samp']);

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
			node.value = tp.execute(node.value);
		});
	};
}
