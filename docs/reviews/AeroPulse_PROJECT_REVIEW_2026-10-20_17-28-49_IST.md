# AeroPulse project review, proposed fixes, and improvements

| Review detail                    | Value                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Report timestamp                 | 20 October 2026, 17:28:49 IST (UTC+05:30)                                                                                                                                                |
| Finalized                        | 20 October 2026, 22:03 IST (UTC+05:30)                                                                                                                                                   |
| Review started                   | 20 October 2026, 17:22 IST                                                                                                                                                               |
| Baseline                         | `8b615e213046e5ee61004b0daf5ee102eb8a74fc`, branch `main`                                                                                                                                |
| Environment                      | Windows, Node 24.20.0, npm 12.2.0, Chromium, freshly built Vite production preview                                                                                                       |
| Scope                            | Active application modules, KPI catalog and calculations, layout persistence, presentation preferences, styles, tests, deployment configuration, dependencies, and project documentation |
| Disposition at review completion | Findings below describe the baseline before follow-up fixes; the separate update below records subsequent work                                                                           |

## Follow-up after the review

The demo fixes requested after this report address **F01, F04 and F08**. KPI timeline groups are now sorted by reporting interval; runway configuration shows both East and West shares, including a meaningful group breakdown; and the settings button retains a 44-pixel hit area on mobile. Focused calculation and browser regression tests were added. The other findings remain recommendations for subsequent work. The baseline observations and screenshots below are retained as before-fix evidence. The [mobile dashboard after the fix](evidence/2026-10-20/mobile-toolbar-after-fix.png) is stored separately.

**Follow-up verification:** 17 unit tests, 25 Chromium browser tests, TypeScript, ESLint and the production build passed. The earlier 23/24 browser result in the baseline table is retained as the original review result.

## Assessment

AeroPulse is a useful static proof of concept with a reasonable frontend stack. Keep React, TypeScript, Vite, Recharts, React Grid Layout, Radix UI, TanStack Query, Zustand, and Zod. The review does not justify a framework rewrite.

There are, however, demonstrable correctness and usability defects that should be addressed before the next acceptance demo:

- Time buckets appear out of chronological order for 25 KPIs when using 15-minute granularity.
- Saving a layout in a second browser tab can erase an already saved layout in another category.
- The keyboard skip link changes the selected category.
- Runway configuration has a missing comparison series and a misleading group breakdown.
- Keyboard search can select results outside the visible list.
- The existing mobile regression test fails because the settings button is only 30 × 30 pixels.
- The dependency audit reports a high-severity build-tool dependency issue.

Static data is an intentional PoC choice, not a defect. Authentication, real data freshness, source validation, server aggregation, authorization, and operational monitoring are separate gates for a real-system pilot.

Priority definitions:

| Priority        | Meaning                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| P1              | Correctness, saved-data loss, or a release-quality issue to resolve before acceptance                               |
| P2              | Functional or usability issue to fix in the next implementation cycle                                               |
| P3              | Smaller consistency or maintainability improvement                                                                  |
| Production gate | Required before introducing real operational data; not a claim that the public static demo is currently compromised |

## Verification results and limits

| Check                                                                | Result                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| TypeScript: `node node_modules/typescript/bin/tsc -b --pretty false` | Passed                                                                                                             |
| ESLint: `node node_modules/eslint/bin/eslint.js .`                   | Passed on baseline                                                                                                 |
| Vitest: `node node_modules/vitest/vitest.mjs run`                    | 15 existing tests passed in 2 files                                                                                |
| Production build: `node node_modules/vite/bin/vite.js build`         | Passed                                                                                                             |
| Full existing Chromium suite                                         | **23 passed, 1 failed**, approximately 1.8 minutes                                                                 |
| Failed test rerun in isolation                                       | Failed again with the same 30 px versus 44 px measurement                                                          |
| Additional browser probes                                            | Reproduced navigation, cross-tab persistence, search, runway comparison, scenario-label, and mobile-control issues |
| Additional calculation probe                                         | Found 25 unordered series, one missing paired series, and four overlapping same-runway flight pairs                |
| Dependency audit: `npm audit --package-lock-only --json`             | 8 high-severity affected package entries, stemming from one `source-map-js` advisory                               |
| Automated accessibility checks in existing suite                     | Passed in the exercised overview, focus, settings, and theme states                                                |

