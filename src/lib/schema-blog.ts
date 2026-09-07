/**
 * Schema.org JSON-LD для блога: BlogPosting и BreadcrumbList.
 */

export interface BlogPostingInput {
	baseUrl: string;
	postUrl: string;
	headline: string;
	description: string;
	datePublished: Date;
	dateModified?: Date;
	authorName: string;
	imageUrl: string;
}

export interface BlogBreadcrumbInput {
	baseUrl: string;
	blogIndexUrl: string;
	/** Третий уровень (статья). Если не задан — только «Главная → Журнал». */
	postTitle?: string;
	postUrl?: string;
}

function organizationPublisher(baseUrl: string) {
	const organizationId = `${baseUrl.replace(/\/$/, '')}/#organization`;
	return {
		'@type': 'Organization',
		'@id': organizationId,
		name: 'ANRO TRIP',
		logo: {
			'@type': 'ImageObject',
			url: `${baseUrl.replace(/\/$/, '')}/og-image.jpg`,
		},
	};
}

export function buildBlogPostingSchema(input: BlogPostingInput) {
	const modified = input.dateModified ?? input.datePublished;

	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${input.postUrl}#blogpost`,
		headline: input.headline,
		description: input.description,
		datePublished: input.datePublished.toISOString(),
		dateModified: modified.toISOString(),
		author: {
			'@type': 'Organization',
			name: input.authorName,
			url: input.baseUrl.replace(/\/$/, ''),
		},
		publisher: organizationPublisher(input.baseUrl),
		image: [input.imageUrl],
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': input.postUrl,
		},
		inLanguage: 'ru-RU',
	};
}

export function buildBlogBreadcrumbSchema(input: BlogBreadcrumbInput) {
	const homeUrl = input.baseUrl.replace(/\/$/, '') || input.baseUrl;

	const items: Record<string, unknown>[] = [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Главная',
			item: homeUrl,
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: 'Журнал',
			item: input.blogIndexUrl,
		},
	];

	if (input.postTitle && input.postUrl) {
		items.push({
			'@type': 'ListItem',
			position: 3,
			name: input.postTitle,
			item: input.postUrl,
		});
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items,
	};
}

export function buildBlogPostSchemaGraph(input: BlogPostingInput) {
	const blogIndexUrl = `${input.baseUrl.replace(/\/$/, '')}/blog`;

	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBlogPostingSchema(input),
			buildBlogBreadcrumbSchema({
				baseUrl: input.baseUrl,
				blogIndexUrl: blogIndexUrl,
				postTitle: input.headline,
				postUrl: input.postUrl,
			}),
		],
	};
}
