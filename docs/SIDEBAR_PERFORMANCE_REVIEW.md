# Sidebar toggle performance investigation and optimization

Investigated the desktop sidebar toggle introduced by commit `4ed38d6`, following a report of lag and an unwanted toggle position. The user reviewed a local optimization preview and chose to retain the optimized feature.

## Reproduced cause

The new toggle changed the dashboard's left margin from 268px to zero. The existing `.main-shell` rule animates `margin-left` over 200ms. That animation changes the available grid width repeatedly rather than once. React Grid Layout's `useContainerWidth` observes these intermediate widths and updates React state on animation frames. The cards and their responsive Recharts containers then repeatedly resize and render.

At a 1200px viewport, the grid changes from 886px to 1154px. This crosses the application's 1000px tablet/desktop grid boundary. `CategoryGrid` keys `GridLayout` by that breakpoint, so the switch also unmounts and recreates its nine KPI cards and charts.

This is a measurable bottleneck caused by the sidebar interaction. The clock's one-second state update is isolated inside its own component. The idle measurements did not reveal a continuous resize loop. These results explain interaction lag; they do not establish a separate cause for any persistent idle lag on the user's device.

## Measurements before rollback

Measured a production build in headless Chromium at 1200px and 1440px viewport widths. Each toggle sample consists of four clicks, alternating hide/show, with 600ms between clicks. Both modes use the same application and browser page. The comparison disables only the margin transition through an inline style; it is a diagnostic experiment rather than a proposed retained fix.

| Viewport | Mode                          | Grid resize callbacks | Chart resize callbacks | JavaScript time | Browser task time |
| -------- | ----------------------------- | --------------------: | ---------------------: | --------------: | ----------------: |
| 1200px   | Animated toggle, 4 clicks     |                    22 |                    198 |       1940.96ms |         2374.05ms |
| 1200px   | Transition disabled, 4 clicks |                     8 |                     72 |        802.81ms |         1034.67ms |
| 1440px   | Animated toggle, 4 clicks     |                    20 |                    164 |       1788.15ms |         2209.91ms |
| 1440px   | Transition disabled, 4 clicks |                     4 |                     36 |        649.04ms |          824.21ms |

In separate 1.2-second idle samples at both widths, grid and chart resize callback counts were zero. JavaScript time was approximately 1ms per idle sample.

ResizeObserver instrumentation recorded grid widths and chart callback counts. Chrome DevTools Protocol `Performance.getMetrics` supplied differences in cumulative script, layout, and task durations. Browser task time includes script and layout work; the columns should not be added together. Measurements are local comparative evidence, not production latency guarantees. The instant-width comparison still rebuilds the grid when crossing the breakpoint, so removing the animation alone does not eliminate all toggle work.

The raw observations are saved in [SIDEBAR_PERFORMANCE_MEASUREMENTS.json](SIDEBAR_PERFORMANCE_MEASUREMENTS.json).

## Optimized local preview

The local prototype disables the dashboard margin animation, removes the breakpoint-based React key that recreated the entire grid, and memoizes card charts so parent renders do not repeat unchanged calculations. The toggle position is retained for the performance comparison.

| Viewport |  Four toggles before | Four toggles in preview | Chart resize callbacks before / preview |
| -------- | -------------------: | ----------------------: | --------------------------------------: |
| 1200px   | 1940.96ms JavaScript |     288.12ms JavaScript |                                198 / 36 |
| 1440px   | 1788.15ms JavaScript |     302.45ms JavaScript |                                164 / 36 |

These are single local profiling runs, not a promise of zero latency on every device. Idle chart resize callbacks remained zero. The grid can also receive ResizeObserver notifications when its height changes; callbacks with an unchanged width do not cause a width-state update. The prototype preserves chart DOM nodes across sidebar changes and tablet/desktop grid boundaries.

Raw preview measurements are in [SIDEBAR_PERFORMANCE_PREVIEW_MEASUREMENTS.json](SIDEBAR_PERFORMANCE_PREVIEW_MEASUREMENTS.json).

The production build preview runs locally at `http://127.0.0.1:4175/`. Browser validation covers chart-instance preservation, card bounds and overlap across viewport changes, grid expansion, saved layouts, preference persistence, keyboard toggling, blocked storage, mobile navigation, the clock, and theme/accessibility behavior.

## Decision: retain the optimized sidebar

The original rollback was applied locally, then reversed for the preview. The user accepted the optimized version and requested keeping it. The final change retains the desktop toggle, remembered visibility, mobile drawer, saved KPI layouts, and clickable Local/UTC clock.

The chart-instance and breakpoint geometry checks now guard against rebuilding charts when navigation width changes. The earlier tests proved behavior, persistence, and geometry but did not measure resize frequency or main-thread cost; that was the coverage gap behind this regression. Repeat the profiling experiment when changing dashboard width behavior or increasing chart density.
