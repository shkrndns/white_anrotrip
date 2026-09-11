/**
 * Корпоративные клиенты — логотипы в секции «Нам доверяют» (Partners.astro).
 */
import type { ImageMetadata } from 'astro';

import chelbasketImg from '../assets/partners/chelbasket.webp';
import fedBoxaImg from '../assets/partners/fed-boxa.webp';
import napoleonImg from '../assets/partners/napoleon.webp';
import niagaraImg from '../assets/partners/niagara.webp';
import niksImg from '../assets/partners/niks.webp';
import r1projectImg from '../assets/partners/r1project.webp';
import redpepperImg from '../assets/partners/redpepper.webp';
import studylandImg from '../assets/partners/studyland.webp';
import unisteamImg from '../assets/partners/unisteam.webp';
import uralImg from '../assets/partners/ural.webp';

export interface ClientPartner {
	name: string;
	logo: ImageMetadata;
	/** Масштаб внутри карточки (>1 — крупнее) */
	logoScale?: number;
}

/** Alt для SEO-индекса (один раз на клиента, не в дублях marquee) */
export function clientPartnerLogoAlt(partner: ClientPartner): string {
	return `Логотип компании ${partner.name} — клиент ANRO TRIP`;
}

export const clientPartners: ClientPartner[] = [
	{ name: 'Napoleon IT', logo: napoleonImg },
	{ name: 'R1 Проектное бюро', logo: r1projectImg },
	{ name: 'Ниагара', logo: niagaraImg },
	{ name: 'НИКС', logo: niksImg },
	{ name: 'Unisteam', logo: unisteamImg },
	{ name: 'Red Pepper Film', logo: redpepperImg },
	{ name: 'Челбаскет', logo: chelbasketImg },
	{ name: 'Study Land', logo: studylandImg },
	{ name: 'Санаторий Урал', logo: uralImg },
	{ name: 'Федерация бокса', logo: fedBoxaImg },
];
