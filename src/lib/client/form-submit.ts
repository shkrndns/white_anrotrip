import { siteApi } from '../api-url';

export interface ApiJsonResponse {
	ok?: boolean;
	error?: string;
}

export interface JsonFormSubmitOptions {
	form: HTMLFormElement;
	submitButton: HTMLButtonElement;
	errorElement?: HTMLElement | null;
	/** Путь API без ведущего слэша, например `api/callback` */
	apiPath: string;
	submitLabel: string;
	loadingLabel?: string;
	timeoutMs?: number;
	onSuccess?: () => void;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const OFFLINE_MESSAGE =
	'Нет подключения к интернету. Проверьте сеть и попробуйте снова.';
const GENERIC_ERROR = 'Не удалось отправить. Попробуйте ещё раз.';
const TIMEOUT_ERROR =
	'Превышено время ожидания. Проверьте соединение и попробуйте снова.';

function resolveErrorMessage(err: unknown): string {
	if (err instanceof DOMException && err.name === 'AbortError') {
		return TIMEOUT_ERROR;
	}
	if (!navigator.onLine) {
		return OFFLINE_MESSAGE;
	}
	if (err instanceof Error && err.message) {
		return err.message;
	}
	return GENERIC_ERROR;
}

/** POST JSON-форма на API с timeout, offline и проверкой res.ok. */
export async function submitJsonForm(
	options: JsonFormSubmitOptions,
): Promise<boolean> {
	const {
		form,
		submitButton,
		errorElement,
		apiPath,
		submitLabel,
		loadingLabel = 'Отправляем…',
		timeoutMs = DEFAULT_TIMEOUT_MS,
		onSuccess,
	} = options;

	if (!navigator.onLine) {
		if (errorElement) {
			errorElement.textContent = OFFLINE_MESSAGE;
			errorElement.classList.remove('hidden');
		}
		return false;
	}

	submitButton.disabled = true;
	submitButton.textContent = loadingLabel;
	if (errorElement) {
		errorElement.textContent = '';
		errorElement.classList.add('hidden');
	}

	const controller = new AbortController();
	const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(siteApi(apiPath), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(Object.fromEntries(new FormData(form))),
			signal: controller.signal,
		});

		let data: ApiJsonResponse = {};
		const contentType = res.headers.get('content-type') ?? '';
		if (contentType.includes('application/json')) {
			data = (await res.json()) as ApiJsonResponse;
		} else if (!res.ok) {
			throw new Error(`Ошибка сервера (${res.status})`);
		}

		if (!res.ok) {
			throw new Error(data.error ?? `Ошибка сервера (${res.status})`);
		}

		if (data.ok) {
			onSuccess?.();
			return true;
		}

		throw new Error(data.error ?? 'Ошибка отправки');
	} catch (err: unknown) {
		if (errorElement) {
			errorElement.textContent = resolveErrorMessage(err);
			errorElement.classList.remove('hidden');
		}
		submitButton.disabled = false;
		submitButton.textContent = submitLabel;
		return false;
	} finally {
		window.clearTimeout(timeoutId);
	}
}

/** Слушатель submit для JSON-форм сайта. */
export function attachJsonFormSubmit(options: JsonFormSubmitOptions): void {
	const { form } = options;
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		void submitJsonForm(options);
	});
}
