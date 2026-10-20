import { test, expect } from '@playwright/test';
import { storageKeys } from '../../src/categories/airport';

test('sidebar toggle expands the grid, preserves layouts and keeps desktop preference on mobile', async ({
  page,
}) => {
  await page.goto('/');
  const sidebar = page.locator('#desktop-kpi-navigation');
  const grid = page.getByTestId('dashboard-grid');
  await expect(page.locator('.kpi-card')).toHaveCount(9);
  await page.getByRole('button', { name: 'Edit layout', exact: true }).click();
  await page.getByRole('button', { name: 'Save layout', exact: true }).click();
  const savedLayout = await page.evaluate((key) => localStorage.getItem(key), storageKeys.layouts);
  const originalWidth = (await grid.boundingBox())!.width;
  const hide = page.getByRole('button', { name: 'Hide sidebar' });
  await expect(hide).toHaveAttribute('aria-expanded', 'true');
  await hide.click();
  await expect(sidebar).toBeHidden();
  const show = page.getByRole('button', { name: 'Show sidebar' });
  await expect(show).toHaveAttribute('aria-expanded', 'false');
  await expect
    .poll(async () => (await grid.boundingBox())!.width)
    .toBeGreaterThan(originalWidth + 250);
  await expect(page.locator('.kpi-card')).toHaveCount(9);
  const clock = (await page.locator('.toolbar-clock').boundingBox())!;
  const bar = (await page.locator('.topbar').boundingBox())!;
  expect(Math.abs(clock.x + clock.width / 2 - (bar.x + bar.width / 2))).toBeLessThan(2);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKeys.layouts)).toBe(
    savedLayout,
  );
  await show.focus();
  await page.keyboard.press('Space');
  await expect(sidebar).toBeVisible();
  await expect.poll(async () => (await grid.boundingBox())!.width).toBe(originalWidth);
  await page.keyboard.press('Enter');
  await expect(sidebar).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toBeVisible();
  await expect(sidebar).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open KPI categories' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /Passenger Flow/ })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#category-title')).toContainText('Passenger Flow');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: 'Show sidebar' })).toBeVisible();
  await page.getByRole('button', { name: 'Show sidebar' }).click();
  await expect(sidebar).toBeVisible();
});

test('invalid preferences and blocked storage do not prevent sidebar toggling', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'invalid');
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  }, storageKeys.sidebar);
  await page.goto('/');
  await expect(page.locator('#desktop-kpi-navigation')).toBeVisible();
  await page.getByRole('button', { name: 'Hide sidebar' }).click();
  await expect(page.locator('#desktop-kpi-navigation')).toBeHidden();
  await page.getByRole('button', { name: 'Show sidebar' }).click();
  await expect(page.locator('#desktop-kpi-navigation')).toBeVisible();
});
