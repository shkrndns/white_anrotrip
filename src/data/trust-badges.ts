/**
 * Бейджи доверия в секции «О нас» (TrustBadges.astro).
 */
import { siteHome } from '../lib/site-urls';

export interface TrustBadge {
	icon: 'shield' | 'shield-check' | 'iata' | 'tkp' | 'calendar' | 'headset';
	label: string;
	value: string;
	href: string;
	external?: boolean;
}

export const trustBadges: TrustBadge[] = [
	{
		icon: 'shield',
		label: 'Туроператор',
		value: 'РТО 022708',
		href: 'https://www.economy.gov.ru/material/directions/turizm/reestry_turizm/edinyy_federalnyy_reestr_turoperatorov/',
		external: true,
	},
	{
		icon: 'shield-check',
		label: 'Турагент',
		value: 'РТА 0024615',
		href: 'https://ev.economy.gov.ru/lk_exp/registry/',
		external: true,
	},
	{
		icon: 'iata',
		label: 'Аккредитация',
		value: 'IATA',
		href: 'https://www.iata.org/',
		external: true,
	},
	{
		icon: 'tkp',
		label: 'Аккредитация',
		value: 'ТКП',
		href: 'https://www.tch.ru/',
		external: true,
	},
	{
		icon: 'calendar',
		label: 'Опыт',
		value: '19 лет опыта',
		href: `${siteHome()}#about`,
	},
	{
		icon: 'headset',
		label: 'Сервис',
		value: 'Личный ассистент',
		href: `${siteHome()}#about`,
	},
];
