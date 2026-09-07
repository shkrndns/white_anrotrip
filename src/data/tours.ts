/**
 * Карточки популярных туров на главной (PopularTours.astro).
 */
import type { ImageMetadata } from 'astro';

import antalyaImg from '../assets/tours/antalya.webp';
import thailandImg from '../assets/tours/thailand.webp';
import egyptImg from '../assets/tours/egypt.webp';
import vietnamImg from '../assets/tours/vietnam.webp';

export interface TourCard {
	title: string;
	price: string;
	image: ImageMetadata;
	size: 'tall' | 'wide' | 'normal' | 'large';
	badge: string;
	badgeClass: string;
	tvCountry: string;
}

export const tours: TourCard[] = [
	{
		title: 'Турция, Анталья',
		price: 'от 85 000 ₽',
		image: antalyaImg,
		size: 'tall',
		badge: 'Хит продаж',
		badgeClass: 'bg-red text-white',
		tvCountry: 'Турция',
	},
	{
		title: 'Таиланд, Пхукет',
		price: 'от 115 000 ₽',
		image: thailandImg,
		size: 'wide',
		badge: 'Расслабление',
		badgeClass: 'bg-primary text-white',
		tvCountry: 'Таиланд',
	},
	{
		title: 'Египет, Шарм',
		price: 'от 105 000 ₽',
		image: egyptImg,
		size: 'normal',
		badge: 'Всё включено',
		badgeClass: 'bg-gray-400 text-white',
		tvCountry: 'Египет',
	},
	{
		title: 'Вьетнам, Нячанг',
		price: 'от 125 000 ₽',
		image: vietnamImg,
		size: 'normal',
		badge: 'Пляжный отдых',
		badgeClass: 'bg-white text-gray-900 border border-white/70',
		tvCountry: 'Вьетнам',
	},
];
