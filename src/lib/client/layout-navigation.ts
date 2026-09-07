interface HomeNavigation {
	isHome: boolean;
	hash: string;
}

interface AstroBeforeSwapEvent extends Event {
	newDocument: Document;
	swap?: () => void;
}

function normalizePath(path: string): string {
	const p = path.replace(/\/$/, '');
	return p || '/';
}

function getBasePath(): string {
	const base = document.body.dataset.base || '/';
	return normalizePath(new URL(base, window.location.origin).pathname);
}

function getHomeNavigation(url: URL): HomeNavigation {
	const base = document.body.dataset.base || '/';
	const basePath =
		new URL(base, window.location.origin).pathname.replace(/\/$/, '') || '/';
	const targetPath = url.pathname.replace(/\/$/, '') || '/';
	const isHome =
		url.origin === window.location.origin &&
		(targetPath === basePath || targetPath === `${basePath}/index.html`);

	return { isHome, hash: url.hash || '' };
}

export function scrollHomeToHash(hash: string, doc?: Document): boolean {
	const root = doc ?? document;
	const view = root.defaultView ?? window;
	if (!hash || hash.length < 2) return false;

	const id = decodeURIComponent(hash.charAt(0) === '#' ? hash.slice(1) : hash);
	const anchor = root.getElementById(id);
	if (!anchor) return false;

	const headerEl = root.getElementById('site-header');
	const headerHeight = headerEl ? headerEl.offsetHeight : 64;
	let top: number | undefined;

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
			top = layoutTop - headerHeight - 26 - extraGap;
		}
	}

	if (top === undefined) {
		const isMobile = view.matchMedia('(max-width: 767px)').matches;
		const offset =
			id === 'search' ? (isMobile ? headerHeight - 16 : 78) : headerHeight + 25;
		top = anchor.getBoundingClientRect().top + view.scrollY - offset;
	}

	view.scrollTo(0, Math.max(0, top));
	return true;
}

export function revealHomeAfterAnchor(): void {
	document.documentElement.classList.add('is-home-anchor-ready');
	window.setTimeout(() => {
		document.documentElement.classList.remove(
			'has-pending-home-anchor',
			'is-home-anchor-ready',
		);
	}, 200);
}

function runHomeAnchorScroll(doc?: Document): boolean {
	const hash = (doc?.defaultView?.location.hash ||
		window.location.hash ||
		sessionStorage.getItem('pendingHomeHash') ||
		'') as string;
	if (!hash) return false;

	const scrolled = scrollHomeToHash(hash, doc);
	if (scrolled && !doc) {
		sessionStorage.removeItem('pendingHomeHash');
	}
	return scrolled;
}

function getBlogPrefix(): string {
	const basePath = getBasePath();
	return basePath === '/' ? '/blog' : `${basePath}/blog`;
}

function isBlogPath(pathname: string): boolean {
	const p = normalizePath(pathname);
	const prefix = getBlogPrefix();
	return p === prefix || p.indexOf(`${prefix}/`) === 0;
}

function isBlogIndexPath(pathname: string): boolean {
	const p = normalizePath(pathname);
	const prefix = getBlogPrefix();
	if (p === prefix) return true;
	return new RegExp(
		`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/\\d+$`,
	).test(p);
}

function getHomeJournalHref(): string {
	const base = document.body.dataset.base || '/';
	const url = new URL(base, window.location.origin);
	url.hash = 'journal';
	return url.href;
}

function applyJournalAfterBlogExit(): boolean {
	try {
		if (sessionStorage.getItem('blogExitToJournal') !== '1') return false;
	} catch {
		return false;
	}

	if (!getHomeNavigation(new URL(window.location.href)).isHome) {
		return false;
	}

	try {
		sessionStorage.removeItem('blogExitToJournal');
		sessionStorage.setItem('pendingHomeHash', '#journal');
	} catch {
		// sessionStorage may be unavailable
	}

	document.documentElement.classList.add('has-pending-home-anchor');

	if (window.location.hash !== '#journal') {
		const journalUrl = new URL(getHomeJournalHref());
		history.replaceState(
			null,
			'',
			journalUrl.pathname + journalUrl.search + journalUrl.hash,
		);
	}

	runHomeAnchorScroll();
	revealHomeAfterAnchor();
	return true;
}

function goHomeJournalFromBlog(): void {
	try {
		sessionStorage.setItem('pendingHomeHash', '#journal');
		sessionStorage.removeItem('blogExitToJournal');
	} catch {
		// sessionStorage may be unavailable
	}
	document.documentElement.classList.add('has-pending-home-anchor');
	window.location.replace(getHomeJournalHref());
}

function updateBlogExitFlag(): void {
	if (!isBlogPath(window.location.pathname)) {
		try {
			sessionStorage.removeItem('blogInternalNav');
		} catch {
			// sessionStorage may be unavailable
		}
		return;
	}

	if (isBlogIndexPath(window.location.pathname)) {
		try {
			if (sessionStorage.getItem('blogInternalNav') === '1') {
				sessionStorage.removeItem('blogInternalNav');
				sessionStorage.removeItem('blogExitToJournal');
			} else {
				sessionStorage.setItem('blogExitToJournal', '1');
			}
		} catch {
			// sessionStorage may be unavailable
		}
		return;
	}

	try {
		if (sessionStorage.getItem('blogInternalNav') === '1') {
			sessionStorage.removeItem('blogInternalNav');
			sessionStorage.removeItem('blogExitToJournal');
		} else {
			sessionStorage.setItem('blogExitToJournal', '1');
		}
	} catch {
		// sessionStorage may be unavailable
	}
}

