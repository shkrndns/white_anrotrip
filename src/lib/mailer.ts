/**
 * Отправка уведомлений о заявках с форм сайта.
 * Реэкспорт модулей: transport, telegram, rate-limit, templates.
 * Данные не логируются в console.* (152-ФЗ).
 */

export type { MailPayload } from './mail-types';
export { sendEmail } from './mail-transport';
export { sendTelegram } from './mail-telegram';
export { isRateLimited } from './rate-limit';
export { wrapHtml, buildTelegram } from './mail-templates';
