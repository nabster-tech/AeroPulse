import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'Asia/Kolkata' });

test('live clock ticks, rolls over at local midnight and follows the saved timezone', async ({
  page,
}) => {
  const instant = new Date('2026-10-20T18:29:59Z');
  await page.clock.install({ time: instant });
  await page.clock.pauseAt(instant);
  await page.goto('/');
  const clock = page.getByRole('button', { name: 'Show UTC' });
  await expect(clock).toHaveAttribute('aria-pressed', 'false');
  await expect(clock).toHaveText(/^23:59:59\s*Local$/);
  await page.clock.runFor(1000);
  await expect(clock).toHaveText(/^00:00:00\s*Local$/);
  await clock.click();
  await expect(clock).toHaveAttribute('aria-pressed', 'true');
  await expect(clock).toHaveText(/^18:30:00\s*UTC$/);
  await expect(clock.locator('time')).toHaveAttribute('datetime', '2026-10-20T18:30:00.000Z');
  await page.reload();
  await expect(clock).toHaveAttribute('aria-pressed', 'true');
  await clock.focus();
  await page.keyboard.press('Space');
  await expect(clock).toHaveAttribute('aria-pressed', 'false');
  await expect(clock).toContainText('00:00:00');
  await page.keyboard.press('Enter');
  await expect(clock).toHaveAttribute('aria-pressed', 'true');
  await expect(clock).toContainText('18:30:00');
  await expect(page.locator('.page-footer')).toContainText('17 Sep 2026');
});

test('Local uses the user device timezone including daylight saving', async ({ browser }) => {
  for (const { zone, date, expected } of [
    { zone: 'America/New_York', date: '2026-01-15T12:00:00Z', expected: '07:00:00' },
    { zone: 'America/New_York', date: '2026-07-15T12:00:00Z', expected: '08:00:00' },
    { zone: 'Europe/Paris', date: '2026-01-15T12:00:00Z', expected: '13:00:00' },
    { zone: 'Asia/Tokyo', date: '2026-01-15T12:00:00Z', expected: '21:00:00' },
  ]) {
    const context = await browser.newContext({ timezoneId: zone });
    try {
      const page = await context.newPage();
      const instant = new Date(date);
      await page.clock.install({ time: instant });
      await page.clock.pauseAt(instant);
      await page.goto('/');
      const clock = page.getByRole('button', { name: 'Show UTC' });
      await expect(clock.locator('.toolbar-clock-time')).toHaveText(expected);
      await expect(clock.locator('.toolbar-clock-zone')).toHaveText('Local');
      await expect(clock).toHaveAttribute('title', new RegExp(zone));
      await clock.click();
      await expect(clock.locator('.toolbar-clock-time')).toHaveText('12:00:00');
      await expect(clock.locator('.toolbar-clock-zone')).toHaveText('UTC');
    } finally {
      await context.close();
    }
  }
});

test('clock stays centered, visible and clear of controls across breakpoints', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 700, 768, 1100, 1399, 1400, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const clock = page.getByRole('button', { name: 'Show UTC' });
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
      return [...bar.querySelectorAll('button:not(.toolbar-clock), select, .breadcrumb')].some(
        (node) => {
          const rect = node.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left < clockRect.right &&
            rect.right > clockRect.left &&
            rect.top < clockRect.bottom &&
            rect.bottom > clockRect.top
          );
        },
      );
    });
    expect(overlaps, `toolbar controls overlap the clock at ${width}px`).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect(clock).toBeInViewport();
    expect((await page.locator('.topbar').boundingBox())!.y).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
});