function initBlogBackNavigation(): void {
	updateBlogExitFlag();

	if (!isBlogPath(window.location.pathname)) {
		applyJournalAfterBlogExit();
	}
}

export function initLayoutNavigation(): void {
	window.scrollHomeToHash = scrollHomeToHash;
	window.revealHomeAfterAnchor = revealHomeAfterAnchor;

	if (window.__layoutNavigationInit) return;
	window.__layoutNavigationInit = true;

	document.addEventListener('click', (event) => {
		if (event.defaultPrevented) return;

		const target = event.target;
		const link =
			target instanceof Element
				? (target.closest('a[href]') as HTMLAnchorElement | null)
				: null;
		if (!link) return;

		try {
			const url = new URL(link.href);
			const homeNavigation = getHomeNavigation(url);

			if (homeNavigation.isHome && homeNavigation.hash) {
				const rawHref = link.getAttribute('href') || '';
				// Якорь на текущей странице — не прятать body (только переход на главную с другой страницы)
				if (rawHref.charAt(0) === '#') return;
				const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
				const targetPath = url.pathname.replace(/\/$/, '') || '/';
				if (
					url.origin === window.location.origin &&
					targetPath === currentPath
				) {
					return;
				}

				sessionStorage.setItem('pendingHomeHash', homeNavigation.hash);
				if (homeNavigation.hash === '#journal') {
					sessionStorage.removeItem('blogExitToJournal');
				}
				document.documentElement.classList.add('has-pending-home-anchor');
			} else {
				sessionStorage.removeItem('pendingHomeHash');
			}
		} catch {
			sessionStorage.removeItem('pendingHomeHash');
		}
	});

	document.addEventListener(
		'click',
		(event) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const target = event.target;
			const link =
				target instanceof Element
					? (target.closest('a[href]') as HTMLAnchorElement | null)
					: null;
			if (!link?.hasAttribute('data-astro-reload')) return;

			try {
				const url = new URL(link.href);
				const homeNavigation = getHomeNavigation(url);
				if (!homeNavigation.isHome) return;

				event.preventDefault();
				if (homeNavigation.hash) {
					sessionStorage.setItem('pendingHomeHash', homeNavigation.hash);
				} else {
					sessionStorage.removeItem('pendingHomeHash');
				}
				document.documentElement.classList.add('is-page-leaving');
				window.setTimeout(() => {
					window.location.href = url.href;
				}, 220);
			} catch {
				return;
			}
		},
		true,
	);

	document.addEventListener('astro:before-swap', (event) => {
		const e = event as AstroBeforeSwapEvent;
		const isMainPage = e.newDocument.getElementById('search-widget');
		if (!isMainPage) return;

		const hash = sessionStorage.getItem('pendingHomeHash') || '';
		if (hash) {
			e.newDocument.documentElement.classList.add('has-pending-home-anchor');
			runHomeAnchorScroll(e.newDocument);
			return;
		}

		if (e.newDocument.querySelector('.tv-search-form.tv-moduleid-192367')) {
			e.swap = () => {
				const b = document.body.dataset.base || '/';
				sessionStorage.removeItem('pendingHomeHash');
				window.location.href = window.location.origin + b;
			};
		}
	});

	document.addEventListener('astro:after-swap', () => {
		if (!document.getElementById('search-widget')) return;

		if (applyJournalAfterBlogExit()) return;

		const hash =
			window.location.hash || sessionStorage.getItem('pendingHomeHash') || '';
		if (!hash) return;

		document.documentElement.classList.add('has-pending-home-anchor');
		runHomeAnchorScroll();

		requestAnimationFrame(() => {
			runHomeAnchorScroll();
			revealHomeAfterAnchor();
		});
	});

	window.addEventListener('pageshow', (e) => {
		if (e.persisted && document.querySelector('#search-widget')) {
			window.location.reload();
		}
	});

	if (!window.__blogBackNavigationInit) {
		window.__blogBackNavigationInit = true;

		document.addEventListener(
			'click',
			(event) => {
				if (!isBlogPath(window.location.pathname)) return;
				const target = event.target;
				const link =
					target instanceof Element
						? (target.closest('a[href]') as HTMLAnchorElement | null)
						: null;
				if (!link) return;
				try {
					const url = new URL(link.href, window.location.origin);
					if (
						url.origin === window.location.origin &&
						isBlogPath(url.pathname)
					) {
						sessionStorage.setItem('blogInternalNav', '1');
					}
				} catch {
					// invalid URL
				}
			},
			true,
		);

		window.addEventListener('popstate', () => {
			requestAnimationFrame(() => {
				if (applyJournalAfterBlogExit()) return;

				try {
					if (
						isBlogPath(window.location.pathname) &&
						sessionStorage.getItem('blogExitToJournal') === '1'
					) {
						goHomeJournalFromBlog();
					}
				} catch {
					// sessionStorage may be unavailable
				}
			});
		});
	}

	initBlogBackNavigation();
	document.addEventListener('astro:page-load', initBlogBackNavigation);
}
