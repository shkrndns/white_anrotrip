import {
	NEMO_BOOKING_URL,
	NEMO_CDN_BASE,
	readNemoWidgetConfig,
	type NemoWidgetConfig,
} from '../nemo-config';

declare global {
	interface Window {
		FlightsSearchWidget?: {
			init: (options: {
				nemoURL: string;
				rootElement: HTMLElement;
				locale: string;
				defaultDepartureAirport: string;
			}) => void;
		};
	}
}

function loadStylesheet(href: string, assetId: string): Promise<void> {
	if (document.querySelector(`link[data-nemo-asset="${assetId}"]`)) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.nemoAsset = assetId;
		link.onload = () => resolve();
		link.onerror = () => reject(new Error(`Nemo CSS failed: ${href}`));
		document.head.appendChild(link);
	});
}

function loadNemoAssets(config: NemoWidgetConfig): Promise<void> {
	if (window.__nemoAssetsPromise) return window.__nemoAssetsPromise;

	window.__nemoAssetsPromise = Promise.all([
		loadStylesheet(
			`${config.cdnBase}/flights.search.widget.min.css`,
			'widget-css',
		),
		loadStylesheet('/nemo/anrotrip-widget-theme.css', 'theme'),
		new Promise<void>((resolve, reject) => {
			if (document.querySelector('script[data-nemo-widget-js]')) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = `${config.cdnBase}/flights.search.widget.min.js`;
			script.async = true;
			script.dataset.nemoWidgetJs = '1';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Nemo JS failed to load'));
			document.body.appendChild(script);
		}),
	]).then(() => undefined);

	return window.__nemoAssetsPromise;
}

function bootNemoWidget(root: HTMLElement, config: NemoWidgetConfig): void {
	if (root.dataset.nemoInit === '1') return;

	loadNemoAssets(config)
		.then(() => {
			const tick = () => {
				if (typeof window.FlightsSearchWidget === 'undefined') {
					setTimeout(tick, 200);
					return;
				}

				if (root.dataset.nemoInit === '1') return;
				root.dataset.nemoInit = '1';

				window.FlightsSearchWidget.init({
					nemoURL: config.bookingUrl,
					rootElement: root,
					locale: 'ru',
					defaultDepartureAirport: 'SVX',
				});
			};

			tick();
		})
		.catch((err) => {
			console.error('[nemo-widget] failed to load assets', err);
		});
}

function resolveConfig(
	root: HTMLElement,
	config?: NemoWidgetConfig,
): NemoWidgetConfig | null {
	return (
		config ??
		readNemoWidgetConfig(root) ?? {
			cdnBase: NEMO_CDN_BASE,
			bookingUrl: NEMO_BOOKING_URL,
		}
	);
}

/** Lazy-load Nemo через IntersectionObserver (#nemo-root). */
export function initNemoWidget(config?: NemoWidgetConfig): void {
	const root = document.getElementById('nemo-root');
	if (!root) return;

	const resolved = resolveConfig(root, config);
	if (!resolved) {
		console.error('[nemo-widget] missing CDN/booking config');
		return;
	}

	if (root.dataset.nemoInit === '1') return;

	if (root.dataset.nemoObserving === '1') {
		bootNemoWidget(root, resolved);
		return;
	}

	root.dataset.nemoObserving = '1';
	const target = document.getElementById('search-widget') || root;

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();
					bootNemoWidget(root, resolved);
				}
			},
			{ rootMargin: '200px 0px' },
		);
		observer.observe(target);
		return;
	}

	bootNemoWidget(root, resolved);
}
