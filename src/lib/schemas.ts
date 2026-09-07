import { z } from 'zod';

/** Обрезает пробелы по краям перед проверкой длины/формата (FormData не делает этого сама). */
const trim = <T extends z.ZodTypeAny>(schema: T) =>
	z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), schema);

/** Пустая строка/undefined → undefined; иначе обрезанная строка ≤ max символов. */
const optionalTrimmed = (max: number) =>
	z.preprocess(
		(val) =>
			typeof val === 'string'
				? val.trim() === ''
					? undefined
					: val.trim()
				: val,
		z.string().max(max).optional(),
	);

/** Пустая строка/undefined → undefined; иначе валидный e-mail ≤ 320 символов. */
const optionalEmail = z.preprocess(
	(val) =>
		typeof val === 'string'
			? val.trim() === ''
				? undefined
				: val.trim()
			: val,
	z.email('Укажите корректный e-mail').max(320).optional(),
);

/** Пустая строка/нечисло → undefined; иначе целое 1–5 (рейтинг приходит строкой из формы). */
const optionalRating = z.preprocess((val) => {
	if (val === '' || val === undefined || val === null) return undefined;
	const n = Number(val);
	return Number.isNaN(n) ? val : n;
}, z.number().int().min(1).max(5).optional());

export const callbackBodySchema = z.object({
	name: trim(z.string().min(2, 'Укажите имя').max(200, 'Слишком длинное имя')),
	phone: trim(
		z.string().min(7, 'Укажите телефон').max(40, 'Слишком длинный телефон'),
	),
});

export const giftBodySchema = z.object({
	fio: trim(z.string().min(2, 'Укажите ФИО').max(200, 'Слишком длинное ФИО')),
	phone: trim(
		z.string().min(7, 'Укажите телефон').max(40, 'Слишком длинный телефон'),
	),
	email: trim(
		z.email('Укажите корректный e-mail').max(320, 'Слишком длинный e-mail'),
	),
});

export const reviewBodySchema = z.object({
	name: trim(z.string().min(2, 'Укажите имя').max(200, 'Слишком длинное имя')),
	city: optionalTrimmed(200),
	phone: optionalTrimmed(40),
	email: optionalEmail,
	service: optionalTrimmed(200),
	rating: optionalRating,
	review: trim(
		z
			.string()
			.min(10, 'Напишите текст отзыва (минимум 10 символов)')
			.max(8000, 'Слишком длинный текст отзыва'),
	),
});
