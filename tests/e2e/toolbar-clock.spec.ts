import { test, expect } from '@playwright/test';

test('live clock ticks, rolls over at local midnight and follows the saved timezone', async ({
  page,
}) => {
  const instant = new Date('2026-10-20T18:29:59Z');
  await page.clock.install({ time: instant });
  await page.clock.pauseAt(instant);
  await page.goto('/');
  const clock = page.getByRole('timer');
  await expect(clock).toHaveAccessibleName('Current airport local time');
  await expect(clock).toContainText('23:59:59');
  await expect(clock).toContainText('20 Oct 2026');
  await page.clock.runFor(1000);
  await expect(clock).toContainText('00:00:00');
  await expect(clock).toContainText('21 Oct 2026');
  await page.getByRole('button', { name: 'Show UTC' }).click();
  await expect(clock).toHaveAccessibleName('Current UTC time');
  await expect(clock).toContainText('18:30:00');
  await expect(clock).toContainText('20 Oct 2026');
  await expect(clock.locator('time')).toHaveAttribute('datetime', '2026-10-20T18:30:00.000Z');
  await page.reload();
  await expect(clock).toHaveAccessibleName('Current UTC time');
  await page.getByRole('button', { name: 'IST + UTC' }).click();
  await expect(clock).toHaveAccessibleName('Current airport local time');
  await expect(clock).toContainText('00:00:00');
  await expect(page.locator('.page-footer')).toContainText('17 Sep 2026');
});

test('clock stays centered, visible and clear of controls across breakpoints', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 700, 768, 1100, 1399, 1400, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const clock = page.getByRole('timer');
    await expect(clock).toBeVisible();
    const bounds = await clock.boundingBox();
    const toolbar = await page.locator('.topbar').boundingBox();
    expect(bounds).not.toBeNull();
    expect(toolbar).not.toBeNull();
    expect(
      Math.abs(bounds!.x + bounds!.width / 2 - (toolbar!.x + toolbar!.width / 2)),
    ).toBeLessThan(2);
    const overlaps = await page.locator('.topbar').evaluate((bar) => {
      const clockRect = bar.querySelector('.toolbar-clock')!.getBoundingClientRect();
      return [...bar.querySelectorAll('button, select, .breadcrumb')].some((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.left < clockRect.right &&
          rect.right > clockRect.left &&
          rect.top < clockRect.bottom &&
          rect.bottom > clockRect.top
        );
      });
    });
    expect(overlaps, `toolbar controls overlap the clock at ${width}px`).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect(clock).toBeInViewport();
    expect((await page.locator('.topbar').boundingBox())!.y).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
});
