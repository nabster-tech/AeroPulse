import { test, expect } from '@playwright/test';

test('preferences and newly mounted controls use the loaded global interface font', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.evaluate(() => document.fonts.ready);
  const preferences = await page.locator('.settings-field').evaluateAll((fields) =>
    fields.map((field) => {
      const label = getComputedStyle(field.querySelector('span')!);
      const selection = getComputedStyle(field.querySelector('select')!);
      return {
        labelFamily: label.fontFamily,
        selectionFamily: selection.fontFamily,
        labelSize: label.fontSize,
        selectionSize: selection.fontSize,
      };
    }),
  );
  for (const field of preferences) {
    expect(field.selectionFamily).toBe(field.labelFamily);
    expect(field.selectionSize).toBe(field.labelSize);
  }
  const inheritance = await page.evaluate(() => {
    const fixture = document.createElement('section');
    fixture.innerHTML =
      '<button>Action</button><input placeholder="Search"><textarea>Notes</textarea><select><optgroup label="Group"><option>Choice</option></optgroup></select>';
    document.body.appendChild(fixture);
    const rootFamily = getComputedStyle(document.documentElement).fontFamily;
    const families = [
      ...fixture.querySelectorAll('button, input, textarea, select, optgroup, option'),
    ].map((node) => getComputedStyle(node).fontFamily);
    const loaded = [...document.fonts].some(
      (font) => font.family.includes('Inter') && font.status === 'loaded',
    );
    fixture.remove();
    return { rootFamily, families, loaded };
  });
  expect(inheritance.loaded).toBe(true);
  expect(inheritance.rootFamily).toContain('Inter Variable');
  for (const family of inheritance.families) expect(family).toBe(inheritance.rootFamily);
});
