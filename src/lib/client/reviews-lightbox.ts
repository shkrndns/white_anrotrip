export interface ReviewsLightboxOptions {
	reviewTitles: string[];
	reviewCount: number;
}

/** Инициализация лайтбокса отзывов: слайды, зум, клавиатура, свайп. */
export function initReviewsLightbox({
	reviewTitles,
	reviewCount,
}: ReviewsLightboxOptions): void {
	if (document.documentElement.dataset.reviewsLightboxInit === '1') return;

	let currentIndex = 0;
	let isZoomed = false;

	const lightbox = document.getElementById('lightbox');
	const track = document.getElementById('lightbox-track');
	const slides = document.querySelectorAll<HTMLElement>('.slide-item');
	const inners = document.querySelectorAll<HTMLElement>(
		'.lightbox-slide-inner',
	);
	const images = document.querySelectorAll<HTMLElement>('.lightbox-img');
	const counter = document.getElementById('lightbox-counter');
	const titleEl = document
		.getElementById('lightbox-heading')
		?.querySelector('span');

	const iconIn = document.getElementById('icon-zoom-in');
	const iconOut = document.getElementById('icon-zoom-out');

	if (!lightbox || !track || !iconIn || !iconOut) return;

	document.documentElement.dataset.reviewsLightboxInit = '1';

	const lb = lightbox;
	const tr = track;
	const iIn = iconIn;
	const iOut = iconOut;

	if (lb.parentElement !== document.body) {
		document.body.appendChild(lb);
	}

	let lightboxPreviousFocus: HTMLElement | null = null;
	let lightboxFocusTrap: ReturnType<
		NonNullable<typeof window.createFocusTrap>
	> | null = null;

	function togglePageElements(hide: boolean) {
		const isMobile = window.matchMedia('(max-width: 768px)').matches;
		const duration = isMobile ? 200 : 500;
		const scrollToTop = document.getElementById('scroll-to-top');
		const others = [
			document.getElementById('favorites-widget'),
			document.getElementById('office-widget-container'),
		];
		if (hide) {
			[scrollToTop, ...others].forEach((el) => {
				if (!el) return;
				el.style.transition = `opacity ${duration}ms ease-out`;
				el.style.opacity = '0';
				el.style.pointerEvents = 'none';
			});
		} else {
			others.forEach((el) => {
				if (!el) return;
				el.style.transition = `opacity ${duration}ms ease-out`;
				el.style.opacity = '1';
				el.style.pointerEvents = 'auto';
				setTimeout(() => {
					el.style.transition = '';
					el.style.opacity = '';
					el.style.pointerEvents = '';
				}, duration);
			});
			if (scrollToTop) {
				scrollToTop.style.transition = '';
				scrollToTop.style.opacity = '';
				scrollToTop.style.pointerEvents = '';
				window.dispatchEvent(new Event('scroll'));
			}
		}
	}

	function updateCounter() {
		if (counter) counter.textContent = `${currentIndex + 1} / ${reviewCount}`;
		if (titleEl) titleEl.textContent = reviewTitles[currentIndex] || '';
	}

	function updateTrackPosition(animate: boolean) {
		tr.style.transition = animate ? 'transform 0.3s ease-out' : 'none';
		tr.style.transform = `translateX(-${currentIndex * 100}%)`;
	}

	function resetZoom() {
		images.forEach((img) => {
			img.style.width = '';
			img.style.height = '';
			img.style.maxWidth = '';
			img.style.maxHeight = '';
		});
		inners.forEach((inner) => {
			inner.style.width = '';
			inner.style.height = '';
			inner.style.minWidth = '';
			inner.style.minHeight = '';
		});
		slides.forEach((slide) => {
			slide.style.overflowX = 'hidden';
			slide.style.overflowY = 'auto';
		});
		lb.style.cursor = 'zoom-in';
		iIn.classList.remove('hidden');
		iOut.classList.add('hidden');
		isZoomed = false;
	}

	window.openLightbox = (index) => {
		lightboxPreviousFocus = document.activeElement as HTMLElement | null;
		currentIndex = index;
		updateTrackPosition(false);
		updateCounter();
		const curSlide = slides[currentIndex];
		if (curSlide) {
			curSlide.scrollTop = 0;
			curSlide.scrollLeft = 0;
		}
		lb.classList.remove('hidden');
		lb.style.display = 'flex';
		window.lockScroll?.();
		togglePageElements(true);
		lightboxFocusTrap = window.createFocusTrap?.(lb) ?? null;
		lightboxFocusTrap?.activate(document.getElementById('lightbox-close-btn'));
		setTimeout(() => {
			lb.classList.remove('opacity-0');
		}, 10);
	};

	window.closeLightbox = () => {
		lightboxFocusTrap?.deactivate();
		lightboxFocusTrap = null;
		lb.classList.add('opacity-0');
		setTimeout(() => {
			lb.classList.add('hidden');
			lb.style.display = '';
			window.unlockScroll?.();
			resetZoom();
			togglePageElements(false);
			lightboxPreviousFocus?.focus();
			lightboxPreviousFocus = null;
		}, 300);
	};

	window.changeSlide = (dir) => {
		resetZoom();
		currentIndex = (currentIndex + dir + reviewCount) % reviewCount;
		updateTrackPosition(true);
		updateCounter();
		const curSlide = slides[currentIndex];
		if (curSlide) {
			curSlide.scrollTop = 0;
			curSlide.scrollLeft = 0;
		}
	};

	window.toggleZoom = () => {
		const img = images[currentIndex];
		const slide = slides[currentIndex];
		const inner = inners[currentIndex];
		if (!img || !slide) return;

		if (isZoomed) {
			img.style.width = '';
			img.style.height = '';
			img.style.maxWidth = '';
			img.style.maxHeight = '';
			if (inner) {
				inner.style.width = '';
				inner.style.height = '';
				inner.style.minWidth = '';
				inner.style.minHeight = '';
			}
			slide.style.overflowX = 'hidden';
			slide.style.overflowY = 'auto';
			lb.style.cursor = 'zoom-in';
			iIn.classList.remove('hidden');
			iOut.classList.add('hidden');
			isZoomed = false;
		} else {
			const w = img.clientWidth;
			const h = img.clientHeight;
			const zoomFactor = 1.5;
			const zoomedW = Math.round(w * zoomFactor);
			const zoomedH = Math.round(h * zoomFactor);
			if (inner && w && h) {
				inner.style.width = `${zoomedW}px`;
				inner.style.height = `${zoomedH}px`;
				inner.style.minWidth = `${zoomedW}px`;
				inner.style.minHeight = `${zoomedH}px`;
			}
			img.style.maxWidth = 'none';
			img.style.maxHeight = 'none';
			img.style.width = `${zoomedW}px`;
			img.style.height = `${zoomedH}px`;
			slide.style.overflow = 'auto';
			slide.style.overflowX = 'auto';
			slide.style.overflowY = 'auto';
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const maxScrollL = Math.max(0, slide.scrollWidth - slide.clientWidth);
					const maxScrollT = Math.max(
						0,
						slide.scrollHeight - slide.clientHeight,
					);
					slide.scrollLeft = maxScrollL * 0.5;
					slide.scrollTop = maxScrollT * 0.5;
				});
			});
			lb.style.cursor = 'zoom-out';
			iIn.classList.add('hidden');
			iOut.classList.remove('hidden');
			isZoomed = true;
		}
	};

	const lightboxTopBar = document.getElementById('lightbox-top-bar');
	const lightboxArrowPrev = document.querySelector(
		'[data-lightbox-arrow="prev"]',
	);
	const lightboxArrowNext = document.querySelector(
		'[data-lightbox-arrow="next"]',
	);
	const zoomBtnEl = document.getElementById('zoom-btn');

	lightboxTopBar?.addEventListener('click', (e) => e.stopPropagation());
	zoomBtnEl?.addEventListener('click', (e) => {
		e.stopPropagation();
		window.toggleZoom();
	});
	lightboxArrowPrev?.addEventListener('click', (e) => {
		e.stopPropagation();
		window.changeSlide(-1);
	});
	lightboxArrowNext?.addEventListener('click', (e) => {
		e.stopPropagation();
		window.changeSlide(1);
	});
	lb.addEventListener('click', (e) => {
		const t = e.target;
		if (!(t instanceof Element)) return;
		if (t.closest('#lightbox-top-bar') || t.closest('[data-lightbox-arrow]'))
			return;
		window.toggleZoom();
	});

	let touchStartX = 0;
	lb.addEventListener(
		'touchstart',
		(e) => {
			touchStartX = e.touches[0].clientX;
		},
		{ passive: true },
	);
	lb.addEventListener('touchend', (e) => {
		const dx = e.changedTouches[0].clientX - touchStartX;
		if (Math.abs(dx) > 50) window.changeSlide(dx < 0 ? 1 : -1);
	});

	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !lb.classList.contains('hidden')) {
			window.closeLightbox();
		}
		if (!lb.classList.contains('hidden')) {
			if (e.key === 'ArrowRight') window.changeSlide(1);
			if (e.key === 'ArrowLeft') window.changeSlide(-1);
		}
	});
}

