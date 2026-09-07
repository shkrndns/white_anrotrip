/** Конфигурация виджета Nemo (CDN pin-версия). */
export const NEMO_WIDGET_VERSION = 'v2.5.64';
export const NEMO_CDN_BASE = `https://cdn.nemo.travel/search-form/${NEMO_WIDGET_VERSION}`;
export const NEMO_BOOKING_URL = 'https://ticket.anrotrip.ru';

export interface NemoWidgetConfig {
	cdnBase: string;
	bookingUrl: string;
}

export function readNemoWidgetConfig(
	root: HTMLElement,
): NemoWidgetConfig | null {
	const cdnBase = root.dataset.nemoCdnBase?.trim();
	const bookingUrl = root.dataset.nemoBookingUrl?.trim();
	if (!cdnBase || !bookingUrl) return null;
	return { cdnBase, bookingUrl };
}
