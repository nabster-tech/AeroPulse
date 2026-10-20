import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('settings group preferences, restore focus and fit on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar select')).toHaveCount(0);
  const gear = page.getByRole('button', { name: 'Open settings' });
  await gear.click();
  const panel = page.getByRole('dialog', { name: 'Preferences' });
  await expect(panel).toBeVisible();
  await panel.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await panel.getByRole('combobox', { name: 'Display currency' }).selectOption('USD');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(gear).toBeFocused();
  await gear.press('Enter');
  await expect(panel.getByRole('combobox', { name: 'Color theme' })).toHaveValue('dark');
  await expect(panel.getByRole('combobox', { name: 'Display currency' })).toHaveValue('USD');
  await panel.getByRole('button', { name: 'Close settings' }).click();
  await expect(gear).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await gear.click();
  const bounds = (await panel.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  await panel.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(gear).toBeFocused();
});

test('theme synchronization stays active while settings are closed', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await second.getByRole('button', { name: 'Open settings' }).click();
  await second.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await second.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByRole('combobox', { name: 'Color theme' })).toHaveValue('dark');
});
