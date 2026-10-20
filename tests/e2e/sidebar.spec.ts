import { test, expect } from '@playwright/test';
import { storageKeys } from '../../src/categories/airport';

test('sidebar resizing preserves chart instances across a grid breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto('/');
  const grid = page.getByTestId('dashboard-grid');
  await expect(grid).toHaveAttribute('data-breakpoint', 'tablet');
  await expect(page.locator('.recharts-wrapper')).toHaveCount(9);
  const charts = await page.locator('.recharts-wrapper').elementHandles();
  await page.getByRole('button', { name: 'Hide sidebar' }).click();
  await expect(grid).toHaveAttribute('data-breakpoint', 'desktop');
  expect(
    await Promise.all(charts.map((chart) => chart.evaluate((node) => node.isConnected))),
  ).toEqual(Array(9).fill(true));
  await page.getByRole('button', { name: 'Show sidebar' }).click();
  await expect(grid).toHaveAttribute('data-breakpoint', 'tablet');
  expect(
    await Promise.all(charts.map((chart) => chart.evaluate((node) => node.isConnected))),
  ).toEqual(Array(9).fill(true));
  for (const width of [390, 768, 1200, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.kpi-card')).toHaveCount(9);
    await expect
      .poll(() =>
        grid.evaluate((element) => {
          const outer = element.getBoundingClientRect();
          const cards = [...element.querySelectorAll('[data-widget]')].map((node) =>
            node.getBoundingClientRect(),
          );
          return (
            cards.every((card) => card.left >= outer.left - 1 && card.right <= outer.right + 1) &&
            cards.every((card, i) =>
              cards
                .slice(i + 1)
                .every(
                  (other) =>
                    card.right <= other.left + 1 ||
                    other.right <= card.left + 1 ||
                    card.bottom <= other.top + 1 ||
                    other.bottom <= card.top + 1,
                ),
            )
          );
        }),
      )
      .toBe(true);
  }
});

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