const REVIEW_TAP_MOVE_PX = 10;

/** Открытие карточек отзывов: делегирование + tap после горизонтального скролла. */
function bindReviewCardTriggers(): void {
	if (window.__reviewsCardOpenInit) return;
	window.__reviewsCardOpenInit = true;

	let touchStartX = 0;
	let touchStartY = 0;
	let touchMoved = false;
	let suppressClick = false;

	const openFromTarget = (target: EventTarget | null): boolean => {
		if (!(target instanceof Element)) return false;
		const btn = target.closest('[data-review-index]');
		if (!(btn instanceof HTMLElement)) return false;
		const index = parseInt(btn.getAttribute('data-review-index') ?? '0', 10);
		if (!window.openLightbox) return false;
		window.openLightbox(index);
		return true;
	};

	document.addEventListener(
		'touchstart',
		(event) => {
			const scroller = document.getElementById('reviews-scroller');
			if (!scroller) return;
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (!target.closest('#reviews-scroller [data-review-index]')) return;

			touchMoved = false;
			suppressClick = false;
			const touch = event.touches[0];
			touchStartX = touch.clientX;
			touchStartY = touch.clientY;
		},
		{ passive: true },
	);

	document.addEventListener(
		'touchmove',
		(event) => {
			if (!event.touches[0]) return;
			const touch = event.touches[0];
			if (
				Math.abs(touch.clientX - touchStartX) > REVIEW_TAP_MOVE_PX ||
				Math.abs(touch.clientY - touchStartY) > REVIEW_TAP_MOVE_PX
			) {
				touchMoved = true;
			}
		},
		{ passive: true },
	);

	document.addEventListener('touchend', (event) => {
		if (touchMoved) return;
		if (!openFromTarget(event.target)) return;
		suppressClick = true;
		event.preventDefault();
	});

	document.addEventListener(
		'click',
		(event) => {
			if (suppressClick) {
				suppressClick = false;
				return;
			}
			openFromTarget(event.target);
		},
		true,
	);
}

export function initReviewsLightboxFromDom(): void {
	const lightbox = document.getElementById('lightbox');
	if (!lightbox?.dataset.reviewTitles) return;

	let reviewTitles: string[] = [];
	try {
		reviewTitles = JSON.parse(lightbox.dataset.reviewTitles) as string[];
	} catch {
		return;
	}

	const reviewCount = parseInt(
		lightbox.dataset.reviewCount ?? String(reviewTitles.length),
		10,
	);

	initReviewsLightbox({ reviewTitles, reviewCount });
	bindReviewCardTriggers();
}

export function initReviewsScroller(): void {
	const el = document.getElementById('reviews-scroller');
	if (!el) return;
	el.scrollLeft = 0;
}
