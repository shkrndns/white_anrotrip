/** Соотношение превью карточки блога (4/5 ≈ постеры MAX). */
export type BlogCardAspect = '4/3' | '4/5';

/** Точное соотношение MAX-постера (959×1200). */
export const BLOG_PORTRAIT_ASPECT_CLASS = 'aspect-blog-max-poster';

export function blogCardAspectClass(aspect?: BlogCardAspect): string {
	return aspect === '4/5' ? BLOG_PORTRAIT_ASPECT_CLASS : 'aspect-4/3';
}

export function isPortraitBlogAspect(aspect?: BlogCardAspect): boolean {
	return aspect === '4/5';
}

/** Portrait: явный cardAspect или hero выше, чем шире (MAX-постеры). */
export function isPortraitBlogPost(
	aspect?: BlogCardAspect,
	heroImage?: { width: number; height: number },
): boolean {
	if (aspect === '4/5') return true;
	if (heroImage && heroImage.height > heroImage.width) return true;
	return false;
}

export function isPortraitCardImage(
	aspect?: BlogCardAspect,
	image?: { width: number; height: number },
): boolean {
	if (aspect === '4/5') return true;
	if (image && image.height > image.width) return true;
	return false;
}

/** Hero: cover — полностью заполняет область hero. */
export function blogHeroImageClass(
	aspect?: BlogCardAspect,
	heroImage?: { width: number; height: number },
): string {
	return isPortraitBlogPost(aspect, heroImage)
		? 'blog-hero-image blog-hero-image--portrait absolute inset-0 w-full h-full'
		: 'blog-hero-image absolute inset-0 w-full h-full';
}

export function blogHeroContainerClass(
	aspect?: BlogCardAspect,
	heroImage?: { width: number; height: number },
): string {
	return isPortraitBlogPost(aspect, heroImage)
		? 'blog-hero--portrait relative'
		: 'relative h-[55vh] md:h-[65vh]';
}

/** Карточки блога: cover — подгонка под блок превью. */
export function blogCardImageClass(aspect?: BlogCardAspect): string {
	if (aspect === '4/5') {
		return 'blog-card-image blog-card-image--portrait w-full h-full';
	}
	return 'blog-card-image blog-card-image--landscape w-full h-full';
}

/** Единый блок медиа карточек журнала на главной. */
export const JOURNAL_CARD_MEDIA_CLASS =
	'journal-card-media--portrait aspect-blog-max-poster';

/** Zoom превью при hover карточки (как PopularTours). */
export const BLOG_CARD_MEDIA_ZOOM =
	'transition-transform duration-slow ease-out group-hover:scale-[1.04]';

export function journalCardMediaClass(): string {
	return JOURNAL_CARD_MEDIA_CLASS;
}

/** Превью в карточках журнала на главной. */
export function journalCardImageClass(
	aspect?: BlogCardAspect,
	image?: { width: number; height: number },
): string {
	const base = 'journal-card-image w-full h-full';
	return isPortraitCardImage(aspect, image)
		? `${base} journal-card-image--portrait`
		: `${base} journal-card-image--landscape`;
}

/** Карточки в списке блога: portrait выше, чем 4/3. */
export function journalCardAspectClass(aspect?: BlogCardAspect): string {
	return aspect === '4/5'
		? 'journal-card-media--portrait aspect-blog-max-poster'
		: 'aspect-4/3';
}

export const BLOG_PORTRAIT_IMAGE_WIDTH = 959;
export const BLOG_PORTRAIT_IMAGE_HEIGHT = 1200;
