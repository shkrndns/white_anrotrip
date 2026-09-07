import { company } from './company';

export type SocialIcon = 'tg' | 'max' | 'vk';

export interface SocialLink {
	href: string;
	ariaLabel: string;
	tooltip: string;
	tooltipTextClass: string;
	hover: string;
	ring: string;
	icon: SocialIcon;
	caption: string;
	captionColor: string;
}

/** Соцсети для Footer и FooterMinimal (порядок согласован с OfficeWidget). */
export const footerSocialLinks: SocialLink[] = [
	{
		href: company.social.telegram,
		ariaLabel: 'Telegram — Новости',
		tooltip: 'Telegram',
		tooltipTextClass: 'text-sky-400',
		hover: 'hover:bg-sky-500/20 hover:text-sky-400',
		ring: 'focus-visible:ring-primary',
		icon: 'tg',
		caption: 'Новости',
		captionColor: 'text-platform-telegram',
	},
	{
		href: company.social.maxBiz,
		ariaLabel: 'MAX — Новости',
		tooltip: 'MAX · Новости',
		tooltipTextClass: 'text-violet-300',
		hover: 'hover:bg-violet-500/20 hover:text-violet-300',
		ring: 'focus-visible:ring-violet-400',
		icon: 'max',
		caption: 'Новости',
		captionColor: 'text-platform-max',
	},
	{
		href: company.social.telegramChannel,
		ariaLabel: 'Telegram — Наш чат',
		tooltip: 'Telegram · Чат',
		tooltipTextClass: 'text-cyan-300',
		hover: 'hover:bg-cyan-500/20 hover:text-cyan-300',
		ring: 'focus-visible:ring-primary',
		icon: 'tg',
		caption: 'Наш чат',
		captionColor: 'text-platform-telegram-chat',
	},
	{
		href: company.social.vk,
		ariaLabel: 'ВКонтакте',
		tooltip: 'ВКонтакте',
		tooltipTextClass: 'text-[#0077FF]',
		hover: 'hover:bg-[#0077FF]/15 hover:text-[#0077FF]',
		ring: 'focus-visible:ring-[#0077FF]',
		icon: 'vk',
		caption: 'ВКонтакте',
		captionColor: 'text-platform-vk-light',
	},
	{
		href: company.social.maxChannel,
		ariaLabel: 'MAX — Канал',
		tooltip: 'MAX · Канал',
		tooltipTextClass: 'text-purple-300',
		hover: 'hover:bg-[#5b21b6]/30 hover:text-purple-300',
		ring: 'focus-visible:ring-purple-400',
		icon: 'max',
		caption: 'Канал',
		captionColor: 'text-platform-max-channel',
	},
];
