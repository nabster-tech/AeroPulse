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

test('open selection drawers use the active theme and remain within the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [value, background] of [
    ['dark', 'rgb(23, 35, 52)'],
    ['light', 'rgb(255, 255, 255)'],
  ] as const) {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open settings' }).click();
    const theme = page.getByRole('combobox', { name: 'Color theme' });
    const supported = await theme.evaluate(() => CSS.supports('appearance', 'base-select'));
    await theme.selectOption(value);
    await theme.click();
    await expect(theme).toBeVisible();
    if (supported) {
      expect(await theme.evaluate((node) => node.matches(':open'))).toBe(true);
      expect(
        await theme.evaluate((node) => getComputedStyle(node, '::picker(select)').backgroundColor),
      ).toBe(background);
      expect(
        await theme.evaluate((node) => getComputedStyle(node, '::picker(select)').fontFamily),
      ).toContain('Inter Variable');
      expect(
        await theme.evaluate(
          (node) => getComputedStyle(node.querySelector('option:checked')!).backgroundColor,
        ),
      ).not.toBe('rgba(0, 0, 0, 0)');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
  }
  await page.goto('/');
  const timeWindow = page.getByRole('combobox', { name: 'Time window' });
  await timeWindow.click();
  if (await timeWindow.evaluate(() => CSS.supports('appearance', 'base-select'))) {
    expect(
      await timeWindow.evaluate(
        (node) => getComputedStyle(node, '::picker(select)').backgroundColor,
      ),
    ).toBe('rgb(255, 255, 255)');
  }
});
