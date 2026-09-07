/**
 * Базовые проверки безопасности для публичных API-форм.
 */

const PROD_ORIGINS = new Set([
	'https://anrotrip.ru',
	'https://www.anrotrip.ru',
]);

/** Разрешает POST только с нашего сайта (Origin / Referer). В dev — без ограничений. */
export function isAllowedFormRequest(request: Request): boolean {
	if (process.env.NODE_ENV !== 'production') return true;

	const origin = request.headers.get('origin');
	if (origin && PROD_ORIGINS.has(origin)) return true;

	const referer = request.headers.get('referer');
	if (referer) {
		try {
			return PROD_ORIGINS.has(new URL(referer).origin);
		} catch {
			return false;
		}
	}

	return false;
}

/** Не отдаёт внутренние детали ошибок (SMTP, env) в production. */
export function safeApiError(err: unknown): string {
	if (process.env.NODE_ENV !== 'production') {
		return err instanceof Error ? err.message : 'Ошибка сервера';
	}
	return 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.';
}