The browser suite used an uncommitted temporary configuration pointing at `http://127.0.0.1:4175/`, with the existing test definitions unchanged. It exercised the newly built `dist/` assets. The temporary configuration and calculation probe were removed after evidence collection. The failing mobile test stops before its navigation assertions; a separate browser probe verified that mobile navigation and focus still work and have no document overflow.

No Firefox/WebKit run, manual screen-reader audit, production API load test, authenticated security assessment, or Cloudflare account configuration inspection was performed. No percentage of code coverage is claimed: coverage instrumentation is not configured. The review did not deploy application changes.

The earlier [verification record](../verification.md) describes a September baseline. Its “all tests passed” and 44-pixel toolbar statements must not be treated as current results.

### Build footprint

The production build emits approximately **963.41 kB of JavaScript before gzip / 284.95 kB gzip**, summed across its five JavaScript chunks. The largest is the chart chunk at 386.85 kB / 110.04 kB gzip. Application CSS is 46.14 kB / 11.14 kB gzip, plus vendor CSS at 5.61 kB / 1.50 kB gzip.

These are build artifact sizes, not measured network transfer or interaction latency. Multiple font subsets are emitted; browser font downloads depend on the glyphs actually needed.

## Confirmed findings and proposed fixes

### F01 — P1: Time-series charts and detail tables are not chronological

**Location:** `src/categories/source.ts:960–990`, especially `grouped()` and its insertion-ordered `Map`.

**Evidence:** For `ao-otp-all`, 15-minute labels include `01:00`, `01:30`, `01:15`, `02:00`, `01:45`, `02:30`, `03:30`, `02:15`. Twenty-five KPIs have at least one backwards step. Flight fixtures are generated in scheduled order, while their actual timestamps include delays. The grouping code preserves first-seen bucket order rather than sorting time.

**Impact:** Charts imply an incorrect sequence of operational changes. Time breakdowns and CSV details inherit the same ordering.

**Proposed fix:** Preserve numeric bucket-start timestamps in the grouped model. Sort time groups numerically before formatting labels. Apply a separate, explicit ordering policy to resource/group breakdowns. Do not sort rendered labels containing timezones or dates.

**Acceptance:** Feed deliberately shuffled observations into grouping. Verify chronological output at quarter/hour/day resolutions, stable aggregates under input permutation, and matching order in chart, table, and CSV.

**Evidence:** [Calculation results](evidence/2026-10-20/calculation-findings.json), [time-table screenshot](evidence/2026-10-20/timeline-out-of-order.png).

### F02 — P1: A second tab can erase another category's saved layout

**Location:** `src/categories/workspace.ts:192–222`, particularly `save()`.

**Reproduction:**

1. Open two tabs before making changes.
2. In tab A, hide `ao-otp-all` and save Airside Operations.
3. In tab B, hide a Passenger Flow KPI and save that category.
4. Reload tab A.

**Observed:** The stored Airside hidden list changes from `["ao-otp-all"]` to `[]`, and all nine cards reappear. Each tab writes its entire in-memory category document, including stale copies of other categories. Layout state has no storage-event synchronization.

**Proposed fix:** Persist separate category documents, or re-read and validate the latest document immediately before merging the edited category. Add storage-event synchronization for clean categories. Detect same-category conflicts with a revision and preserve an unsaved draft instead of silently replacing it. A read-merge-write alone is not sufficient to guarantee simultaneous-write safety; use browser coordination where appropriate, then server-side optimistic concurrency for production.

**Acceptance:** Two-tab tests for edits in different categories, competing edits in the same category, open drafts during external saves, quota errors, and reload restoration.

**Evidence:** [Browser measurements](evidence/2026-10-20/browser-findings.json), `crossTabLayouts`.

### F03 — P1: “Skip to dashboard” unexpectedly changes the category

**Location:** `src/categories/CategoryApp.tsx:267`, `src/categories/navigation.ts`.

**Reproduction:** Open Passenger Flow, focus the skip link, and press Enter.

**Observed:** The link writes `#main-content`. The hash router treats this as an invalid category and redirects to `#/kpis/airside-operations`. The main content receives focus, but it is now the wrong dashboard.

**Proposed fix:** Intercept skip-link activation, prevent the hash mutation, and focus/scroll the existing `main` element. Keep a meaningful anchor target for accessibility. Validate the router prefix explicitly rather than assuming every hash starts with `#/kpis/`.

