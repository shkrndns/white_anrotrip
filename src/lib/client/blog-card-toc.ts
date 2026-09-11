/** Плавный скролл к статьям в карточке журнала (оглавление). */

import { smoothScrollIntoView } from './smooth-scroll';

/** Совпадает с `top-4` у закреплённой плашки. */
const TOC_PIN_TOP_PX = 16;

let pinCleanup: (() => void) | undefined;

function articleIdFromHref(href: string): string | null {
	if (!href.startsWith('#') || href.length < 2) return null;
	try {
		return decodeURIComponent(href.slice(1));
	} catch {
		return href.slice(1);
	}
}

function scrollToCardArticle(id: string): boolean {
	const el = document.getElementById(id);
	if (!el) return false;

	smoothScrollIntoView(el);

	const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`;
	history.replaceState(null, '', url);
	return true;
}

function bindTocPin(): void {
	pinCleanup?.();
	pinCleanup = undefined;

	const nav = document.querySelector<HTMLElement>('[data-blog-card-toc]');
	const spacer = document.querySelector<HTMLElement>(
		'[data-blog-card-toc-spacer]',
	);
	if (!nav || !spacer) return;

	const updatePin = (): void => {
		const pinned = nav.classList.contains('blog-card-toc--pinned');
		const reference = pinned ? spacer : nav;
		const shouldPin = reference.getBoundingClientRect().top <= TOC_PIN_TOP_PX;

		if (shouldPin === pinned) {
			if (pinned) spacer.style.height = `${nav.offsetHeight}px`;
			return;
		}

		if (shouldPin) {
			spacer.style.height = `${nav.offsetHeight}px`;
			nav.classList.add('blog-card-toc--pinned');
			return;
		}

		nav.classList.remove('blog-card-toc--pinned');
		spacer.style.height = '';
	};

	let ticking = false;
	const onScrollOrResize = (): void => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			updatePin();
		});
	};

	updatePin();
	window.addEventListener('scroll', onScrollOrResize, { passive: true });
	window.addEventListener('resize', onScrollOrResize);

	pinCleanup = () => {
		window.removeEventListener('scroll', onScrollOrResize);
		window.removeEventListener('resize', onScrollOrResize);
		nav.classList.remove('blog-card-toc--pinned');
		spacer.style.height = '';
	};
}

export function initBlogCardToc(): void {
	if (!window.__blogCardTocInit) {
		window.__blogCardTocInit = true;

		document.addEventListener(
			'click',
			(event) => {
				if (
					event.button !== 0 ||
					event.metaKey ||
					event.ctrlKey ||
					event.shiftKey ||
					event.altKey
				) {
					return;
				}

				const target = event.target;
				if (!(target instanceof Element)) return;
				if (!target.closest('[data-blog-card-toc]')) return;

				const anchor = target.closest('a[href^="#"]');
				if (!(anchor instanceof HTMLAnchorElement)) return;

				const id = articleIdFromHref(anchor.getAttribute('href') ?? '');
				if (!id || !document.getElementById(id)) return;

				event.preventDefault();
				event.stopPropagation();
				scrollToCardArticle(id);
			},
			true,
		);

		document.addEventListener('astro:before-swap', () => {
			pinCleanup?.();
			pinCleanup = undefined;
		});
	}

	bindTocPin();
}
