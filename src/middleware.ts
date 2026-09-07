import { defineMiddleware } from 'astro:middleware';

/**
 * Базовые security-заголовки для всех ответов.
 * CSP с 'unsafe-inline' — из-за inline-скриптов Astro и виджетов Nemo/Tourvisor.
 */
const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://tourvisor.ru https://cdn.nemo.travel",
	"style-src 'self' 'unsafe-inline' https://cdn.nemo.travel",
	"img-src 'self' data: https: blob:",
	"font-src 'self' data:",
	"connect-src 'self' https://tourvisor.ru https://cdn.nemo.travel https://ticket.anrotrip.ru",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self' https://lk.anrotrip.ru",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
	/** Astro paginate: /blog/2 → SSR-маршрут /blog/page/2 */
	const legacyBlogPage = context.url.pathname.match(/^\/blog\/(\d+)\/?$/);
	if (legacyBlogPage) {
		const pageNum = parseInt(legacyBlogPage[1], 10);
		const target = pageNum <= 1 ? '/blog' : `/blog/page/${pageNum}`;
		return context.redirect(target, 301);
	}

	const response = await next();

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()',
	);
	response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);

	const { pathname } = context.url;
	const contentType = response.headers.get('content-type') ?? '';

	if (/^\/og-image\.(png|jpe?g)$/i.test(pathname)) {
		response.headers.set('Cache-Control', 'public, max-age=86400');
		response.headers.set('X-Robots-Tag', 'all');
	} else if (pathname.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'no-store');
	} else if (
		response.status === 200 &&
		contentType.includes('text/html') &&
		!response.headers.has('Cache-Control')
	) {
		/** Браузер — revalidate; Cloudflare — 5 мин + stale-while-revalidate */
		response.headers.set(
			'Cache-Control',
			'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
		);
	} else if (
		response.status === 404 &&
		contentType.includes('text/html') &&
		!response.headers.has('Cache-Control')
	) {
		response.headers.set('Cache-Control', 'no-cache');
	}

	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload',
		);
	}

	return response;
});
