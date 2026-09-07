import { getCollection, type CollectionEntry } from 'astro:content';
import { buildBlogBreadcrumbSchema } from './schema-blog';
import { formatBlogTitleHtml, typografText } from './typograf';
import { siteBlogIndex } from './site-urls';

const PAGE_SIZE = 6;

export type BlogListPage = {
	data: CollectionEntry<'blog'>[];
	currentPage: number;
	lastPage: number;
	total: number;
	url: {
		prev?: string;
		next?: string;
	};
};

export type BlogListContext = {
	page: BlogListPage;
	featuredPost: CollectionEntry<'blog'> | null;
	allDestinations: string[];
	totalCount: number;
	materialsWord: string;
};

function blogPagePath(page: number): string {
	const base = siteBlogIndex().replace(/\/$/, '') || '/blog';
	if (page <= 1) return base;
	return `${base}/page/${page}`;
}

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

/** SSR-список журнала (замена astro paginate + getStaticPaths). */
export async function loadBlogListContext(
	requestedPage: number,
): Promise<BlogListContext | null> {
	const allPosts = await getCollection('blog', ({ data }) => !data.draft);
	const sortedPosts = allPosts.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	const featuredPost =
		sortedPosts.find((p) => p.data.featured === true) ?? null;
	const postsForGrid = featuredPost
		? sortedPosts.filter((p) => p.id !== featuredPost.id)
		: sortedPosts;

	const lastPage = Math.max(1, Math.ceil(postsForGrid.length / PAGE_SIZE));
	if (requestedPage < 1 || requestedPage > lastPage) return null;

	const start = (requestedPage - 1) * PAGE_SIZE;
	const page: BlogListPage = {
		data: postsForGrid.slice(start, start + PAGE_SIZE),
		currentPage: requestedPage,
		lastPage,
		total: postsForGrid.length,
		url: {
			prev: requestedPage > 1 ? blogPagePath(requestedPage - 1) : undefined,
			next:
				requestedPage < lastPage ? blogPagePath(requestedPage + 1) : undefined,
		},
	};

	const allDestinations = [
		...new Set(
			allPosts
				.map((p) => p.data.destination)
				.filter((d): d is string => Boolean(d)),
		),
	].sort();

	const totalCount = page.total + (featuredPost ? 1 : 0);

	return {
		page,
		featuredPost,
		allDestinations,
		totalCount,
		materialsWord: materialsWordFor(totalCount),
	};
}

/** Данные для шаблона списка журнала (index + /blog/N). */
export async function prepareBlogListViewModel(
	requestedPage: number,
	siteOrigin: string,
) {
	const ctx = await loadBlogListContext(requestedPage);
	if (!ctx) return null;

	const { featuredPost } = ctx;
	const pagePath = blogPagePath(requestedPage);
	const pageUrl = new URL(pagePath, `${siteOrigin}/`).href;
	const blogIndexUrl = new URL(siteBlogIndex(), `${siteOrigin}/`).href;
	const originBase = `${siteOrigin.replace(/\/$/, '')}/`;

	return {
		...ctx,
		pageUrl,
		prevUrl: ctx.page.url.prev
			? new URL(ctx.page.url.prev, originBase).href
			: undefined,
		nextUrl: ctx.page.url.next
			? new URL(ctx.page.url.next, originBase).href
			: undefined,
		featuredTitle: featuredPost ? typografText(featuredPost.data.title) : '',
		featuredTitleHtml: featuredPost
			? formatBlogTitleHtml(featuredPost.data.title)
			: '',
		featuredDescription: featuredPost
			? typografText(featuredPost.data.description)
			: '',
		blogIndexUrl,
		blogBreadcrumbSchema: buildBlogBreadcrumbSchema({
			baseUrl: `${siteOrigin.replace(/\/$/, '')}/`,
			blogIndexUrl,
		}),
	};
}
