/**
 * Общие классы Tailwind для полей форм (единый источник, без дублирования в .astro).
 */

/** Подписи в модалках «звонок» и «подарок» */
export const modalLeadLabelClass =
	'text-xs text-gray-500 font-medium mb-1 block';

/** Инпуты на белом фоне (CallbackModal, GiftModal) */
export const modalLeadInputClass =
	'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-[border-color,box-shadow]';

/** Кнопка «Отправить» в лид-модалках и форме отзывов в секции Reviews */
export const modalLeadSubmitClass =
	'w-full bg-primary text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-[color,box-shadow] duration-normal cursor-pointer tracking-wide uppercase text-sm btn-ripple focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

/** Подписи в модалке отзыва (крупнее, контрастнее) */
export const reviewModalLabelClass =
	'block text-sm font-medium text-gray-700 mb-1';

/** Инпуты и textarea в модалке отзыва (серый фон) */
export const reviewModalTextFieldClass =
	'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export const reviewModalTextareaClass = `${reviewModalTextFieldClass} resize-none`;

/** Кнопка отправки в модалке отзыва (py-4, без mt-2 / uppercase — отличие от лид-форм) */
export const reviewModalSubmitClass =
	'w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-[color,box-shadow] duration-normal cursor-pointer btn-ripple focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

/**
 * Поле логина cabinet (tel/email): `rounded-lg`, `text-base`, `ring-1` — намеренно не как лид-модалки.
 */
export const cabinetLoginInputClass =
	'w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none';
