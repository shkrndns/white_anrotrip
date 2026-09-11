import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import {
	BLOG_CARDS,
	isBlogCardId,
	type BlogCardMeta,
} from '../data/blog-cards';

export type BlogPost = CollectionEntry<'blog'>;

export type BlogCardWithPosts = BlogCardMeta & {
	posts: BlogPost[];
	images: ImageMetadata[];
	latestDate: Date;
};

function postCover(post: BlogPost): ImageMetadata | undefined {
	return (
		post.data.cardImage ?? post.data.heroImage ?? post.data.heroImages?.[0]
	);
}

/** Обложки постов карточки для слайда (без дублей, до 8). */
export function collectCardSlideshowImages(posts: BlogPost[]): ImageMetadata[] {
	const seen = new Set<string>();
	const images: ImageMetadata[] = [];

	for (const post of posts) {
		const candidates = [
			...(post.data.heroImages ?? []),
			post.data.cardImage,
			post.data.heroImage,
		];
		for (const img of candidates) {
			if (!img || seen.has(img.src)) continue;
			seen.add(img.src);
			images.push(img);
			if (images.length >= 8) return images;
		}
	}

	return images;
}

export async function loadPublishedBlogPosts(): Promise<BlogPost[]> {
	const allPosts = await getCollection('blog', ({ data }) => !data.draft);
	return allPosts.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

export async function loadBlogCards(): Promise<BlogCardWithPosts[]> {
	const posts = await loadPublishedBlogPosts();

	return BLOG_CARDS.map((meta) => {
		const cardPosts = posts.filter((post) => post.data.card === meta.id);
		return {
			...meta,
			posts: cardPosts,
			images: collectCardSlideshowImages(cardPosts),
			latestDate: cardPosts[0]?.data.pubDate ?? new Date(0),
		};
	});
}

export async function loadBlogCard(
	id: string,
): Promise<BlogCardWithPosts | null> {
	if (!isBlogCardId(id)) return null;
	const cards = await loadBlogCards();
	const card = cards.find((item) => item.id === id);
	if (!card || card.posts.length === 0) return null;
	return card;
}

export function blogPostCardHref(post: BlogPost): string {
	if (!post.data.card) return `/blog/${post.id}`;
	return `/blog/${post.data.card}#${post.id}`;
}

export function cardCoverAspect(
	images: ImageMetadata[],
): '4/3' | '4/5' | undefined {
	const first = images[0];
	if (!first) return undefined;
	return first.height > first.width ? '4/5' : '4/3';
}

export { postCover };
