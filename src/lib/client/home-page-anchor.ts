function getAnchorOffset(id: string): number {
	const headerEl = document.getElementById('site-header');
	const headerHeight = headerEl ? headerEl.offsetHeight : 64;
	const isMobile = window.matchMedia('(max-width: 767px)').matches;

	if (id === 'search') return isMobile ? headerHeight - 16 : 78;

	const scrollOffset = parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue(
			'--scroll-offset',
		),
	);

	return headerHeight + (Number.isFinite(scrollOffset) ? scrollOffset : 24);
}

function revealPageAfterAnchor(): void {
	document.documentElement.classList.add('is-home-anchor-ready');
	window.setTimeout(() => {
		document.documentElement.classList.remove(
			'has-pending-home-anchor',
			'is-home-anchor-ready',
		);
	}, 350);
}

function scrollToCurrentHash(): boolean {
	const hash = window.location.hash;
	if (!hash || hash.length < 2) return false;

	const id = decodeURIComponent(hash.slice(1));
	const anchor = document.getElementById(id);
	if (!anchor) return false;

	const headerEl = document.getElementById('site-header');
	const headerHeight = headerEl ? headerEl.offsetHeight : 64;

	if (id !== 'search' && id !== 'content') {
		const badge = anchor.querySelector(
			'.section-badge, .inline-flex.rounded-full',
		);
		if (badge) {
			let layoutTop = 0;
			let node = badge as HTMLElement | null;
			while (node) {
				layoutTop += node.offsetTop;
				node = node.offsetParent as HTMLElement | null;
			}
			const extraGap = id === 'directions' ? 20 : 0;
			window.scrollTo({
				top: layoutTop - headerHeight - 26 - extraGap,
				behavior: 'auto',
			});
			return true;
		}
	}

	const offset = getAnchorOffset(id);
	const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
	window.scrollTo({ top, behavior: 'auto' });
	return true;
}

/** Якорный скролл на главной после загрузки (index.astro). */
export function initHomePageAnchor(): void {
	function runAfterLayout() {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (scrollToCurrentHash()) {
					revealPageAfterAnchor();
				} else {
					document.documentElement.classList.remove(
						'has-pending-home-anchor',
						'is-home-anchor-ready',
					);
				}
			});
		});
	}

	runAfterLayout();
	document.addEventListener('astro:page-load', runAfterLayout);
}
