let hintTimer: ReturnType<typeof setTimeout> | null = null;

function loadTourvisor(showLoading?: boolean): void {
	const loadingEl = document.getElementById('tourvisor-loading');
	const container = document.getElementById('tourvisor-container');

	if (window.__tourvisorScriptAdded) {
		if (container && !container.children.length) {
			window.__tourvisorReady = false;
		}
		if (showLoading && loadingEl && !window.__tourvisorReady) {
			loadingEl.classList.remove('opacity-0', 'pointer-events-none');
			loadingEl.setAttribute('aria-hidden', 'false');
		}
		if (container && !container.children.length) {
			window.dispatchEvent(new Event('resize'));
		}
		return;
	}

	window.__tourvisorScriptAdded = true;
	if (showLoading && loadingEl) {
		loadingEl.classList.remove('opacity-0', 'pointer-events-none');
		loadingEl.setAttribute('aria-hidden', 'false');
	}

	const s = document.createElement('script');
	s.src = 'https://tourvisor.ru/module/init.js';
	s.async = true;
	s.onload = () => {
		window.__tourvisorReady = true;
		if (loadingEl) {
			loadingEl.classList.add('opacity-0', 'pointer-events-none');
			loadingEl.setAttribute('aria-hidden', 'true');
		}
		setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
	};
	document.body.appendChild(s);
}

/** Вкладки Nemo / Tourvisor (#search-widget). */
export function initSearchWidget(): void {
	const tabList = document.querySelector<HTMLElement>(
		'#search-widget [role="tablist"]',
	);
	if (!tabList || tabList.dataset.searchWidgetInit === '1') return;

	const tabs = Array.from(
		tabList.querySelectorAll<HTMLElement>('.tab-btn[role="tab"]'),
	);
	const contents = document.querySelectorAll('#search-widget .tab-content');
	if (!tabs.length || !contents.length) return;

	tabList.dataset.searchWidgetInit = '1';

	const switchTab = (targetId: string, focusActive = false) => {
		contents.forEach((c) => {
			c.classList.add('hidden');
			(c as HTMLElement).style.display = 'none';
		});

		tabs.forEach((t) => {
			t.classList.remove('text-primary', 'active-tab');
			t.setAttribute('aria-selected', 'false');
			t.setAttribute('tabindex', '-1');
			const ind = t.querySelector('.active-indicator');
			if (ind) ind.classList.replace('scale-100', 'scale-0');
		});

		const activeBtn = tabList.querySelector<HTMLElement>(
			`.tab-btn[data-target="${targetId}"]`,
		);
		if (activeBtn) {
			activeBtn.classList.add('text-primary', 'active-tab');
			activeBtn.setAttribute('aria-selected', 'true');
			activeBtn.setAttribute('tabindex', '0');
			if (focusActive) activeBtn.focus();
			const ind = activeBtn.querySelector('.active-indicator');
			if (ind) ind.classList.replace('scale-0', 'scale-100');
		}

		const targetContent = document.getElementById(`tab-${targetId}`);
		if (targetContent) {
			targetContent.classList.remove('hidden');
			targetContent.style.display = 'block';
			if (targetId === 'tourvisor') loadTourvisor(true);
		}
	};

	const tourvisorTab = document.querySelector('[data-tourvisor-tab]');
	if (tourvisorTab) {
		tourvisorTab.addEventListener('mouseenter', () => loadTourvisor(false), {
			once: true,
		});
		tourvisorTab.addEventListener('touchstart', () => loadTourvisor(false), {
			once: true,
			passive: true,
		});
	}

	window.loadTourvisor = loadTourvisor;
	window.switchSearchTab = (targetId, focus) => switchTab(targetId, !!focus);

	window.tvSelectCountry = (countryName) => {
		if (!countryName) return;
		const hint = document.getElementById('tv-country-hint');
		const hintText = document.getElementById('tv-country-hint-text');
		if (!hint || !hintText) return;

		hintText.textContent = countryName;
		hint.classList.remove('hidden');

		if (hintTimer) clearTimeout(hintTimer);
		hintTimer = setTimeout(() => {
			hint.classList.add('hidden');
			hintTimer = null;
		}, 5000);
	};

	tabList.addEventListener('keydown', (e: KeyboardEvent) => {
		const currentIndex = tabs.findIndex(
			(t) => t.getAttribute('tabindex') === '0',
		);
		if (currentIndex === -1) return;
		let nextIndex: number;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
		} else if (e.key === 'Home') {
			e.preventDefault();
			nextIndex = 0;
		} else if (e.key === 'End') {
			e.preventDefault();
			nextIndex = tabs.length - 1;
		} else return;

		const target = tabs[nextIndex]?.getAttribute('data-target');
		if (target) switchTab(target, true);
	});

	const firstBtn = tabList.querySelector<HTMLElement>('.tab-btn.active-tab');
	if (firstBtn) {
		const ind = firstBtn.querySelector('.active-indicator');
		if (ind) ind.classList.replace('scale-0', 'scale-100');
		firstBtn.classList.add('text-primary');
	}

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			const target = tab.getAttribute('data-target');
			if (target) switchTab(target);
		});
	});
}
