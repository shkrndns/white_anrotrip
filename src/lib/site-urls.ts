/**
 * Пути с учётом `import.meta.env.BASE_URL` (GitHub Pages, подпапка и т.д.).
 */

/** Страница на сайте: `privacy` → `/privacy` или `/repo/privacy`. Пустая строка — корень (`BASE_URL`). */
export function sitePage(slug: string): string {
	const base = import.meta.env.BASE_URL;
	const s = slug.replace(/^\/+/, '');
	if (!s) return base;
	return `${base}${s}`;
}

/** Главная: корень `BASE_URL`. */
export function siteHome(): string {
	return sitePage('');
}

/** Главная с якорем на виджет поиска туров (`#search`). */
export function siteHomeSearch(): string {
	return `${siteHome()}#search`;
}

/** Главная, секция «Наш блог» (`#journal`). */
export function siteHomeJournal(): string {
	return `${siteHome()}#journal`;
}

/** Политика конфиденциальности. */
export function sitePrivacy(): string {
	return sitePage('privacy');
}

/** Пользовательское соглашение. */
export function siteTerms(): string {
	return sitePage('terms');
}

/** Личный кабинет (вход). */
export function siteCabinet(): string {
	return sitePage('cabinet');
}

/** Список статей журнала: `/blog` или `/base/blog`. */
export function siteBlogIndex(): string {
	return sitePage('blog');
}

/** Страница статьи по slug коллекции `blog`. */
export function siteBlogPost(slug: string): string {
	return sitePage(`blog/${slug}`);
}

/** Прод-домены для canonical / OG (защита от Host header injection). */
const PROD_ALLOWED_HOSTNAMES = new Set(['anrotrip.ru', 'www.anrotrip.ru']);

function parseHostname(hostHeader: string): string {
	return hostHeader.split(':')[0]?.trim().toLowerCase() ?? '';
}

function resolveProto(
	protoHeader: string | null | undefined,
	fallbackOrigin: string,
): 'http' | 'https' {
	const p = protoHeader?.split(',')[0]?.trim().toLowerCase();
	if (p === 'http' || p === 'https') return p;
	try {
		return new URL(fallbackOrigin).protocol === 'http:' ? 'http' : 'https';
	} catch {
		return 'https';
	}
}

function isLocalDevHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1';
}

function originFromHostHeader(
	hostHeader: string,
	protoHeader: string | null | undefined,
	fallbackOrigin: string,
): string {
	const host = hostHeader.split(',')[0]?.trim() ?? hostHeader;
	return `${resolveProto(protoHeader, fallbackOrigin)}://${host}`;
}

/**
 * Публичный origin для OG/canonical за прокси (Dev Tunnel, Caddy).
 * Production: только whitelist (anrotrip.ru / www). Dev: localhost + любой X-Forwarded-Host (туннели).
 */
export function getPublicOrigin(
	request: Request,
	fallbackOrigin: string,
	siteOrigin?: string,
): string {
	const isProd = import.meta.env.PROD;
	const xfHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
	const xfProto = request.headers.get('x-forwarded-proto');

	if (xfHost) {
		const hostname = parseHostname(xfHost);
		if (!isProd || PROD_ALLOWED_HOSTNAMES.has(hostname)) {
			return originFromHostHeader(xfHost, xfProto, fallbackOrigin);
		}
	}

	const host = request.headers.get('host')?.split(',')[0]?.trim();
	if (host) {
		const hostname = parseHostname(host);
		if (
			PROD_ALLOWED_HOSTNAMES.has(hostname) ||
			(!isProd && isLocalDevHost(hostname))
		) {
			return originFromHostHeader(host, xfProto, fallbackOrigin);
		}
	}

	if (siteOrigin) return siteOrigin.replace(/\/$/, '');
	return fallbackOrigin;
}

/** Абсолютный URL og:image с опциональным cache-buster (?v=). */
export function resolveOgImageUrl(
	ogImagePath: string,
	publicOrigin: string,
	version?: string,
): string {
	const explicit = import.meta.env.PUBLIC_OG_IMAGE_URL?.trim();
	if (explicit) return explicit;

	const url = new URL(ogImagePath, publicOrigin);
	if (version) url.searchParams.set('v', version);
	return url.href;
}
