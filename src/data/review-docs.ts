/**
 * Сканированные отзывы клиентов — документы в карусели Reviews.astro.
 */
import type { ImageMetadata } from 'astro';

import molodezhImg from '../assets/reviews/molodezh.webp';
import niagaraImg from '../assets/reviews/niagara.webp';
import mercedesImg from '../assets/reviews/mercedes.webp';
import niksImg from '../assets/reviews/niks.webp';
import usmanovaImg from '../assets/reviews/usmanova.webp';
import napoleonImg from '../assets/reviews/napoleon.webp';
import r1projectImg from '../assets/reviews/r1project.webp';
import uralniiImg from '../assets/reviews/uralnii.webp';

export interface ReviewDoc {
	id: number;
	title: string;
	image: ImageMetadata;
}

export const reviewDocs: ReviewDoc[] = [
	{ id: 1, title: '"МОЛОДЕЖЬ ЮЖНОГО УРАЛА"', image: molodezhImg },
	{ id: 2, title: '"Ниагара"', image: niagaraImg },
	{ id: 3, title: '"ОМЕГА Mercedes Benz"', image: mercedesImg },
	{ id: 4, title: '"НИКС"', image: niksImg },
	{ id: 5, title: '"Аня Усманова"', image: usmanovaImg },
	{ id: 6, title: '"Napoleon IT"', image: napoleonImg },
	{ id: 7, title: '"Проектное бюро R1"', image: r1projectImg },
	{ id: 8, title: '"Урал НИИ СТРОМ"', image: uralniiImg },
];
