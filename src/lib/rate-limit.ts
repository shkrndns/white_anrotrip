const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

/** Возвращает true, если IP превысил лимит запросов (5 за 10 минут). */
export function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return false;
	}

	if (entry.count >= RATE_LIMIT) return true;
	entry.count++;
	return false;
}

function cleanupRateLimitMap(): void {
	const now = Date.now();
	for (const [ip, entry] of rateLimitMap) {
		if (now > entry.resetAt) rateLimitMap.delete(ip);
	}
}

const cleanupTimer = setInterval(cleanupRateLimitMap, CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();
