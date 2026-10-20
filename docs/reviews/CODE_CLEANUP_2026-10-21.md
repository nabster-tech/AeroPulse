# AeroPulse code cleanup

Date: 21 October 2026 (Asia/Kolkata)  
Branch: `develop`  
Scope: Remove verified unused implementation without changing the current dashboard's features.

## Changes

- Removed 137 CSS rules for components and states no longer rendered by the application: the original cargo, parking, gate-map, queue, donut, and revenue widgets; old sidebar filters/profile; obsolete toolbar controls, banners, and dialogs; unused compact/status variants.
- Removed the corresponding unused light-theme selector branches. Preserved the required specificity for active navigation badges, draft indicators, and destructive menu items after screenshot review identified a badge-color difference.
- Removed the unreferenced `timeLabel` helper from `src/categories/models.ts`. The presentation provider remains responsible for the airport/UTC timeline formatting used by charts, detail tables, and exports.
- Formatted `wrangler.jsonc` to match the existing formatter. Its configuration values are unchanged.

CSS source size decreased from **50,221 to 37,606 bytes**, a **25.1% reduction** across application stylesheets. These are source measurements, not a claim about load-time improvement or compressed download savings.

## Review approach

Checked TypeScript symbol references, JSX class names (including conditional classes), CSS selectors, dependency imports, and the application entry points. Kept runtime classes supplied by React Grid Layout and other libraries even where they are absent from JSX.

The declared dependencies remain in use. Static fixtures, the source adapter contract, legacy preference migrations/storage keys, the 71-KPI catalog, shared typography/design tokens, historical review evidence, and planning documents still have a purpose and were retained.

Compared desktop/mobile screenshots in both themes, including overview, Preferences, and focus views. Full-page screenshot comparisons were sensitive to chart measurement and paint containment; they were used for inspection rather than treated as a deterministic acceptance test. Existing browser scenarios verify chart geometry, resizing, data, and interaction behavior.

## Validation

- TypeScript, ESLint, and all 17 unit tests passed.
- Production build passed.
- All 26 Chromium browser tests passed against the production preview (1.7 minutes). The preview was started separately for this run because the standard npm-managed server stalled during teardown on this Windows environment; its temporary test configuration was removed afterward.
- Browser regression coverage includes all 11 categories and 71 focus views, drag/resize, save/reload, hide/restore, scoped filters, CSV export, storage recovery, preferences, sidebar behavior, clock/timezone behavior, mobile geometry, and automated accessibility checks.
- Repository formatting and Git whitespace checks passed.

Changes are left uncommitted for review. Existing work on the custom dashboard plan and README was preserved.
