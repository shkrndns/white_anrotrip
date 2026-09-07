/**
 * Пилюли и бейдж услуг в Hero-секции главной страницы.
 */

export interface HeroStatPill {
	val: string;
	label: string;
	href: string;
	ariaLabel: string;
	footnote?: boolean;
	/** Пустая пилюля-заглушка (пока без текста) */
	placeholder?: boolean;
}

export const heroStatPills: HeroStatPill[] = [
	{
		val: '19 ЛЕТ',
		label: 'ОПЫТА',
		href: '#partners',
		ariaLabel: 'Перейти к разделу «Нам доверяют»',
	},
	{
		val: 'ЛИЧНЫЙ',
		label: 'АССИСТЕНТ',
		href: '#business',
		ariaLabel: 'Перейти к разделу «Наши услуги»',
	},
	{
		val: '24/7',
		label: 'ПОДДЕРЖКА',
		href: '#about',
		ariaLabel: 'Перейти к разделу «О нас»',
	},
];

export const heroServiceLabels = [
	'Авиабилеты',
	'Туры',
	'Отели',
	'Визовая поддержка',
	'Трансферы',
	'Страхование',
] as const;
