/**
 * Иконки мобильного меню: Iconify fa6-solid + цвет кружка.
 * Размер задаётся в Header через text-* на FaIcon (1em).
 *
 * default — палитра главной: primary / secondary / red из @theme.
 * *-corp — деловой стиль: slate/gray + сбалансированные акценты primary / primary-dark.
 */
export interface MobileNavIconDef {
	box: string;
	icon: string;
	/** Tailwind-класс цвета иконки */
	color: string;
}

const fallback: MobileNavIconDef = {
	box: 'bg-gray-100',
	color: 'text-gray-600',
	icon: 'fa6-solid:link',
};

const map: Record<string, MobileNavIconDef> = {
	/* ─── Главная (default) — бренд ANRO TRIP ─── */
	Авиабилеты: {
		box: 'bg-primary-light/12',
		color: 'text-primary',
		icon: 'fa6-solid:plane-departure',
	},
	Туры: {
		box: 'bg-primary/12',
		color: 'text-primary',
		icon: 'fa6-solid:globe',
	},
	Журнал: {
		box: 'bg-secondary/10',
		color: 'text-secondary',
		icon: 'fa6-solid:newspaper',
	},
	Блог: {
		box: 'bg-secondary/10',
		color: 'text-secondary',
		icon: 'fa6-solid:newspaper',
	},
	'О компании': {
		box: 'bg-primary/10',
		color: 'text-primary-dark',
		icon: 'fa6-solid:building',
	},
	Доверие: {
		box: 'bg-secondary/10',
		color: 'text-secondary',
		icon: 'fa6-solid:shield-halved',
	},
	'О нас': {
		box: 'bg-primary/10',
		color: 'text-primary-dark',
		icon: 'fa6-solid:circle-info',
	},
	'Наши услуги': {
		box: 'bg-secondary/12',
		color: 'text-secondary',
		icon: 'fa6-solid:list-check',
	},
	Направления: {
		box: 'bg-primary-light/12',
		color: 'text-primary',
		icon: 'fa6-solid:arrow-trend-up',
	},
	'Направления работы': {
		box: 'bg-primary-light/12',
		color: 'text-primary',
		icon: 'fa6-solid:arrow-trend-up',
	},
	'Для бизнеса': {
		box: 'bg-secondary/12',
		color: 'text-secondary',
		icon: 'fa6-solid:briefcase',
	},
	Партнеры: {
		box: 'bg-primary/12',
		color: 'text-primary',
		icon: 'fa6-solid:handshake',
	},
	'Наши клиенты': {
		box: 'bg-primary/12',
		color: 'text-primary',
		icon: 'fa6-solid:handshake',
	},
	Отзывы: {
		box: 'bg-primary-light/14',
		color: 'text-primary-dark',
		icon: 'fa6-solid:star',
	},
	Сотрудничество: {
		box: 'bg-secondary/10',
		color: 'text-secondary',
		icon: 'fa6-solid:people-group',
	},
	Награды: {
		box: 'bg-primary-dark/10',
		color: 'text-primary',
		icon: 'fa6-solid:trophy',
	},
	Достижения: {
		box: 'bg-primary-dark/10',
		color: 'text-primary',
		icon: 'fa6-solid:trophy',
	},
	Сертификат: {
		box: 'bg-gray-400/12',
		color: 'text-primary-dark',
		icon: 'fa6-solid:gift',
	},
	Вопросы: {
		box: 'bg-secondary/12',
		color: 'text-secondary',
		icon: 'fa6-solid:circle-question',
	},
	Команда: {
		box: 'bg-primary-light/14',
		color: 'text-primary-dark',
		icon: 'fa6-solid:users',
	},
	Контакты: {
		box: 'bg-primary/12',
		color: 'text-primary',
		icon: 'fa6-solid:mobile-screen-button',
	},
	Избранное: {
		box: 'bg-secondary/8',
		color: 'text-secondary',
		icon: 'fa6-solid:heart',
	},

	/* ─── CORP ─── */
	'О компании-corp': {
		box: 'bg-slate-400/10',
		color: 'text-primary-dark/90',
		icon: 'fa6-solid:building',
	},
	'Авиабилеты-corp': {
		box: 'bg-primary-light/12',
		color: 'text-primary-dark/90',
		icon: 'fa6-solid:plane-departure',
	},
	'Отели-corp': {
		box: 'bg-slate-400/10',
		color: 'text-primary/80',
		icon: 'fa6-solid:hotel',
	},
	'Туры-corp': {
		box: 'bg-primary/10',
		color: 'text-primary-dark',
		icon: 'fa6-solid:magnifying-glass',
	},
	'Трансфер-corp': {
		box: 'bg-gray-400/10',
		color: 'text-primary-dark/85',
		icon: 'fa6-solid:car-side',
	},
	'Преимущества-corp': {
		box: 'bg-primary/8',
		color: 'text-primary/88',
		icon: 'fa6-solid:wand-magic-sparkles',
	},
	'Контакты-corp': {
		box: 'bg-primary-dark/10',
		color: 'text-primary',
		icon: 'fa6-solid:clipboard-list',
	},
};

export function getMobileNavIcon(
	label: string,
	navVariant: 'default' | 'corp' = 'default',
): MobileNavIconDef {
	const corpLabel = `${label}-corp`;
	if (navVariant === 'corp' && map[corpLabel]) {
		return map[corpLabel];
	}
	return map[label] ?? fallback;
}
