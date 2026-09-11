/**
 * URL для @astrojs/sitemap (SSR: карточки журнала не попадают автоматически).
 */
import { BLOG_CARD_IDS } from '../data/blog-cards';

export const SITEMAP_ORIGIN = 'https://anrotrip.ru';

/** Карточки журнала — явно в sitemap */
export function getBlogCardSitemapUrls(): string[] {
	return BLOG_CARD_IDS.map((id) => `${SITEMAP_ORIGIN}/blog/${id}`);
}

/** Исключить noindex / служебные маршруты */
export function isSitemapPageAllowed(url: string): boolean {
	return !url.includes('/cabinet');
}