**Acceptance:** Activate the skip link by keyboard in all categories; URL, category, filters, and draft remain unchanged, while focus moves to the dashboard.

**Evidence:** [Browser measurements](evidence/2026-10-20/browser-findings.json), `skipBefore`/`skipAfter`; [redirect screenshot](evidence/2026-10-20/skip-link-redirect.png).

### F04 — P1: Runway configuration comparison is missing and its group breakdown misleads

**Location:** `src/categories/source.ts:278–297`, paired-reference aggregation, `src/categories/views.tsx`.

**Observed:** The overall value is 57.1%, but the promised `West flow` comparison is `—`. All underlying reference values are undefined. Group view shows East flow at 100% and West flow at 0%, even though West flow occupies 360 of the 840 minutes.

**Cause:** The KPI measures east-flow share within each group; grouping by configuration makes that 100% for East and 0% for West. This is different from each configuration's share of total available time.

**Proposed fix:** Define this KPI explicitly as a distribution of configuration minutes. The daily shares should be approximately 57.14% East and 42.86% West. Supply weighted reference/complement values consistently, or replace the generic paired metric with a distribution view model. Define behavior when configuration coverage is missing.

**Acceptance:** Verify East + West = 100% only for complete coverage, correct last-hour values, missing coverage, and matching summary/chart/table/export semantics.

**Evidence:** [Focus screenshot](evidence/2026-10-20/runway-configuration-missing-reference.png).

### F05 — P1: Runway utilization assumes non-overlapping events, but fixtures overlap

**Location:** `src/categories/fixtures.ts:2–37`, `src/categories/source.ts:228–251`.

**Observed:** The formula describes non-overlapping occupancy seconds and claims movements are separated by at least five minutes. The fixture contains four overlapping same-runway flight pairs. For example, MD142 and MD146 both have actual minute 233.

**Impact:** Simply summing occupancy seconds can double-count occupied runway time. A plausible-looking percentage does not validate the formula.

**Proposed fix:** For occupancy utilization, calculate the union of runway occupancy intervals, clipped to reporting windows and runway availability. Alternatively, make the static fixture obey the documented non-overlap assumption and enforce that invariant, while retaining interval-union semantics for production. Distinguish block timestamps from runway entry/exit timestamps in real source contracts.

**Acceptance:** Independent expected results for simultaneous, overlapping, adjacent, window-crossing, closed-runway, and zero-coverage intervals.

**Evidence:** [Calculation results](evidence/2026-10-20/calculation-findings.json), `sameRunwayOverlaps`.

### F06 — P1: Known dependency advisory remains in the build toolchain

**Location:** `package-lock.json:4243`, `source-map-js` version 1.2.1, marked `dev: true`.

**Observed:** `npm audit --package-lock-only --json` reports eight high-severity affected package entries. These reflect propagation through PostCSS, Vite, Tailwind and Vitest dependencies, not eight independent underlying advisories.

**Advisory:** Indexed source-map offsets can cause event-loop denial of service. The published affected range is `>=1.0.0 <1.2.2`; 1.2.2 is listed as patched. [GitHub advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).

**Exposure:** The identified dependency is part of the development/build toolchain. This review did not demonstrate a remotely exploitable path in the deployed static dashboard.

**Proposed fix:** Refresh the affected transitive lockfile resolution to a patched compatible release, then run clean installation, audit, build, unit and browser checks. If the package manager cannot resolve it directly, evaluate a narrow override or compatible parent update. The audit currently reports `fixAvailable: false`, so do not assume an automatic audit fix will resolve it.

**Acceptance:** The advisory disappears from a fresh lockfile audit, and the application builds and passes its regression suite. Record any remaining advisory disposition separately.

**Evidence:** [Raw dependency audit](evidence/2026-10-20/dependency-audit.json).

### F07 — P2: Keyboard search selects invisible results

**Location:** `src/categories/CategoryApp.tsx` search key handling, `src/categories/categories.css` search-result styles.

**Reproduction:** Search for `time`, then press ArrowDown ten times.

**Observed:** `aria-activedescendant` identifies “METAR Issuance Timeliness” at y=834–893.5, while the visible results end at y=747. List `scrollTop` remains zero. There is also no selected-option background style; only mouse hover is styled.

**Proposed fix:** Scroll the active option into the list viewport with nearest-block alignment and style `[aria-selected='true']`. Keep DOM focus on the combobox, preserve Escape behavior, and handle empty and whitespace-only queries consistently.

