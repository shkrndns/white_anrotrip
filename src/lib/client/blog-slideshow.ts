/** Слайдшоу обложек в карточках журнала — один таймер на контейнер. */

const timers = new WeakMap<HTMLElement, ReturnType<typeof setInterval>>();

export function initBlogSlideshows(root: ParentNode = document): void {
	const slideshows = root.querySelectorAll('[data-slideshow]');

	slideshows.forEach((container) => {
		const el = container as HTMLElement;
		const prev = timers.get(el);
		if (prev !== undefined) {
			clearInterval(prev);
			timers.delete(el);
		}

		const group = container.getAttribute('data-slideshow');
		if (!group) return;

		const slides = container.querySelectorAll(
			`[data-slideshow-group="${group}"]`,
		);
		if (slides.length < 2) return;

		slides.forEach((slide, i) => {
			(slide as HTMLElement).style.opacity = i === 0 ? '1' : '0';
		});

		let current = 0;
		timers.set(
			el,
			setInterval(() => {
				const next = (current + 1) % slides.length;
				(slides[current] as HTMLElement).style.opacity = '0';
				(slides[next] as HTMLElement).style.opacity = '1';
				current = next;
			}, 5000),
		);
	});
}
