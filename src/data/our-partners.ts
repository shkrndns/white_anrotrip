/**
 * Туроператоры и партнёры — логотипы в секции «Сотрудничество» (OurPartners.astro).
 */
import type { ImageMetadata } from 'astro';

import anexTourLogo from '../assets/our-partners/anex-tour.webp';
import funSunLogo from '../assets/our-partners/fun-sun.webp';
import gkpLogo from '../assets/our-partners/gkp.webp';

export interface TourOperatorPartner {
	name: string;
	logo: ImageMetadata;
}

export const tourOperatorPartners: TourOperatorPartner[] = [
	{ name: 'ГКП', logo: gkpLogo },
	{ name: 'FUN&SUN', logo: funSunLogo },
	{ name: 'Anex Tour', logo: anexTourLogo },
];
