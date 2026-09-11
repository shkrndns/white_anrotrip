import { buildBlogIndexSchemaGraph } from './schema-blog';
import { siteBlogIndex } from './site-urls';
import { loadBlogCards, type BlogCardWithPosts } from './blog-cards';

export type BlogListContext = {
	cards: BlogCardWithPosts[];
	allDestinations: string[];
	totalCount: number;
	materialsWord: string;
};

function materialsWordFor(count: number): string {
	if (count % 10 === 1 && count % 100 !== 11) return 'материал';
	if (
		count % 10 >= 2 &&
		count % 10 <= 4 &&
		(count % 100 < 10 || count % 100 >= 20)
	) {
		return 'материала';
	}
	return 'материалов';
}

export async function loadBlogListContext(): Promise<BlogListContext> {
	const cards = (await loadBlogCards()).filter((card) => card.posts.length > 0);
	const posts = cards.flatMap((card) => card.posts);
	const allDestinations = [
		...new Set(
			posts
				.map((p) => p.data.destination)
				.filter((d): d is string => Boolean(d)),
		),
	].sort();
	const totalCount = posts.length;

	return {
		cards,
		allDestinations,
		totalCount,
		materialsWord: materialsWordFor(totalCount),
	};
}

export async function prepareBlogListViewModel(siteOrigin: string) {
	const ctx = await loadBlogListContext();
	const blogIndexUrl = new URL(siteBlogIndex(), `${siteOrigin}/`).href;

	return {
		...ctx,
		pageUrl: blogIndexUrl,
		blogIndexUrl,
		blogBreadcrumbSchema: buildBlogIndexSchemaGraph({
			baseUrl: `${siteOrigin.replace(/\/$/, '')}/`,
			blogIndexUrl,
			name: 'Журнал о путешествиях ANRO TRIP',
			description:
				'Вдохновляющие идеи, советы экспертов и путеводители по лучшим направлениям от команды ANRO TRIP.',
			numberOfItems: ctx.totalCount,
		}),
	};
}
