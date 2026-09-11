/**
 * Бейджи направлений — те же подписи и цвета, что у карточек туров (PopularTours).
 */
export interface TourStyleBadge {
	label: string;
	className: string;
}

const TOUR_BADGE_BY_DESTINATION: Record<string, TourStyleBadge> = {
	Мальдивы: {
		label: 'Премиум',
		className: 'bg-white text-gray-900 border border-white/70',
	},
	Сейшелы: {
		label: 'Острова',
		className: 'bg-primary text-white',
	},
	Турция: {
		label: 'Хит продаж',
		className: 'bg-red text-white',
	},
	Таиланд: {
		label: 'Расслабление',
		className: 'bg-primary text-white',
	},
	Египет: {
		label: 'Всё включено',
		className: 'bg-gray-400 text-white',
	},
	Вьетнам: {
		label: 'Пляжный отдых',
		className: 'bg-white text-gray-900 border border-white/70',
	},
	Направления: {
		label: 'Подборка',
		className: 'bg-primary text-white',
	},
	Новости: {
		label: 'Новости',
		className: 'bg-red text-white',
	},
	Япония: {
		label: 'Визы',
		className: 'bg-primary text-white',
	},
	Италия: {
		label: 'Визы',
		className: 'bg-gray-400 text-white',
	},
	ОАЭ: {
		label: 'События',
		className: 'bg-red text-white',
	},
	'ANRO TRIP': {
		label: 'Команда ANRO\u00a0TRIP',
		className: 'bg-white text-gray-900 border border-white/70',
	},
};

export function getTourStyleBadge(destination: string): TourStyleBadge {
	return (
		TOUR_BADGE_BY_DESTINATION[destination] ?? {
			label: destination,
			className: 'bg-gray-400 text-white',
		}
	);
}

const HIDDEN_JOURNAL_BADGE_LABELS = new Set(['премиум', 'расслабление']);

/** Бейджи журнала: одна подпись — один тег (Япония и Италия оба «Визы»). */
export function uniqueTourStyleBadges(
	destinations: string[],
): TourStyleBadge[] {
	const seen = new Set<string>();
	const badges: TourStyleBadge[] = [];

	for (const destination of destinations) {
		const badge = getTourStyleBadge(destination);
		const key = badge.label.replace(/\u00a0/g, ' ').toLocaleLowerCase('ru-RU');
		if (HIDDEN_JOURNAL_BADGE_LABELS.has(key) || seen.has(key)) continue;
		seen.add(key);
		badges.push(badge);
	}

	return badges;
}
