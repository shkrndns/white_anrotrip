import Typograf from 'typograf';

/** Русская типографика: неразрывные пробелы, тире, кавычки. Только невидимые сущности → &nbsp; */
const tp = new Typograf({ locale: ['ru', 'en-US'] });

/** Не трогаем телефоны в тексте турфирмы — ложные срабатывания */
tp.disableRule('ru/other/phone-number');

/** «ANRO TRIP» всегда в одной строке (неразрывный пробел). */
function protectBrandName(text: string): string {
	return text.replace(/\bANRO\s+TRIP\b/gi, (brand) =>
		brand.replace(/\s+/g, '\u00a0'),
	);
}

/** «ж/д» не разрывается по слэшу (word joiner). */
function protectRailwayAbbrev(text: string): string {
	return text.replace(/ж\/д/gi, (abbr) => abbr.replace('/', '\u2060/\u2060'));
}

function applyTextTypograf(text: string): string {
	return protectBrandName(protectRailwayAbbrev(tp.execute(text)));
}

/** Слова в заголовках блога — без переноса внутри (nowrap; word joiner не работает с uppercase). */
const BLOG_TITLE_NOWRAP_WORDS = ['профессиональный'];

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** HTML заголовка блога: типографика + nowrap для длинных слов + ANRO&nbsp;TRIP. */
export function formatBlogTitleHtml(
	title: string,
	options?: { uppercase?: boolean },
): string {
	if (!title?.trim()) return '';
	const source = options?.uppercase ? title.toLocaleUpperCase('ru-RU') : title;
	let html = escapeHtml(applyTextTypograf(source));
	for (const word of BLOG_TITLE_NOWRAP_WORDS) {
		const pattern = options?.uppercase ? word.toLocaleUpperCase('ru-RU') : word;
		html = html.replace(
			new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'),
			(match) => {
				if (match.toLocaleUpperCase('ru-RU') === 'ПРОФЕССИОНАЛЬНЫЙ') {
					return '<span class="blog-title__nowrap-word">ПРОФЕССИОНАЛЬ<wbr>НЫЙ</span>';
				}
				return `<span class="blog-title__nowrap-word">${match}</span>`;
			},
		);
	}
	return html;
}

/** Обычный текст (заголовки карточек, description). */
export function typografText(text: string): string {
	if (!text?.trim()) return text;
	return applyTextTypograf(text);
}
