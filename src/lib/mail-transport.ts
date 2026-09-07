import nodemailer from 'nodemailer';
import type Transporter from 'nodemailer/lib/mailer';
import { getSmtpEnv } from './env';
import type { MailPayload } from './mail-types';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
	if (transporter) return transporter;

	const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
		getSmtpEnv();

	transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: SMTP_SECURE,
		pool: true,
		auth: { user: SMTP_USER, pass: SMTP_PASS },
	});

	return transporter;
}

/** Отправляет письмо через SMTP (пул соединений переиспользуется между запросами). */
export async function sendEmail(payload: MailPayload): Promise<void> {
	const { MAIL_TO, mailFrom } = getSmtpEnv();

	await getTransporter().sendMail({
		from: `"ANRO TRIP" <${mailFrom}>`,
		to: MAIL_TO,
		subject: payload.subject,
		html: payload.html,
	});
}