**Acceptance:** Arrow navigation, wrapping, Enter and Escape work with a list longer than the viewport in desktop and mobile navigation. The active item remains visible and visually identifiable.

**Evidence:** [Search screenshot](evidence/2026-10-20/keyboard-search-selection.png), [browser geometry](evidence/2026-10-20/browser-findings.json).

### F08 — P2: Settings hit area regressed to 30 × 30 pixels

**Location:** `src/styles/shell.css:294`, `src/components/preferences-settings.css:1`.

**Observed:** At 390 × 844, navigation and clock controls are 44 pixels high, but Open settings is 30 × 30. The existing responsive test fails on this exact difference, both in the full suite and in isolation.

**Cause:** `.topbar .icon-button` competes with `.category-app .settings-trigger` at equal specificity; the compiled cascade gives the generic 30-pixel size precedence.

**Proposed fix:** Establish a single toolbar-control sizing rule or explicit component/cascade ownership so toolbar buttons retain a 44-pixel hit area. The visual icon can remain small; enlarge the interactive area without enlarging the preferences panel.

**Acceptance:** Existing responsive test passes; inspect computed button dimensions at 320, 390, 768 and desktop widths in both themes. Check spacing and clock centering.

This is a violation of the project's tested 44-pixel requirement. The measurement alone is not a claim of failure of every accessibility standard.

**Evidence:** [Mobile screenshot](evidence/2026-10-20/mobile-toolbar-control-size.png), [measurements](evidence/2026-10-20/ui-measurements.json), [test failure](evidence/2026-10-20/mobile-test-failure.md).

### F09 — P2: The scenario table exposes raw minute offsets

**Location:** `src/categories/CategoryGrid.tsx:403`.

**Observed:** “Interval / terminal” cells show `T1 15`, `T2 15`, `International 15`, then `T1 30`. These are minute offsets from midnight, not recognizable reporting intervals. They also bypass UTC presentation.

**Proposed fix:** Render explicit interval start/end labels through the shared timezone formatter, with terminal in its own column. Keep the scenario's 15-minute allocation grain explicit even when the general chart granularity changes.

**Acceptance:** The first interval displays a human-readable 00:00–00:15 airport-time window; paired UTC includes the previous calendar day when appropriate. Desk counts remain unchanged.

**Evidence:** [Scenario screenshot](evidence/2026-10-20/scenario-raw-minute-labels.png).

### F10 — P2: The generic “Group / resource” breakdown does not define the business dimension

**Location:** `src/categories/source.ts:59–64`, `grouped()`, `src/categories/CategoryGrid.tsx` breakdown selector.

**Observed in code:** Flight observations use flight IDs as `label`; grouping uses that label. Consequently a flight KPI's group view normally produces individual-flight bars, not carrier, terminal, or aircraft-type summaries. Catalog visual descriptions mention carrier and other business breakdowns that this generic grouping does not implement.

**Proposed fix:** Declare supported breakdown dimensions per KPI. Group by the selected actual dimension with explicit labels. Keep “Underlying records” for individual flights. Unsupported dimensions should not appear as working options.

**Acceptance:** For a carrier breakdown, produce one aggregate per carrier using independently calculated numerator/denominator totals. Verify dimension choices per KPI and describe any approved PoC omissions.

### F11 — P3: Truncation notice can appear when no groups were truncated

**Location:** `src/categories/CategoryGrid.tsx:415`.

**Observed:** Runway configuration shows “Chart shows up to 20 groups” with only two groups. The condition uses observation count (`metric.rows.length`) instead of grouped-result count.

**Proposed fix:** Calculate the actual group count once, share it with chart and table, and show a precise “20 of N groups” notice only when a limit is applied. Give the selection an explicit order, such as busiest first, rather than arbitrary insertion order.

**Acceptance:** No notice for 2 or 20 groups; accurate notice and deterministic selection for 21 or more.

### F12 — P3: The clock still has a hover border

**Location:** `src/components/toolbar-clock.css:32–35`.

**Observed:** The default border is transparent, but `:hover` sets `border-color: var(--border)`. In the light-theme probe this becomes `rgb(203, 213, 225)`.

**Interpretation:** Restoring the pre-change stylesheet restored an older hover border as well. If the accepted requirement is no visible clock border in either resting or hover state, it is not yet satisfied.

