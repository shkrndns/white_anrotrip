/**
 * Корпоративные клиенты — логотипы в секции «Нам доверяют» (Partners.astro).
 */
import type { ImageMetadata } from 'astro';

import chelbasketImg from '../assets/partners/chelbasket.webp';
import ferrosplavImg from '../assets/partners/ferrosplav.webp';
import inrostImg from '../assets/partners/inrost.webp';
import mercedesImg from '../assets/partners/mercedes.webp';
import napoleonImg from '../assets/partners/napoleon.webp';
import niagaraImg from '../assets/partners/niagara.webp';
import niksImg from '../assets/partners/niks.webp';
import r1projectImg from '../assets/partners/r1project.webp';
import redpepperImg from '../assets/partners/redpepper.webp';
import unisteamImg from '../assets/partners/unisteam.webp';

export interface ClientPartner {
	name: string;
	logo: ImageMetadata;
}

export const clientPartners: ClientPartner[] = [
	{ name: 'Napoleon IT', logo: napoleonImg },
	{ name: 'R1 Проектное бюро', logo: r1projectImg },
	{ name: 'Ниагара', logo: niagaraImg },
	{ name: 'НИКС', logo: niksImg },
	{ name: 'Mercedes Benz', logo: mercedesImg },
	{ name: 'Ферросплав', logo: ferrosplavImg },
	{ name: 'Unisteam', logo: unisteamImg },
	{ name: 'Red Pepper Film', logo: redpepperImg },
	{ name: 'Инрост', logo: inrostImg },
	{ name: 'Челбаскет', logo: chelbasketImg },
];
