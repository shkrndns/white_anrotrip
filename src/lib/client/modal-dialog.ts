/** Инициализация <dialog> из Modal.astro (по id). */
export function initModalDialog(id: string): void {
	const dialog = document.getElementById(id) as HTMLDialogElement | null;
	if (!dialog || dialog.dataset.modalInit === '1') return;
	dialog.dataset.modalInit = '1';

	const dialogEl = dialog;
	let previousActiveElement: HTMLElement | null = null;

	function closeWithAnimation() {
		const box = dialogEl.querySelector<HTMLElement>('.modal-box');
		if (box) {
			box.style.willChange = 'opacity, transform';
			box.classList.remove('modal-open');
			box.classList.add('scale-95', 'opacity-0');
			const onCloseEnd = () => {
				box.style.willChange = '';
				dialogEl.close();
			};
			box.addEventListener('transitionend', onCloseEnd, { once: true });
		} else {
			dialogEl.close();
		}
	}

	document.addEventListener(`open-modal-${id}`, () => {
		previousActiveElement = document.activeElement as HTMLElement | null;
		dialogEl.showModal();
		const box = dialogEl.querySelector<HTMLElement>('.modal-box');
		if (box) {
			box.style.willChange = 'opacity, transform';
			box.classList.remove('scale-95', 'opacity-0');
			box.classList.add('modal-open');
			const onOpenEnd = () => {
				box.style.willChange = '';
			};
			box.addEventListener('transitionend', onOpenEnd, { once: true });
		}
		dialogEl.querySelector<HTMLElement>('.close-modal')?.focus();
	});

	dialogEl.addEventListener('close', () => {
		previousActiveElement?.focus();
		previousActiveElement = null;
	});

	dialogEl.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			closeWithAnimation();
		}
	});

	document.addEventListener('click', (e) => {
		const t = e.target;
		if (!(t instanceof Element)) return;
		const d = document.getElementById(id);
		if (!d) return;
		if (t.closest(`#${id} .close-modal`)) closeWithAnimation();
		if (t === d) closeWithAnimation();
	});
}
