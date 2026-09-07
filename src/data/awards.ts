/**
 * Награды и сертификаты ANRO TRIP (Awards.astro).
 */
import type { ImageMetadata } from 'astro';

import clickvoyageAward from '../assets/awards/clickvoyage.webp';
import leftAward from '../assets/awards/maestro.webp';
import maxxVoyage01 from '../assets/awards/maxx-voyage/01.webp';
import maxxVoyage02 from '../assets/awards/maxx-voyage/02.webp';
import maxxVoyage03 from '../assets/awards/maxx-voyage/03.webp';
import maxxVoyage04 from '../assets/awards/maxx-voyage/04.webp';
import maxxVoyage05 from '../assets/awards/maxx-voyage/05.webp';
import maxxVoyage06 from '../assets/awards/maxx-voyage/06.webp';
import maxxVoyage07 from '../assets/awards/maxx-voyage/07.webp';
import maxxVoyage08 from '../assets/awards/maxx-voyage/08.webp';
import maxxVoyage09 from '../assets/awards/maxx-voyage/09.webp';
import maxxVoyage10 from '../assets/awards/maxx-voyage/10.webp';
import maxxVoyage11 from '../assets/awards/maxx-voyage/11.webp';
import maxxVoyage12 from '../assets/awards/maxx-voyage/12.webp';
import rightAward from '../assets/awards/phaselis.webp';

export interface AwardResult {
	place: string;
	geo: string;
}

export interface AwardCard {
	title: string;
	image: ImageMetadata;
	rank: string;
	accent: string;
	description: string;
	results: AwardResult[];
	footnote?: string;
	partnerNote?: string;
}

export interface MaxxAwardGallery {
	title: string;
	cardImage: ImageMetadata;
	images: ImageMetadata[];
	cardRank: string;
	ribbonRank: string;
	accent: string;
	description: string;
	results: AwardResult[];
	partnerNote: string;
}

const maxxVoyageImages = [
	maxxVoyage01,
	maxxVoyage02,
	maxxVoyage03,
	maxxVoyage04,
	maxxVoyage05,
	maxxVoyage06,
	maxxVoyage07,
	maxxVoyage08,
	maxxVoyage09,
	maxxVoyage10,
	maxxVoyage11,
	maxxVoyage12,
];

export const maxxAward: MaxxAwardGallery = {
	title: 'MAXX ROYAL и VOYAGE Hotels',
	cardImage: maxxVoyage04,
	images: maxxVoyageImages,
	cardRank: 'Топ продаж',
	ribbonRank: 'Лучшие из лучших',
	accent: 'bg-primary',
	description:
		'Сеть отелей VOYAGE Hotels неоднократно отмечала нас на своих церемониях, как лидеров продаж:',
	results: [
		{ place: '2020', geo: 'TOP Seller Agency' },
		{ place: '2023', geo: 'TOP Seller Agency' },
	],
	partnerNote:
		'По итогам 2024 года на церемонии MAXX ROYAL ANRO TRIP заняли 2 место по УрФО. Первое участие в церемонии —<br />и сразу такая высокая награда!',
};

export const awards: AwardCard[] = [
	{
		title: '«Маэстро путешествий»',
		image: leftAward,
		rank: 'Партнер холдинга',
		accent: 'bg-red',
		description:
			'Наша компания ANRO TRIP уже три раза была участницей премии «Маэстро путешествий» от холдинга «Русский Экспресс»:',
		results: [
			{ place: '2023 год', geo: '20 место*' },
			{ place: '2024 год', geo: '1 место по УрФО' },
			{ place: '2025 год', geo: '7 место*' },
		],
		footnote:
			'* рейтинг по регионам России (все субъекты, кроме Москвы и Санкт-Петербурга) среди 14 000 агентств',
		partnerNote:
			'Также имеем высший статус сотрудничества с холдингом — Партнёр Русского Экспресса.',
	},
	{
		title: maxxAward.title,
		image: maxxAward.cardImage,
		rank: maxxAward.cardRank,
		accent: maxxAward.accent,
		description: maxxAward.description,
		results: maxxAward.results,
		partnerNote: maxxAward.partnerNote,
	},
	{
		title: 'NG PHASELIS BAY',
		image: rightAward,
		rank: '4 года Best Seller',
		accent: 'bg-gray-400',
		description:
			'С 2022 года ежегодно становимся участниками церемонии награждения SEE.FEEL.LOVE в отеле NG PHASELIS BAY:',
		results: [
			{ place: '2022', geo: 'Best Seller' },
			{ place: '2023', geo: 'Best Seller' },
			{ place: '2024', geo: 'Best Seller' },
			{ place: '2025', geo: 'Best Seller' },
		],
	},
	{
		title: 'CLICKVOYAGE',
		image: clickvoyageAward,
		rank: 'Лидер продаж',
		accent: 'bg-primary',
		description:
			'По итогам сезона 2025/26 ANRO TRIP стала единственной компанией из Челябинска и Екатеринбурга, которая приняла участие в церемонии награждения лидеров туроператора ClickVoyage в Москве и получила награду:',
		results: [{ place: '2026', geo: 'Лидер продаж премиальных туров' }],
	},
];
