import { z } from 'zod';

const smtpEnvSchema = z.object({
	SMTP_HOST: z.string().min(1, 'SMTP_HOST не задан'),
	SMTP_PORT: z.coerce.number().int().positive().default(465),
	SMTP_SECURE: z
		.string()
		.optional()
		.transform((value) => value !== 'false'),
	SMTP_USER: z.string().min(1, 'SMTP_USER не задан'),
	SMTP_PASS: z.string().min(1, 'SMTP_PASS не задан'),
	MAIL_TO: z.string().min(1, 'MAIL_TO не задан'),
	MAIL_FROM: z.string().optional(),
});

export type SmtpEnv = z.infer<typeof smtpEnvSchema>;

const telegramEnvSchema = z.object({
	TELEGRAM_BOT_TOKEN: z.string().min(1),
	TELEGRAM_CHAT_ID: z.string().min(1),
});

export type TelegramEnv = z.infer<typeof telegramEnvSchema>;

/** SMTP-конфиг из process.env; бросает ZodError с понятным сообщением. */
export function getSmtpEnv(): SmtpEnv & { mailFrom: string } {
	const parsed = smtpEnvSchema.parse(process.env);
	return {
		...parsed,
		mailFrom: parsed.MAIL_FROM ?? parsed.SMTP_USER,
	};
}

/** Telegram-конфиг; null если переменные не заданы. */
export function getTelegramEnv(): TelegramEnv | null {
	const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
	const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
	if (!token || !chatId) return null;
	return telegramEnvSchema.parse({
		TELEGRAM_BOT_TOKEN: token,
		TELEGRAM_CHAT_ID: chatId,
	});
}