**Proposed fix:** Keep the border transparent on hover and use the existing subtle background affordance. Preserve a visible keyboard focus indicator and the device-local/UTC behavior.

**Acceptance:** Resting and hovered computed border remain transparent in both themes; keyboard focus remains visible and clicking still switches timezone.

**Evidence:** [UI measurements](evidence/2026-10-20/ui-measurements.json).

## Architecture and production integration findings

### A01 — Production gate: The source interface is useful but the application still depends on fixture internals

**Evidence:** `source.ts` combines approximately 990 lines of metric definitions, fixture materialization, calculations, grouping, React context, and query policy. `CategoryApp` imports `specs` from this module to determine filters. `views.tsx` imports grouping from the same module. Replacing only `SourceContext` does not remove the fixture/calculation dependency from the application bundle.

**Solution:** Separate domain definitions and pure calculations from transport adapters and React hooks. Move fixtures behind `StaticCategorySource`; keep a fixture-free `HttpCategorySource` behind the same validated interface. Split application shell, navigation/search, filter bar, and category controls into focused components. Keep stable KPI IDs and existing saved-layout migrations.

**Acceptance:** A production-mode build can use an HTTP adapter without importing fixture data, while static demo mode still works with no backend.

### A02 — Production gate: Freshness, partial failure and response validation are underspecified

**Evidence:**

- `useCategoryData()` uses `staleTime: Infinity`, no retries and no window-focus refetch, appropriate for fixed data.
- `KpiResult.state` supports only ready/empty/not-applicable.
- The grid force-unwraps `snapshot.metrics.find(...)`; an omitted metric can fail rendering for the workspace.
- Header/footer/focus snapshot labels come from the global fixture configuration, not the actual returned `asOf`.
- There is no runtime schema for incoming snapshots, finite metric values, scope, or expected KPI membership.

**Solution:** Add a validated snapshot envelope with airport, requested scope, definition version, source timestamp, received timestamp, coverage/quality, and per-metric status. Represent stale, unavailable, unauthorized and partial results distinctly. Keep last-known data with visible freshness where appropriate. Derive displayed timestamps from the response. Define bounded retries and refresh frequency per source; invalidate on relevant changes. Infinity does not trigger time-based staleness by itself. [TanStack Query defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).

**Acceptance:** Slow, cancelled, failed, stale, partial, malformed and out-of-order responses are tested. One missing metric produces an isolated unavailable card rather than a workspace crash. A late response cannot replace the current filter scope.

### A03 — Production gate: Identity, authorization and operational observability are absent

**Evidence:** The app is a public static bundle; there is no authenticated API, permission enforcement, session lifecycle, server preference repository or monitoring integration. The error boundary logs rendering failures only to the console.

**Solution:** Add the organization's identity provider and server-enforced airport/role permissions before returning restricted data. Scope query caches and preference keys to user/tenant/airport, clear sensitive caches on logout, and authorize exports on the server. Add sanitized error reporting, source-health telemetry, trace/correlation IDs, latency/error metrics, and operational ownership.

**Acceptance:** Unauthorized airports and exports are denied by the server; switching accounts cannot reuse another user's cached data; failures are observable without logging sensitive raw records.

### A04 — Production gate: Summary requests include all detail rows

**Evidence:** Every `KpiResult` embeds `Observation[]`; `CategorySource.details()` exists but the focus view reads the already loaded snapshot instead. All calculations and focus-table rows are synchronous in the browser.

**Solution:** Return bounded aggregate series for category summaries. Fetch authorized, paginated details when focus is opened and query them by breakdown. Pre-aggregate large datasets on the server. For large exports, use a server export job. Avoid virtualizing every UI element prematurely; start with detail-table limits and measured data volumes.

**Acceptance:** Benchmark representative peak history and slow devices. Set payload, initial-load, interaction and detail-query budgets with the team. Opening one KPI does not require downloading unrelated raw records.

### A05 — P2 improvement: Broad state subscriptions and repeated grouping increase future update cost

**Evidence:** `CategoryApp` and `CategoryGrid` subscribe to the complete Zustand store. `grouped()` repeatedly copies arrays using `[...(groups.get(label) ?? []), r]`. Long groups therefore require unnecessary repeated copying. Formatting also creates many `Intl.DateTimeFormat` instances.

