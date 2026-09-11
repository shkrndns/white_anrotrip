/**
 * Партнёры секции «Сотрудничество» (OurPartners.astro).
 * Верхний ряд — авиакомпании (порядок по нумерации файлов).
 * Нижний ряд — туроператоры (слоты 1…12 по нумерации файлов).
 */
import type { ImageMetadata } from 'astro';

import aeroflotLogo from '../assets/our-partners/airlines/aeroflot.webp';
import azalLogo from '../assets/our-partners/airlines/azal.webp';
import chinaEasternLogo from '../assets/our-partners/airlines/china-eastern.webp';
import emiratesLogo from '../assets/our-partners/airlines/emirates.webp';
import flydubaiLogo from '../assets/our-partners/airlines/flydubai.webp';
import iataLogo from '../assets/our-partners/airlines/iata.webp';
import s7Logo from '../assets/our-partners/airlines/s7.webp';
import tkpLogo from '../assets/our-partners/airlines/tkp.webp';
import turkishAirlinesLogo from '../assets/our-partners/airlines/turkish-airlines.webp';
import uralAirlinesLogo from '../assets/our-partners/airlines/ural-airlines.webp';
import aLaCarteLogo from '../assets/our-partners/tour-operators/a-la-carte.webp';
import anexTourLogo from '../assets/our-partners/tour-operators/anex-tour.webp';
import biblioGlobusLogo from '../assets/our-partners/tour-operators/biblio-globus.webp';
import clickVoyageLogo from '../assets/our-partners/tour-operators/click-voyage.webp';
import clubMedLogo from '../assets/our-partners/tour-operators/club-med.webp';
import coralLogo from '../assets/our-partners/tour-operators/coral.webp';
import funSunLogo from '../assets/our-partners/tour-operators/fun-sun.webp';
import lotiLogo from '../assets/our-partners/tour-operators/loti.webp';
import pacLogo from '../assets/our-partners/tour-operators/pac.webp';
import pegasLogo from '../assets/our-partners/tour-operators/pegas.webp';
import russianExpressLogo from '../assets/our-partners/tour-operators/russian-express.webp';
import volgaDreamLogo from '../assets/our-partners/tour-operators/volga-dream.webp';

export type PartnerCategory = 'airline' | 'tour-operator' | 'association';

export interface PartnerLogo {
	name: string;
	logo: ImageMetadata;
	category: PartnerCategory;
	/** Переопределение alt (если не задан — собирается из category + name) */
	alt?: string;
	/** Масштаб внутри карточки (>1 — крупнее, обрезается overflow-hidden) */
	logoScale?: number;
	/** Размер через Tailwind (широкие логотипы — надёжнее scale) */
	logoClass?: string;
}

/** Alt для SEO и доступности — один раз на партнёра (не в дублях marquee) */
export function partnerLogoAlt(partner: PartnerLogo): string {
	if (partner.alt) return partner.alt;

	switch (partner.category) {
		case 'airline':
			return `Логотип авиакомпании ${partner.name} — партнёр ANRO TRIP`;
		case 'tour-operator':
			return `Логотип туроператора ${partner.name} — партнёр ANRO TRIP`;
		case 'association':
			return `Логотип ${partner.name} — партнёр ANRO TRIP`;
	}
}

/** Верхний ряд marquee — 1…10 по именам файлов в Лого_авиакомпаний */
export const airlinePartners: PartnerLogo[] = [
	{ name: 'IATA', logo: iataLogo, category: 'association' },
	{ name: 'ТКП', logo: tkpLogo, category: 'association' },
	{
		name: 'Аэрофлот',
		logo: aeroflotLogo,
		category: 'airline',
		logoScale: 1.35,
	},
	{ name: 'S7 Airlines', logo: s7Logo, category: 'airline' },
	{
		name: 'Ural Airlines',
		logo: uralAirlinesLogo,
		category: 'airline',
		logoScale: 1.12,
	},
	{ name: 'Emirates', logo: emiratesLogo, category: 'airline' },
	{
		name: 'flydubai',
		logo: flydubaiLogo,
		category: 'airline',
		logoScale: 1.22,
	},
	{
		name: 'Turkish Airlines',
		logo: turkishAirlinesLogo,
		category: 'airline',
		logoScale: 1.18,
	},
	{
		name: 'China Eastern',
		logo: chinaEasternLogo,
		category: 'airline',
		logoScale: 1.0,
	},
	{ name: 'AZAL', logo: azalLogo, category: 'airline', logoScale: 1.28 },
];

/** Нижний ряд — 12 слотов (1…12) по Logo_turoperators */
export const tourOperatorRow: PartnerLogo[] = [
	{
		name: 'Русский Экспресс',
		logo: russianExpressLogo,
		category: 'tour-operator',
	},
	{
		name: 'Click Voyage',
		logo: clickVoyageLogo,
		category: 'tour-operator',
		logoScale: 1.24,
	},
	{ name: 'A la carte', logo: aLaCarteLogo, category: 'tour-operator' },
	{ name: 'LOTi', logo: lotiLogo, category: 'tour-operator' },
	{ name: 'CORAL Travel', logo: coralLogo, category: 'tour-operator' },
	{ name: 'Anex Tour', logo: anexTourLogo, category: 'tour-operator' },
	{ name: 'PAC Group', logo: pacLogo, category: 'tour-operator' },
	{ name: 'FUN&SUN', logo: funSunLogo, category: 'tour-operator' },
	{ name: 'Pegas Touristik', logo: pegasLogo, category: 'tour-operator' },
	{ name: 'Библио Глобус', logo: biblioGlobusLogo, category: 'tour-operator' },
	{ name: 'Club Med', logo: clubMedLogo, category: 'tour-operator' },
	{ name: 'Волга Dream', logo: volgaDreamLogo, category: 'tour-operator' },
];

/** Все партнёры секции — для SEO-разметки и скрытого индекса */
export const cooperationPartners: PartnerLogo[] = [
	...airlinePartners,
	...tourOperatorRow,
];
