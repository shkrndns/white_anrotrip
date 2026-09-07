import { getTelegramEnv } from './env';

/** Отправляет сообщение в Telegram; молча пропускает, если env не задан. */
export async function sendTelegram(text: string): Promise<void> {
	const telegram = getTelegramEnv();
	if (!telegram) return;

	const url = `https://api.telegram.org/bot${telegram.TELEGRAM_BOT_TOKEN}/sendMessage`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chat_id: telegram.TELEGRAM_CHAT_ID,
			text,
			parse_mode: 'HTML',
		}),
	});

	if (!res.ok) {
		console.error('[mailer] Telegram sendMessage failed:', res.status);
	}
}
