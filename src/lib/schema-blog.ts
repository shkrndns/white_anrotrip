/**
 * Schema.org JSON-LD для блога: BlogPosting, BreadcrumbList, CollectionPage.
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

export interface BlogCardSchemaInput {
	baseUrl: string;
	cardTitle: string;
	cardUrl: string;
	blogIndexUrl: string;
	articles: BlogPostingInput[];
}

export interface BlogCollectionInput {
	baseUrl: string;
	blogIndexUrl: string;
	name: string;
	description: string;
	numberOfItems: number;
}

const OG_IMAGE_PATH = '/og-image.png';

function organizationPublisher(baseUrl: string) {
	const origin = baseUrl.replace(/\/$/, '');
	const organizationId = `${origin}/#organization`;
	return {
		'@type': 'Organization',
		'@id': organizationId,
		name: 'ANRO TRIP',
		logo: {
			'@type': 'ImageObject',
			url: `${origin}${OG_IMAGE_PATH}`,
		},
	};
}

export function buildBlogPostingSchema(input: BlogPostingInput) {
	const modified = input.dateModified ?? input.datePublished;

	return {
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
		'@type': 'BreadcrumbList',
		itemListElement: items,
	};
}

export function buildBlogCollectionPageSchema(input: BlogCollectionInput) {
	const origin = input.baseUrl.replace(/\/$/, '');

	return {
		'@type': 'CollectionPage',
		'@id': `${input.blogIndexUrl}#collection`,
		url: input.blogIndexUrl,
		name: input.name,
		description: input.description,
		inLanguage: 'ru-RU',
		isPartOf: {
			'@type': 'WebSite',
			'@id': `${origin}/#website`,
		},
		numberOfItems: input.numberOfItems,
	};
}

export function buildBlogCardSchemaGraph(input: BlogCardSchemaInput) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBlogBreadcrumbSchema({
				baseUrl: input.baseUrl,
				blogIndexUrl: input.blogIndexUrl,
				postTitle: input.cardTitle,
				postUrl: input.cardUrl,
			}),
			...input.articles.map((article) => buildBlogPostingSchema(article)),
		],
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

export function buildBlogIndexSchemaGraph(input: BlogCollectionInput) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBlogBreadcrumbSchema({
				baseUrl: input.baseUrl,
				blogIndexUrl: input.blogIndexUrl,
			}),
			buildBlogCollectionPageSchema(input),
		],
	};
}
