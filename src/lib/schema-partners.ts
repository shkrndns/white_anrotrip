/**
 * Schema.org ItemList для секции «Сотрудничество» (OurPartners).
 */
import type { PartnerLogo } from '../data/our-partners';

export function buildCooperationPartnersSchema(
	baseUrl: string,
	partners: PartnerLogo[],
) {
	const origin = baseUrl.replace(/\/$/, '');

	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'@id': `${origin}/#cooperation-partners`,
		name: 'Партнёры ANRO TRIP',
		description:
			'Авиакомпании, ассоциации и туроператоры, с которыми сотрудничает туристическое агентство ANRO TRIP.',
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
