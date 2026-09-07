import { expect, test, devices } from '@playwright/test';

test.use({ ...devices['Pixel 7'] });

test('mobile drawer открывается и закрывается', async ({ page }) => {
	await page.goto('/');
	const toggle = page.locator('#menu-toggle');
	await expect(toggle).toBeVisible();
	await toggle.click();
	await expect(page.locator('#mobile-menu')).toBeVisible();
	await page
		.locator('#mobile-menu-backdrop')
		.click({ position: { x: 10, y: 10 } });
});
