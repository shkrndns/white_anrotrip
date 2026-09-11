/**
 * Schema.org BreadcrumbList для legal-страниц.
 */

export interface LegalBreadcrumbInput {
	baseUrl: string;
	pageTitle: string;
	pageUrl: string;
}

export function buildLegalBreadcrumbSchema(input: LegalBreadcrumbInput) {
	const homeUrl = input.baseUrl.replace(/\/$/, '') || input.baseUrl;

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Главная',
				item: homeUrl,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: input.pageTitle,
				item: input.pageUrl,
			},
		],
	};
}
