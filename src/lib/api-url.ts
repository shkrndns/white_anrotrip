/**
 * Путь к API с учётом `import.meta.env.BASE_URL` (подпапка на хостинге).
 * Клиентские fetch — через этот helper.
 */
export function siteApi(path: string): string {
	const base = import.meta.env.BASE_URL;
	const p = path.replace(/^\/+/, '');
	return `${base}${p}`;
}
