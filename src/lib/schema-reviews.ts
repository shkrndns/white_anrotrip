/**
 * Schema.org для отзывов на внешних площадках (без Review markup — только ссылки).
 */
import { twoGisReviewsUrl, yandexReviewsUrl } from './external-reviews';

export function buildReviewPlatformsSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Отзывы о ANRO TRIP на внешних площадках',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				item: {
					'@type': 'WebPage',
					name: 'Отзывы ANRO TRIP на Яндекс Картах',
					url: yandexReviewsUrl,
				},
			},
			{
				'@type': 'ListItem',
				position: 2,
				item: {
					'@type': 'WebPage',
					name: 'Отзывы ANRO TRIP в 2ГИС',
					url: twoGisReviewsUrl,
				},
			},
		],
	};
}
