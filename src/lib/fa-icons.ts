/** Font Awesome (webfont) → Iconify id для astro-iconify (fa6-*). */

export type FaStyle = 'solid' | 'regular' | 'brands';

const FA_CLASS_TO_STYLE: Record<string, FaStyle> = {
	'fa-solid': 'solid',
	'fa-regular': 'regular',
	'fa-brands': 'brands',
};

const ICONIFY_PACK: Record<FaStyle, string> = {
	solid: 'fa6-solid',
	regular: 'fa6-regular',
	brands: 'fa6-brands',
};

/** `fa-solid fa-globe` → `fa6-solid:globe` */
export function faClassesToIconName(faClasses: string): string {
	const parts = faClasses.trim().split(/\s+/).filter(Boolean);
	let style: FaStyle = 'solid';
	let icon = 'link';

	for (const part of parts) {
		if (part in FA_CLASS_TO_STYLE) {
			style = FA_CLASS_TO_STYLE[part];
		} else if (
			part.startsWith('fa-') &&
			part !== 'fa-solid' &&
			part !== 'fa-regular' &&
			part !== 'fa-brands'
		) {
			icon = part.slice(3);
		}
	}

	return `${ICONIFY_PACK[style]}:${icon}`;
}

export function faIconName(style: FaStyle, icon: string): string {
	return `${ICONIFY_PACK[style]}:${icon}`;
}
