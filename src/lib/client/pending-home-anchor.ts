/** Ранний флаг pending home anchor (в <head>, до paint). */
export function initPendingHomeAnchor(basePath: string): void {
	const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
	const normalizedBase = basePath.replace(/\/$/, '') || '/';
	const isHome =
		currentPath === normalizedBase ||
		currentPath === `${normalizedBase}/index.html`;

	let pendingHash: string | null;
	try {
		pendingHash = sessionStorage.getItem('pendingHomeHash');
	} catch {
		pendingHash = null;
	}

	if (isHome && (window.location.hash || pendingHash)) {
		document.documentElement.classList.add('has-pending-home-anchor');
	}
}
