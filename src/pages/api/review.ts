/**
 * POST /api/review — заявка «Отзыв»
 * Поля: name (string), phone (string?), email (string?), city (string?),
 *       service (string?), rating (1–5?), review (string), _hp (honeypot)
 */

import type { APIRoute } from 'astro';
import { firstZodError, readRequestBody } from '../../lib/api-request';
import {
	buildTelegram,
	isRateLimited,
	sendEmail,
	sendTelegram,
	wrapHtml,
} from '../../lib/mailer';
import { reviewBodySchema } from '../../lib/schemas';
import { isAllowedFormRequest, safeApiError } from '../../lib/security';

export const POST: APIRoute = async ({ request, clientAddress }) => {
	try {
		if (!isAllowedFormRequest(request)) {
			return json({ ok: false, error: 'Запрос отклонён.' }, 403);
		}

		const ip = clientAddress ?? 'unknown';

		if (isRateLimited(ip)) {
			return json(
				{ ok: false, error: 'Слишком много запросов. Попробуйте позже.' },
				429,
			);
		}

		const body = await readRequestBody(request);

		if (String(body._hp ?? '')) return json({ ok: true }, 200);

		const parsed = reviewBodySchema.safeParse(body);
		if (!parsed.success) {
			return json({ ok: false, error: firstZodError(parsed.error) }, 422);
		}
		const { name, city, phone, email, service, rating, review } = parsed.data;

		const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '';

		// Email
		const emailRows: [string, string, boolean?][] = [
			['Имя клиента', name],
			...(phone ? [['Телефон', phone, true] as [string, string, boolean]] : []),
			...(email ? [['E-mail', email] as [string, string]] : []),
			...(city ? [['Город', city] as [string, string]] : []),
			...(service ? [['Услуга', service] as [string, string]] : []),
			...(stars ? [['Оценка', stars] as [string, string]] : []),
			['Текст отзыва', review],
		];

		await sendEmail({
			subject: `⭐ Отзыв — ${name}${city ? `, ${city}` : ''}`,
			html: wrapHtml('Новый отзыв', '⭐', emailRows),
		});

		// Telegram
		const tgFields: [string, string][] = [
			['👤 Имя', name],
			...(phone ? [['📱 Телефон', phone] as [string, string]] : []),
			...(email ? [['📧 E-mail', email] as [string, string]] : []),
			...(city ? [['🏙 Город', city] as [string, string]] : []),
			...(service ? [['✈️ Услуга', service] as [string, string]] : []),
			...(stars ? [['⭐ Оценка', stars] as [string, string]] : []),
		];

		await sendTelegram(
			buildTelegram('⭐', 'Новый отзыв', tgFields, `💬 Отзыв:\n${review}`),
		);

		return json({ ok: true });
	} catch (err: unknown) {
		return json({ ok: false, error: safeApiError(err) }, 500);
	}
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}
