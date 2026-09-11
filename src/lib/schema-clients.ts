/**
 * Schema.org ItemList для секции «Нам доверяют» (Partners.astro).
 */
import type { ClientPartner } from '../data/partners';

export function buildClientPartnersSchema(
	baseUrl: string,
	partners: ClientPartner[],
) {
	const origin = baseUrl.replace(/\/$/, '');

	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'@id': `${origin}/#client-partners`,
		name: 'Корпоративные клиенты ANRO TRIP',
		description:
			'Компании, которые доверяют ANRO TRIP организацию командировок и деловых поездок.',
		numberOfItems: partners.length,
		itemListElement: partners.map((partner, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'Organization',
				name: partner.name,
			},
		})),
	};
}
