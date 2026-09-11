/** Четыре карточки журнала — группы статей по датам. */
export const BLOG_CARD_IDS = [
	'september',
	'september-start',
	'late-august',
	'aviation-events',
] as const;

export type BlogCardId = (typeof BLOG_CARD_IDS)[number];

export interface BlogCardMeta {
	id: BlogCardId;
	title: string;
	description: string;
	period: string;
}

export const BLOG_CARDS: readonly BlogCardMeta[] = [
	{
		id: 'september',
		title: '2–4 сентября 2026',
		description:
			'Концерт ANNA ASTI в Шарме, авиасообщение и групповые выезды школьников.',
		period: '2–4 сентября',
	},
	{
		id: 'september-start',
		title: '1 сентября 2026',
		description:
			'Emirates на Маврикий, больше рейсов в Санкт-Петербург и правила въезда в Таиланд.',
		period: '1 сентября',
	},
	{
		id: 'late-august',
		title: '27–31 августа 2026',
		description: 'Итоги лета, Мальдивы, визы в Японию и сроки виз в Италию.',
		period: '27–31 августа',
	},
	{
		id: 'aviation-events',
		title: 'Авиасервис и события',
		description:
			'Авиакасса ANRO TRIP, осенние концерты и Formula 1 в Абу-Даби.',
		period: 'Март — август',
	},
];

export function isBlogCardId(value: string): value is BlogCardId {
	return (BLOG_CARD_IDS as readonly string[]).includes(value);
}

export function getBlogCardMeta(id: string): BlogCardMeta | undefined {
	return BLOG_CARDS.find((card) => card.id === id);
}
