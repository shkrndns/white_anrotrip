const COLLAPSE_MS = 520;

/** Раскрытие списка команды (#toggle-team-btn / #team-list). */
export function initTeamListToggle(): void {
	const btn = document.getElementById('toggle-team-btn');
	const panel = document.getElementById('team-list');
	const collapseBottom = document.getElementById('team-collapse-bottom');
	const teamSection = document.getElementById('team');

	if (!btn || !panel || btn.dataset.teamInit === '1') return;
	btn.dataset.teamInit = '1';

	const teamPanel = panel;
	const toggleBtn = btn;
	const labelEl = toggleBtn.querySelector('.team-btn-label');
	const chevronEl = toggleBtn.querySelector('.team-btn-chevron');

	function isExpanded() {
		return toggleBtn.getAttribute('aria-expanded') === 'true';
	}

	function setExpandedUi(expanded: boolean) {
		toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		if (labelEl) labelEl.textContent = expanded ? 'Свернуть' : 'Вся команда';
		if (chevronEl) chevronEl.classList.toggle('rotate-180', expanded);
	}

	function openList() {
		teamPanel.classList.remove('hidden');
		teamPanel.setAttribute('aria-hidden', 'false');
		teamPanel.style.maxHeight = '0px';
		void teamPanel.offsetHeight;
		requestAnimationFrame(() => {
			const h = teamPanel.scrollHeight;
			if (h < 1) {
				teamPanel.style.maxHeight = 'none';
			} else {
				teamPanel.style.maxHeight = `${h}px`;
			}
			teamPanel.classList.remove('opacity-0');
			teamPanel.classList.add('opacity-100');
		});
		setExpandedUi(true);
	}

	function closeList(opts?: { scrollToTeam?: boolean }) {
		if (teamPanel.classList.contains('hidden')) return;

		const h = teamPanel.scrollHeight;
		teamPanel.style.maxHeight = `${h}px`;
		void teamPanel.offsetHeight;
		teamPanel.style.maxHeight = '0px';
		teamPanel.classList.remove('opacity-100');
		teamPanel.classList.add('opacity-0');
		setExpandedUi(false);

		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			teamPanel.classList.add('hidden');
			teamPanel.setAttribute('aria-hidden', 'true');
			teamPanel.style.maxHeight = '';
			if (opts?.scrollToTeam && teamSection) {
				window.smoothScrollIntoView?.(teamSection);
			}
		};

		const onEnd = (e: TransitionEvent) => {
			if (e.target !== teamPanel || e.propertyName !== 'max-height') return;
			teamPanel.removeEventListener('transitionend', onEnd);
			finish();
		};
		teamPanel.addEventListener('transitionend', onEnd);
		window.setTimeout(finish, COLLAPSE_MS);
	}

	toggleBtn.onclick = () => {
		if (isExpanded()) closeList({ scrollToTeam: false });
		else openList();
	};

	if (collapseBottom) {
		collapseBottom.onclick = () => closeList({ scrollToTeam: true });
	}
}
