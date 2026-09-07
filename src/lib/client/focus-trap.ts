/** Фокус-ловушка для модалок, drawer и cookie banner (a11y). */

export const FOCUSABLE_SELECTOR =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
	).filter((el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden'));
}

export function handleFocusTrapKeydown(
	event: KeyboardEvent,
	container: HTMLElement,
): void {
	if (event.key !== 'Tab') return;
	const focusables = getFocusableElements(container);
	if (focusables.length === 0) return;
	const first = focusables[0];
	const last = focusables[focusables.length - 1];
	if (event.shiftKey) {
		if (document.activeElement === first) {
			event.preventDefault();
			last.focus();
		}
	} else if (document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

export type FocusTrapController = {
	activate: (initialFocus?: HTMLElement | null) => void;
	deactivate: () => void;
};

/** Tab-цикл внутри container; повесьте keydown на container или document. */
export function createFocusTrap(container: HTMLElement): FocusTrapController {
	const handler = (event: KeyboardEvent) =>
		handleFocusTrapKeydown(event, container);

	return {
		activate(initialFocus) {
			container.addEventListener('keydown', handler);
			const target = initialFocus ?? getFocusableElements(container)[0] ?? null;
			target?.focus();
		},
		deactivate() {
			container.removeEventListener('keydown', handler);
		},
	};
}
