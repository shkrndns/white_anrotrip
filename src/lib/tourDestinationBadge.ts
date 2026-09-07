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
};

export function getTourStyleBadge(destination: string): TourStyleBadge {
	return (
		TOUR_BADGE_BY_DESTINATION[destination] ?? {
			label: destination,
			className: 'bg-gray-400 text-white',
		}
	);
}
