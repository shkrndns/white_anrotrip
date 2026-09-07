/** Открытие/закрытие формы отзыва в секции Reviews. */
export function initReviewFormOverlay(): void {
	if (document.documentElement.dataset.reviewFormOverlayInit === '1') return;

	const formOverlay = document.getElementById('review-modal-overlay');
	const formContent = document.getElementById('review-modal-content');
	const openFormBtn = document.getElementById('open-review-form');
	const closeFormBtn = document.getElementById('close-review-form');

	if (!formOverlay || !formContent) return;

	document.documentElement.dataset.reviewFormOverlayInit = '1';

	if (formOverlay.parentElement !== document.body) {
		document.body.appendChild(formOverlay);
	}

	let reviewFormPreviousFocus: HTMLElement | null = null;
	let reviewFormFocusTrap: ReturnType<
		NonNullable<typeof window.createFocusTrap>
	> | null = null;

	openFormBtn?.addEventListener('click', () => {
		reviewFormPreviousFocus = document.activeElement as HTMLElement | null;
		formOverlay.classList.remove('hidden');
		formOverlay.style.display = 'flex';
		window.lockScroll?.();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				formContent.style.willChange = 'transform';
				formOverlay.classList.remove('opacity-0');
				formContent.classList.add('modal-open');
				reviewFormFocusTrap = window.createFocusTrap?.(formContent) ?? null;
				reviewFormFocusTrap?.activate(closeFormBtn);
			});
		});
	});

	window.closeReviewForm = () => {
		reviewFormFocusTrap?.deactivate();
		reviewFormFocusTrap = null;
		formContent.style.willChange = 'transform';
		formOverlay.classList.add('opacity-0');
		formContent.classList.remove('modal-open');

		const onCloseEnd = () => {
			if (!formOverlay.classList.contains('opacity-0')) return;
			formContent.style.willChange = '';
			formOverlay.classList.add('hidden');
			formOverlay.style.display = 'none';
			window.unlockScroll?.();
			reviewFormPreviousFocus?.focus();
			reviewFormPreviousFocus = null;
		};
		formContent.addEventListener('transitionend', onCloseEnd, { once: true });
	};

	closeFormBtn?.addEventListener('click', () => window.closeReviewForm());
	formOverlay.addEventListener('click', (e) => {
		if (e.target === formOverlay) window.closeReviewForm();
	});

	window.addEventListener('keydown', (e) => {
		if (
			e.key === 'Escape' &&
			formOverlay &&
			!formOverlay.classList.contains('hidden')
		) {
			window.closeReviewForm();
		}
	});
}
