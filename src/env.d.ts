/// <reference types="astro/client" />
/// <reference types="astro/env" />

interface ImportMetaEnv {
	/** mtime og-image.* (сек), задаётся в astro.config.mjs при сборке / старте dev */
	readonly OG_IMAGE_VERSION: string;
	readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
	readonly PUBLIC_YANDEX_VERIFICATION?: string;
	readonly PUBLIC_OG_IMAGE_URL?: string;
	readonly PUBLIC_YANDEX_METRIKA_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	openGiftModal: () => void;
	closeGiftModal: () => void;
	openCallbackModal: () => void;
	closeCallbackModal: (event?: Event) => void;
	initScrollReveal: () => void;
	lockScroll: () => void;
	unlockScroll: () => void;
	/** Детерминированный плавный скролл — одинаковый во всех браузерах */
	smoothScrollTo: (top: number, onDone?: () => void) => void;
	/** Аналог scrollIntoView({ block: 'start' }) с учётом scroll-margin-top */
	smoothScrollIntoView: (el: Element | null, onDone?: () => void) => void;
	__revealObserver?: IntersectionObserver;
	__anchorSmoothInit?: boolean;
	scrollHomeToHash?: (hash: string, doc?: Document) => boolean;
	revealHomeAfterAnchor?: () => void;
	__layoutNavigationInit?: boolean;
	__blogBackNavigationInit?: boolean;
	openLightbox: (index: number) => void;
	closeLightbox: () => void;
	changeSlide: (direction: number) => void;
	toggleZoom: (event?: Event) => void;
	closeReviewForm: () => void;
	openFavoritesWidget?: () => void;
	/** Переключение вкладки поиска («nemo» | «tourvisor»); задаётся в SearchWidget.astro */
	switchSearchTab?: (targetId: string, focus?: boolean) => void;
	initSearchWidget?: () => void;
	/** Визуальная подсказка страны над виджетом Tourvisor (программный выбор недоступен) */
	tvSelectCountry?: (countryName: string) => void;
	loadTourvisor?: (showLoading?: boolean) => void;
	initNemoWidget?: () => void;
	__nemoAssetsPromise?: Promise<void>;
	__tourvisorScriptAdded?: boolean;
	__tourvisorReady?: boolean;
	createFocusTrap?: (
		container: HTMLElement,
	) => import('./lib/client/focus-trap').FocusTrapController;
}
