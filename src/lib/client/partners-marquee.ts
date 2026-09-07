/** Точное смещение CSS-marquee для бесшовного цикла (Partners / OurPartners). */
export function initMarqueeTrack(track: HTMLElement): void {
	track.style.animationPlayState = 'paused';

	requestAnimationFrame(() => {
		const cards = track.children;
		const half = Math.floor(cards.length / 2);
		if (half === 0) {
			track.style.animationPlayState = '';
			return;
		}

		const firstLeft = (cards[0] as HTMLElement).offsetLeft;
		const halfLeft = (cards[half] as HTMLElement).offsetLeft;
		const halfWidth = halfLeft - firstLeft;
		const totalWidth = track.scrollWidth;

		if (totalWidth > 0 && halfWidth > 0) {
			const offset = -(halfWidth / totalWidth) * 100;
			track.style.setProperty('--marquee-offset', `${offset.toFixed(4)}%`);
		}

		track.style.animationPlayState = '';
	});
}

/** Бесшовный ручной скролл на мобильных (дублированный ряд карточек). */
export function initSeamlessScrollLoop(el: HTMLElement): void {
	if (window.innerWidth >= 768) return;

	const half = () => el.scrollWidth / 2;
	const max = () => Math.max(0, el.scrollWidth - el.clientWidth);
	const threshold = 120;
	let jumping = false;
	let rafId = 0;

	const resetJumping = () => {
		jumping = false;
	};

	const checkAndLoop = () => {
		if (jumping) return;
		const m = max();
		if (m <= 0) return;
		const left = el.scrollLeft;
		const h = half();
		const cw = el.clientWidth;
		if (left < threshold) {
			jumping = true;
			el.scrollLeft = h + left;
			setTimeout(resetJumping, 50);
		} else if (left > m - threshold) {
			jumping = true;
			el.scrollLeft = h - cw - (m - left);
			setTimeout(resetJumping, 50);
		}
		rafId = 0;
	};

	el.addEventListener(
		'scroll',
		() => {
			if (jumping || rafId) return;
			rafId = requestAnimationFrame(checkAndLoop);
		},
		{ passive: true },
	);
}

export function initPartnersMarquee(): void {
	if (window.innerWidth < 768) {
		const mobile = document.getElementById('partners-mobile-scroll');
		if (mobile) initSeamlessScrollLoop(mobile);
		return;
	}

	const track = document.querySelector<HTMLElement>('.partners-track--forward');
	if (track) initMarqueeTrack(track);
}

export function initOurPartnersMarquee(): void {
	const root = document.getElementById('our-partners');
	if (!root) return;

	if (window.innerWidth >= 768) {
		root
			.querySelectorAll<HTMLElement>(
				'.partners-track--forward, .partners-track--reverse',
			)
			.forEach(initMarqueeTrack);
		return;
	}

	const row1 = document.getElementById('our-partners-mobile-scroll-1');
	const row2 = document.getElementById('our-partners-mobile-scroll-2');
	if (row1) initSeamlessScrollLoop(row1);
	if (row2) initSeamlessScrollLoop(row2);
}

export function initPartnersMarqueeAll(): void {
	initPartnersMarquee();
	initOurPartnersMarquee();
}
