/** FAQ-аккордеон (#faq-accordion). */
export function initFaqAccordion(): void {
	const accordion = document.getElementById('faq-accordion');
	if (!accordion || accordion.dataset.faqInit === '1') return;
	accordion.dataset.faqInit = '1';

	accordion.addEventListener(
		'click',
		(e) => {
			const target = e.target;
			if (!(target instanceof Element)) return;
			const btn = target.closest('.faq-trigger');
			if (!btn) return;
			const item = btn.closest('.faq-item');
			if (!item) return;
			e.preventDefault();
			e.stopPropagation();
			const isOpen = item.getAttribute('data-open') === 'true';
			item.removeAttribute('data-closing');
			item.setAttribute('data-open', String(!isOpen));
			btn.setAttribute('aria-expanded', String(!isOpen));
		},
		true,
	);
}
