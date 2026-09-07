let scrollHandler: (() => void) | null = null;
let clickHandler: (() => void) | null = null;

/** Кнопка «Наверх» (#scroll-to-top). */
export function initScrollToTop(): void {
	const scrollBtn = document.getElementById('scroll-to-top');
	if (!scrollBtn) return;

	const btn = scrollBtn;

	if (scrollHandler) {
		window.removeEventListener('scroll', scrollHandler);
	}
	if (clickHandler) {
		btn.removeEventListener('click', clickHandler);
	}

	let ticking = false;

	function updateButtonVisibility() {
		const docHeight = document.documentElement.scrollHeight;
		const scrollPos = window.scrollY + window.innerHeight;

		if (docHeight - scrollPos < 50) {
			btn.classList.remove(
				'opacity-0',
				'translate-y-20',
				'pointer-events-none',
			);
			btn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
		} else {
			btn.classList.remove(
				'opacity-100',
				'translate-y-0',
				'pointer-events-auto',
			);
			btn.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
		}

		ticking = false;
	}

	scrollHandler = () => {
		if (!ticking) {
			window.requestAnimationFrame(updateButtonVisibility);
			ticking = true;
		}
	};

	clickHandler = () => {
		navigator.vibrate?.(10);
		window.smoothScrollTo?.(0);
	};

	window.addEventListener('scroll', scrollHandler, { passive: true });
	btn.addEventListener('click', clickHandler);
	updateButtonVisibility();
}
