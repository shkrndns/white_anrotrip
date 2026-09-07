function getScrollbarWidth(): number {
	return window.innerWidth - document.documentElement.clientWidth;
}

export function lockScroll(): void {
	const scrollbarWidth = getScrollbarWidth();

	if (scrollbarWidth <= 0) {
		document.body.style.overflow = 'hidden';
		return;
	}

	document.body.style.paddingRight = `${scrollbarWidth}px`;

	const header = document.querySelector('header');
	if (header instanceof HTMLElement) {
		header.style.paddingRight = `${scrollbarWidth}px`;
	}

	document.body.style.overflow = 'hidden';
}

export function unlockScroll(): void {
	document.body.style.overflow = '';
	document.body.style.paddingRight = '';

	const header = document.querySelector('header');
	if (header instanceof HTMLElement) {
		header.style.paddingRight = '';
	}
}
