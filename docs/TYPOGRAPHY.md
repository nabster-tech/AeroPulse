# Shared typography

AeroPulse uses Inter Variable as its interface typeface. The font files are bundled through the existing `@fontsource-variable/inter` import in `src/main.tsx`.

`src/styles/typography.css` is the single source for the font stack and shared control text sizing. `src/styles.css` imports it globally, so it applies to category views, charts, portaled dialogs, settings, and newly added components.

| Token                         | Purpose                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `--font-sans`                 | Inter Variable and system fallbacks; also available through Tailwind `font-sans`            |
| `--text-control`              | Shared 13px preference label and dropdown sizing; available through Tailwind `text-control` |
| `--text-control--line-height` | Shared control line height                                                                  |

Buttons, inputs, textareas, selects, options, optgroups, and file-upload buttons inherit their surrounding typography. Controls therefore use the app font instead of browser-specific defaults, including inside dialogs mounted outside the application root.

For a new feature:

- Inherit the app font; avoid component-specific font imports or separate font-family declarations.
- Use `font-sans` or `var(--font-sans)` when a library requires an explicit family, such as a canvas renderer.
- Use `text-control` or the shared control tokens for compact preference controls and their labels.
- Choose sizes and weights appropriate to headings, metrics, and supporting text while retaining the shared family.

```css
.feature-control {
  font-family: var(--font-sans);
  font-size: var(--text-control);
  line-height: var(--text-control--line-height);
}
```
