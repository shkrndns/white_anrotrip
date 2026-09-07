/**
 * Общие хелперы для API-эндпоинтов форм (`src/pages/api/*.ts`).
 */

import type { ZodError } from 'zod';

/** Читает тело запроса как plain object: поддерживает JSON и multipart/urlencoded form-data. */
export async function readRequestBody(
	request: Request,
): Promise<Record<string, unknown>> {
	const ct = request.headers.get('content-type') ?? '';

	if (ct.includes('application/json')) {
		const body = await request.json().catch(() => ({}));
		return (body ?? {}) as Record<string, unknown>;
	}

	const fd = await request.formData().catch(() => new FormData());
	return Object.fromEntries(fd.entries());
}

/** Первое сообщение об ошибке валидации Zod — для показа пользователю в форме. */
export function firstZodError(error: ZodError): string {
	return error.issues[0]?.message ?? 'Проверьте правильность заполнения полей';
}
