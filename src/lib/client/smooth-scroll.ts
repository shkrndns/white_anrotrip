function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clampTop(top: number): number {
	const max = document.documentElement.scrollHeight - window.innerHeight;
	return Math.max(0, Math.min(top, max));
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Детерминированный плавный скролл — одинаковый во всех браузерах. */
export function smoothScrollTo(top: number, onDone?: () => void): void {
	const target = clampTop(top);
	const startY = window.scrollY;
	const dist = target - startY;

	if (prefersReducedMotion() || Math.abs(dist) < 2) {
		window.scrollTo(0, target);
		onDone?.();
		return;
	}

	const duration = Math.min(1600, Math.max(750, Math.abs(dist) * 0.7));
	const startT = performance.now();

	function step(now: number): void {
		const p = Math.min(1, (now - startT) / duration);
		window.scrollTo(0, Math.round(startY + dist * easeInOutCubic(p)));
		if (p < 1) {
			requestAnimationFrame(step);
		} else {
			onDone?.();
		}
	}

	requestAnimationFrame(step);
}

/** Аналог scrollIntoView({ block: 'start' }) с учётом scroll-margin-top. */
export function smoothScrollIntoView(
	el: Element | null,
	onDone?: () => void,
): void {
	if (!el) return;
	const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
	const top = el.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
	smoothScrollTo(top, onDone);
}

/** Делегированный фолбэк для якорных ссылок на странице. */
export function initAnchorSmoothScroll(): void {
	if (window.__anchorSmoothInit) return;
	window.__anchorSmoothInit = true;

	document.addEventListener('click', (e) => {
		if (
			e.defaultPrevented ||
			e.button !== 0 ||
			e.metaKey ||
			e.ctrlKey ||
			e.shiftKey ||
			e.altKey
		) {
			return;
		}

		const target = e.target;
		if (!(target instanceof Element)) return;

		const anchor = target.closest('a[href^="#"]');
		if (!(anchor instanceof HTMLAnchorElement)) return;

		const href = anchor.getAttribute('href') ?? '';
		if (href.length < 2) return;

		const el = document.getElementById(href.slice(1));
		if (!el) return;

		e.preventDefault();
		smoothScrollIntoView(el);
	});
}
