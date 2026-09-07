export function initScrollReveal(): void {
	if (window.__revealObserver) {
		window.__revealObserver.disconnect();
	}

	const prefersReduced = window.matchMedia(
		'(prefers-reduced-motion: reduce)',
	).matches;

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('reveal-visible');
					obs.unobserve(entry.target);
				}
			});
		},
		{
			root: null,
			rootMargin: '0px 0px -4% 0px',
			threshold: 0.01,
		},
	);

	window.__revealObserver = observer;

	const viewportH = window.innerHeight || document.documentElement.clientHeight;

	document.querySelectorAll('.reveal-hidden').forEach((el) => {
		if (prefersReduced) {
			el.classList.add('reveal-visible');
			return;
		}

		const rect = el.getBoundingClientRect();
		const inView = rect.top < viewportH * 0.96 && rect.bottom > 0;

		if (inView) {
			el.classList.add('reveal-visible');
			return;
		}

		el.classList.remove('reveal-visible');
		observer.observe(el);
	});
}
