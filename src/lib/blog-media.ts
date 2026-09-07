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

/** Portrait: contain без обрезки; landscape: contain в 4/3. */
export function blogCardImageClass(aspect?: BlogCardAspect): string {
	if (aspect === '4/5') {
		return 'w-full h-full object-contain object-center';
	}
	return 'blog-image-contain w-full h-full';
}

export const BLOG_PORTRAIT_IMAGE_WIDTH = 959;
export const BLOG_PORTRAIT_IMAGE_HEIGHT = 1200;
