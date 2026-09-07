import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
	test('главная: hero и виджет поиска', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#hero')).toBeVisible();
		await expect(page.locator('#search-widget')).toBeVisible();
	});

	test('модалка обратного звонка', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => window.openCallbackModal());
		await expect(page.locator('#callback-modal-overlay')).toBeVisible();
		await expect(page.locator('#callback-modal-title')).toContainText(
			/обратн/i,
		);
		await page.evaluate(() => window.closeCallbackModal());
		await expect(page.locator('#callback-modal-overlay')).toHaveClass(
			/opacity-0/,
		);
	});

	test('модалка подарочного сертификата', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => window.openGiftModal());
		await expect(page.locator('#gift-modal-overlay')).toBeVisible();
		await expect(page.locator('#gift-modal-title')).toBeVisible();
	});

	test('форма отзыва', async ({ page }) => {
		await page.goto('/');
		await page.locator('#open-review-form').click();
		await expect(page.locator('#review-modal-overlay')).toBeVisible();
	});

	test('404', async ({ page }) => {
		const response = await page.goto('/this-page-does-not-exist-smoke');
		expect(response?.status()).toBe(404);
		await expect(page.locator('body')).toContainText(/404|не найден/i);
	});

	test('блог: список статей', async ({ page }) => {
		await page.goto('/blog');
		await expect(page.locator('main')).toBeVisible();
		await expect(page.locator('a[href^="/blog/"]')).not.toHaveCount(0);
	});
});