**Solution:** Subscribe to the active category's document/draft and required actions using stable selectors. Append to locally owned grouping arrays, cache reusable formatters, and memoize pure grouped view models by data revision and breakdown. Preserve existing chart memoization and the removal of animated sidebar width changes.

**Acceptance:** Measure commit time, chart instance retention and resize callbacks with representative update rates. No current dashboard-lag regression is asserted by this review; this is a demonstrated code-path risk for larger data volumes.

### A06 — Production gate: CSV escaping does not protect spreadsheet consumers from formula cells

**Location:** `src/categories/views.tsx:321`.

**Evidence:** The exporter quotes fields and doubles embedded quotes, but preserves strings beginning with formula characters. Current fixtures are controlled; future carrier names, notes or external labels may not be.

**Solution:** Define an export policy for human spreadsheet consumption versus machine ingestion. Neutralize dangerous untrusted string cells, retain genuine numeric types, and test the chosen policy in supported spreadsheet applications. Consider a typed spreadsheet export for human users and a separate raw-data format for integrations. Quoting alone is insufficient, and no CSV treatment is universally safe across all applications. [OWASP CSV injection guidance](https://community.owasp.org/attacks/CSV_Injection).

**Acceptance:** Fixtures include formula prefixes, tabs/newlines, delimiters, quotes, Unicode and valid negative numeric values. Assert emitted bytes and spreadsheet interpretation; never execute real external payloads during testing.

### A07 — Production gate: Time and monetary semantics need explicit contracts

**Evidence:** Observation time is minutes from one fixed day; range boundaries use constants 480/780/840; daily labels include a literal `17 Sep`. Detail grouping subtracts a small epsilon to place interval ends in the preceding bucket, while raw event and runway interval selection use different boundary conventions. The clock's device-local/UTC preference also controls airport-local-plus-UTC data labels. Currency rates are fixed illustrative constants, and there are no monetary KPIs in the current catalog.

**Solution:** Define UTC instants, airport IANA timezone, reporting-day boundaries, interval start/end semantics and explicit half-open/inclusive policies for each event family. Keep user clock timezone separate from airport reporting timezone in the model, even if the UI shares a convenient control. Use approved timestamped FX rates only when monetary KPIs are added, preserving source currency and export provenance.

**Acceptance:** Boundary events, midnight, daylight-saving transitions, multiple reporting days, user timezone different from airport timezone, unknown rates and conversion rounding have explicit expected results.

### A08 — P1 process issue: Deployments do not run the browser suite

**Location:** `.github/workflows/deploy-pages.yml`, `package.json`, `playwright.config.ts`.

**Evidence:** The workflow runs on pushes to main or manual dispatch and invokes `npm run check`. That script runs typecheck, lint, unit tests and build, but no Playwright, formatting or dependency-audit gate. The confirmed mobile regression can therefore pass the current deployment checks. The repository has only a Chromium project.

**Solution:** Add pull-request verification with build, unit tests, browser smoke/regression tests and artifacts on failure. Keep publishing dependent on successful verification. Support root and `/AeroPulse/` base paths explicitly: the current Vite base depends on the presence of `GITHUB_ACTIONS`, so adding browser tests in CI requires a configurable test base or a separate root-path test build. Run Firefox/WebKit for the agreed browser support matrix. [Playwright CI guidance](https://playwright.dev/docs/ci), [browser support](https://playwright.dev/docs/browsers).

**Acceptance:** A deliberately failing browser test blocks the publish job. The tested build and deployed artifact have a recorded commit/build ID. Preview/base-path smoke tests verify nested assets and hash routes.

### A09 — P2 improvement: Hosting configuration and security policy are not reproducible from the repository

**Evidence:** GitHub Pages deployment is checked in, but no Cloudflare Worker configuration or static-asset header policy is present. The README's primary live link is still GitHub Pages although Cloudflare is also used. This does not establish that Cloudflare account-level controls are missing; they were not inspected.

**Solution:** Choose and document the canonical hosting target, build command, base path, environment settings, rollback procedure and ownership. Version the relevant Cloudflare configuration without secrets. Evaluate CSP and other response headers against actual framework styling and asset behavior; introduce CSP in report-only mode first where appropriate. Pin CI actions to reviewed immutable revisions and automate dependency update proposals.

**Acceptance:** A clean checkout plus documented credentials/configuration can reproduce the deployment. Verify headers on the actual hosted responses, then test charts, downloads, fonts and navigation under the policy. Cloudflare documents static-asset header configuration and its scope separately from Worker-generated responses. [Cloudflare headers documentation](https://developers.cloudflare.com/workers/static-assets/headers/).

## Are the tests covering the right scenarios?

The tests contain meaningful behavioral coverage. They are not merely a collection of component snapshots. However, several missing assertions explain why genuine defects survive.

| Area                 | Useful coverage today                                                                    | Missing or weak coverage                                                                             | Recommended addition                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Catalog              | All 71 exact source names and category membership                                        | Presence does not prove numerical correctness                                                        | Approved examples and independent expected numbers for each formula family                                                        |
| Calculations         | Selected count/rate reconciliation, supported scope, zero versus unavailable             | Chronological buckets, interval union, weighted reference semantics, boundary timestamps             | Small hand-calculated fixtures, permutation invariance and reconciliation tests                                                   |
| Charts               | All 71 focus views open; observers return to baseline                                    | Correct values, chronological order, comparison completeness and supported breakdowns                | Assert chart model/table values and ordering, with selected visual evidence                                                       |
| Layout               | Pointer drag and east-edge resize actually change geometry; drafts and hide/restore work | Reload test primarily compares stored JSON, not restored geometry; no cross-tab lost-update coverage | Assert visible coordinates after reload; add south/corner resize, keyboard ordering, breakpoint-specific state and conflict tests |
| Navigation           | Category routing, browser history, invalid route recovery                                | Skip-link activation and focus during route changes                                                  | Keyboard skip-link regression across categories                                                                                   |
| Search               | Open results, Escape, Enter and cross-category focus                                     | Long-list arrow navigation, selected styling and scrolling                                           | Keep active option visible throughout keyboard navigation                                                                         |
| Time and preferences | Device-local time, DST examples, UTC rollover, theme synchronization                     | All preferences clearing/synchronizing consistently; failed persistence feedback                     | Multi-tab clear/reset and storage-failure cases with explicit product behavior                                                    |
| Responsive UI        | Width/overflow checks and clock overlap tests                                            | Existing 44 px settings check currently fails                                                        | Fix component sizing; keep the failing assertion rather than weakening it                                                         |
| Failure handling     | Corrupt storage and failed layout writes                                                 | Real transport errors, malformed/partial responses, cancellation after dispatch, stale data          | Injectable delayed/failing source and contract tests                                                                              |
| Exports              | Category CSV filename, headers, row count and static marker                              | Focused export byte content, formula safety and converted-value provenance                           | Parse exports and compare values, units, scope, timestamps and dangerous strings                                                  |
| Accessibility        | Radix focus return and automated axe checks                                              | Manual screen-reader use, long-result navigation, zoom, smaller card-control hit areas               | Keyboard and screen-reader task audit; 200%/400% zoom and target-size review                                                      |
| Performance          | Sidebar chart-instance preservation; focus observer cleanup                              | Large detail datasets, CPU budgets, long update sessions                                             | Representative-data benchmarks and soak tests after a real adapter exists                                                         |
| CI                   | Typecheck, lint, unit tests and build                                                    | Browser tests are outside the deployment gate                                                        | Required browser checks, failure traces and separate deploy job                                                                   |

The cancellation test currently aborts **before** calling the source. This validates early cancellation only; it does not prove that an in-flight HTTP request is aborted or that late responses cannot replace newer data.

The current responsive test also writes a screenshot to a tracked historical evidence filename. Use test-run artifact paths for routine captures, and explicit reviewed visual baselines for comparisons. Screenshots generated during a run are not automatically visual regression assertions.

## Suggested improvements

These are product/design options, not confirmed defects or requirements to implement all at once.

| Improvement                                                          | Benefit                                                                           | Suggested timing                                           |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| KPI-specific breakdown selectors and a clear metric definition panel | Gives operations users meaningful carrier, runway, terminal and resource analysis | Next demo cycle, alongside F10                             |
| Explicit target bands and status text                                | Helps users identify threshold breaches without relying only on color             | After KPI owners approve thresholds                        |
| Named layouts and saved filter views                                 | Supports different operational roles and shift routines                           | Pilot, after persistence conflicts are fixed               |
| Data freshness and source-health indicators                          | Makes partial outages and delayed inputs visible                                  | With first real data source                                |
| Shareable category/filter links                                      | Allows teammates to reproduce a view                                              | Pilot; review permission and sensitive-filter implications |
| Consistent typed units and precision                                 | Prevents arbitrary unit strings, hidden conversions and inconsistent rounding     | During data-contract work                                  |
| Informative empty states that distinguish unavailable from zero      | Prevents “no events” being mistaken for missing feed coverage                     | With source quality model                                  |
| Common control-size and theme tokens                                 | Reduces CSS cascade bugs while keeping the compact design                         | Next UI maintenance pass                                   |
| Remove verified unused legacy visualization styles                   | Reduces theme override complexity and stylesheet maintenance                      | After visual coverage is established                       |
| Display the release/build identifier in a compact About area         | Helps diagnose cached or delayed deployments                                      | Early, low effort                                          |
| Optional compact explanation for currency preferences                | Explains why changing currency has no visible effect on today's non-monetary KPIs | When preferences are next revised                          |
| Print/export presentation mode                                       | Makes team reporting easier without disturbing saved dashboard layouts            | After core correctness work                                |

Do not introduce microfrontends, a second state-management system, or a real-time streaming platform merely to signal production readiness. Use a modular frontend and a bounded aggregate API first. Choose polling or streaming from actual latency, recovery and concurrency requirements.

## Recommended implementation sequence

### Phase 1 — Correctness and review-quality gate

**Work:** F01–F08 and A08. Add the missing regression cases, correct time grouping and runway calculations, prevent cross-tab data loss, repair skip/search behavior and hit areas, update the vulnerable dependency, and run browser checks before publishing.

**Exit criteria:** 24 existing browser tests pass, new defect regressions pass, the dependency advisory is resolved or explicitly dispositioned, and measured values reconcile with independent expectations.

**Relative effort:** Medium to large as a group; the calculation definitions and concurrency behavior need design decisions, while the CSS and skip-link fixes are small.

### Phase 2 — Demo clarity and maintainability

**Work:** F09–F12, A01 and the inexpensive portions of A05/A09. Improve scenario time labels, implement agreed breakdowns, correct truncation messaging, resolve the hover-border requirement, separate fixtures from domain code, and document the canonical deployment.

**Exit criteria:** Each visible control has understandable behavior, all required PoC visualizations have an explicit acceptance mapping, and static mode remains simple to run.

### Phase 3 — One real source, read-only pilot

**Work:** Start with one bounded category and an authenticated HTTP adapter. Implement A02–A04, A06–A07, server-enforced permissions, validated responses, source-derived timestamps, last-known/partial states, paginated detail and observable failures. Add revision-aware server preferences.

**Exit criteria:** Agreed source reconciliation, permission, freshness, recovery and performance tests pass for the selected category. Keep static mode available for demonstrations and automated tests.

### Phase 4 — Broader production rollout

**Work:** Add categories incrementally, agree source ownership and SLOs, verify browser/accessibility support, exercise rollback and recovery, and run representative load and update-session tests. Introduce streaming only where polling cannot meet agreed freshness needs.

**Exit criteria:** Operational owners sign off definitions and thresholds; deployment, incident, recovery and support processes are exercised; production access remains scoped to approved data.

Suggested ownership: frontend for interactions and rendering; domain/operations owner for KPI meaning; backend/integration for data contracts and reconciliation; platform/security for identity, CI and hosting; QA/accessibility for acceptance evidence. These roles can be shared in a small team.

## Evidence index

- [Browser reproduction results](evidence/2026-10-20/browser-findings.json)
- [Calculation review results](evidence/2026-10-20/calculation-findings.json)
- [UI dimensions and timeline rows](evidence/2026-10-20/ui-measurements.json)
- [Dependency audit](evidence/2026-10-20/dependency-audit.json)
- [Repeatable mobile test failure](evidence/2026-10-20/mobile-test-failure.md)
- [Out-of-order timeline](evidence/2026-10-20/timeline-out-of-order.png)
- [Missing runway reference](evidence/2026-10-20/runway-configuration-missing-reference.png)
- [Raw scenario time labels](evidence/2026-10-20/scenario-raw-minute-labels.png)
- [Keyboard search viewport](evidence/2026-10-20/keyboard-search-selection.png)
- [Mobile toolbar](evidence/2026-10-20/mobile-toolbar-control-size.png)
- [Skip-link redirect result](evidence/2026-10-20/skip-link-redirect.png)

External guidance was checked on 20 October 2026. Repository findings refer to the baseline commit above; proposed fixes and architectural directions have not been implemented by this review.
