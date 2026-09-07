/**
 * Реальные отзывы с внешних площадок (Яндекс Карты, 2ГИС) для витрины на главной.
 * Тексты и даты — по состоянию на выгрузку карточек площадок, при обновлении сверяться со ссылками ниже.
 */

import type { ImageMetadata } from 'astro';
import yandexBerezan from '../assets/reviews/external/yandex-berezan.jpg';
import yandexGuzel from '../assets/reviews/external/yandex-guzel.jpg';
import yandexLevashkina from '../assets/reviews/external/yandex-levashkina.jpg';
import yandexProkhorova from '../assets/reviews/external/yandex-prokhorova.jpg';
import yandexShatravkina from '../assets/reviews/external/yandex-shatravkina.jpg';
import yandexSorokina from '../assets/reviews/external/yandex-sorokina.jpg';
import twogisEkaterina from '../assets/reviews/external/twogis-ekaterina.jpg';
import twogisKhramov from '../assets/reviews/external/twogis-khramov.jpg';
import twogisKondrateva from '../assets/reviews/external/twogis-kondrateva.jpg';
import twogisVakhtomina from '../assets/reviews/external/twogis-vakhtomina.jpg';

export interface ExternalReview {
	/** Имя автора, как указано на площадке. */
	name: string;
	/** Дата отзыва в отображаемом виде (формат площадки: с годом или без). */
	date: string;
	/** Оценка 1–5 (на обеих площадках у нас только 5). */
	rating: number;
	/** Текст отзыва (полный — визуально обрезается до 3 строк, ссылка ведёт на площадку). */
	text: string;
	/** Фото профиля с площадки; если нет — показываем инициалы. */
	avatar?: ImageMetadata;
}

export const yandexReviewsUrl =
	'https://yandex.com/maps/org/anro_trip/186447146474/reviews/?ll=61.287497%2C55.172378&z=16';

export const twoGisReviewsUrl =
	'https://2gis.ru/chelyabinsk/firm/70000001082736169/tab/reviews';

export const yandexRating = {
	score: '5,0',
	ratingsCount: 47,
	reviewsCount: 34,
};

export const twoGisRating = {
	score: '5,0',
	ratingsCount: 39,
	reviewsCount: 36,
};

export const yandexReviews: ExternalReview[] = [
	{
		name: 'Левашкина М.',
		date: '12 февраля',
		rating: 5,
		avatar: yandexLevashkina,
		text: 'Хочу выразить огромную благодарность Anro Trip и отдельно Елене Головановой за организацию нашей поездки в Египет. Елена учла все наши пожелания, наш бюджет и помогла подобрать наиболее подходящий для наших «хотелок» тур.',
	},
	{
		name: 'Елена Березан',
		date: '8 мая',
		rating: 5,
		avatar: yandexBerezan,
		text: 'Благодарю Anro Trip и отдельно моего менеджера Юлию Пасынкову за организацию уже не первого моего путешествия! Всегда учитываются мои пожелания, бюджет, интересы! И особенно важно для меня, что Юля всегда на связи.',
	},
	{
		name: 'Анна Шатравкина',
		date: '1 марта',
		rating: 5,
		avatar: yandexShatravkina,
		text: 'Хочу отметить потрясающее отношение к клиентам! Выбрала это агентство по рекомендации и до конца не понимала, в чём именно заключается ценность работы с ними. Но сотрудники превзошли все мои самые смелые ожидания.',
	},
	{
		name: 'Наталья Сорокина',
		date: '9 февраля',
		rating: 5,
		avatar: yandexSorokina,
		text: 'Мы только вернулись из поездки в ОАЭ. Поездка случилась спонтанная, поэтому было много опасений — а не сорвётся ли отпуск. Как хорошо, что мы попали в надёжные руки этой команды!',
	},
	{
		name: 'Кристина Прохорова',
		date: '15 июня',
		rating: 5,
		avatar: yandexProkhorova,
		text: 'Хочу выразить огромную благодарность туристическому агентству Anro Trip в лице Елены за организацию нашего отдыха в Турции! Всё прошло просто великолепно, от подбора тура до самого возвращения домой.',
	},
	{
		name: 'Гузель А.',
		date: '3 июня 2025',
		rating: 5,
		avatar: yandexGuzel,
		text: 'Компания Anro Trip организовала наш отдых в Турции в замечательном отеле Maxx Royal Kemer. Это был не просто отдых — это фейерверк эмоций! Отель превзошёл все ожидания.',
	},
];

export const twoGisReviews: ExternalReview[] = [
	{
		name: 'Екатерина М.',
		date: '5 июня 2026',
		rating: 5,
		avatar: twogisEkaterina,
		text: 'Наш самый комфортный и лучший отдых, спасибо огромное! Теперь отдыхать и путешествовать только с вами.',
	},
	{
		name: 'Юлия Кондратьева',
		date: '3 июня 2026',
		rating: 5,
		avatar: twogisKondrateva,
		text: 'Летали с Анро в Турцию, высочайший уровень сервиса начиная с подбора отеля заканчивая сопровождением в поездке, все подсказали, рассказали, ещё и подарочек от компании по прилёту в отеле получили. Отдельная благодарность менеджеру Юле!',
	},
	{
		name: 'Елена Березан',
		date: '8 мая 2026',
		rating: 5,
		avatar: yandexBerezan,
		text: 'Не первый раз летаю через эту компанию, всё нравится! Мой менеджер Юлия всегда помогает, посоветует, что лучше выбрать, и в любое время на связи по любым волнующим вопросам.',
	},
	{
		name: 'Наталья Сорокина',
		date: '9 февраля 2026',
		rating: 5,
		avatar: yandexSorokina,
		text: 'Хотим поделиться впечатлениями об отдыхе в отеле Akka Antedon. Полетели с туристической компанией Anro Trip — всё было организовано на высшем уровне: индивидуальный трансфер, удобный рейс из Челябинска.',
	},
	{
		name: 'Денис Храмов',
		date: '13 января 2026',
		rating: 5,
		avatar: twogisKhramov,
		text: 'Отличное агентство. Приняли как родных, сопровождали в течение всей поездки. Отдых прошёл на ура, обязательно обратимся ещё. Всем спасибо, вы большие умнички.',
	},
	{
		name: 'Vera Vakhtomina',
		date: '19 июня 2025',
		rating: 5,
		avatar: twogisVakhtomina,
		text: 'Хочу поблагодарить компанию за очень высокий уровень сервиса, внимание к запросам клиента, а также за профессионализм и заботу сотрудников! Бесконечно признательны всему коллективу компании.',
	},
];

/** Палитра фонов для аватаров-инициалов (детерминированный выбор по индексу). */
export const avatarColors = [
	'bg-blue-500',
	'bg-rose-500',
	'bg-primary',
	'bg-purple-500',
	'bg-emerald-500',
	'bg-cyan-500',
];

/** «ИИ» из «Иван Иванов»; для одного слова — первые 2 буквы. */
export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	return name.slice(0, 2).toUpperCase();
}

/** Склонение существительного по числу: pluralizeRu(34, ['отзыв', 'отзыва', 'отзывов']) → 'отзыва'. */
export function pluralizeRu(
	count: number,
	[one, few, many]: [string, string, string],
): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
	return many;
}
