# AeroPulse custom dashboards: implementation plan

Created: 21 October 2026, 02:19 IST (UTC+05:30)  
Status: Proposed; implementation has not started.  
Basis: Review of the current category catalog, application shell, grid, source adapter, layout store, filter persistence, routes, and tests.

## 1. Recommended product direction

Keep the 11 existing **KPI Categories** as the default ways to browse all 71 KPIs. Add **My Dashboards**, where users create named collections of KPIs from any category, each with an independent saved layout. Use “dashboard” in the interface because these collections combine metrics without changing their operational classification.

For example, **Morning Operations** could contain On-Time Performance from Airside Operations, Aircraft Turnaround Time from Turnaround Management, and Security Queue Wait Time from Passenger Flow. The same KPI can appear on multiple dashboards and in its original category. Its definition and calculation remain shared; its position, size, visibility, and chart/table preference belong to the particular dashboard.

The first delivery uses the existing static dataset and saves dashboard configuration in this browser. Production can replace the persistence and metric adapters independently.

## 2. Scope and interaction design

### Navigation and creation

- Add a **My Dashboards** sidebar section with a compact **+ New dashboard** action. Retain the KPI Categories section and its current links. Both sections must remain usable in the mobile drawer and with the desktop sidebar collapsed.
- Creation opens a small accessible dialog with a required name, optional description, and Create/Cancel. Names are trimmed, 1–60 characters, and unique among this browser's custom dashboards after case normalization. Descriptions allow up to 240 characters. IDs are generated independently of names, so renaming preserves links.
- Create an empty saved dashboard, navigate to it, and show a clear **Add KPIs** empty state. Do not open a second dialog automatically. Show that configuration is saved in this browser.
- Add a dashboard actions menu for Rename, Duplicate, and Delete. Confirm deletion by naming the dashboard; it deletes only that dashboard. Deleting the current dashboard navigates to the next available dashboard or Airside Operations. Duplicate creates an independent saved copy with new dashboard and widget IDs.

### KPI library and membership

- **Add KPIs** opens a responsive drawer with search, an “All categories” filter, and the existing category names. Each result shows its title and source category. Use a scrollable result list, checkboxes, selection count, and **Add selected** action.
- Show **Already added** for KPIs already in the dashboard. Permit one instance of each KPI per dashboard in the POC. A KPI can still appear on any number of different dashboards.
- In a custom dashboard, show a subtle source-category label on each card. The main focus view and CSV also preserve the source category.
- Add **Add to dashboard** to KPI card menus and focus views, including default categories. A compact picker chooses an existing dashboard or creates one. This action saves immediately to the chosen dashboard; it does not navigate away from the source category or modify its layout. Disable destinations with unsaved drafts and explain that the user must save or cancel those edits first.
- Adding from a category adds a reference to the KPI, using the destination dashboard's filters and a default card size. It does not copy a metric value, category filter, hidden state, or transient focus state. If the destination already contains it, show **Already added** and offer to open the dashboard.
- Keep global KPI search as catalog search: it opens the KPI in its source category. The library handles dashboard selection; sidebar dashboard names handle dashboard navigation.

### Editing, saving, and layout behavior

- Reuse the existing drag handles, edge/corner resizing, keyboard arrangement actions, focus view, and breakpoint behavior. Each dashboard has independent desktop, tablet, and mobile layouts.
- **Edit dashboard** starts one draft containing membership, order, geometry, and chart/table preferences. Add/remove operations within the dashboard participate in that draft. Save commits the complete document; Cancel restores the last saved document. Opening Add KPIs from a non-editing dashboard starts a draft only when the user applies a selection.
- **Remove from dashboard** removes membership and every breakpoint coordinate, with Undo while editing. Existing default categories retain their Hide/Restore behavior. Do not introduce a second hidden-membership model for custom dashboards in the POC.
- New cards append below existing cards on every breakpoint; they do not repack the user's existing arrangement. **Reset layout** deliberately repacks the current membership and resets geometry, preserving membership and chart/table choices. It never restores removed KPIs or changes source categories.
- An empty saved dashboard is valid. Empty and no-data states must provide distinct messages.
- Preserve separate drafts when switching routes, mark unsaved dashboards in navigation, and reuse the unload warning. Rename, duplicate, delete, and external additions must not silently overwrite a draft: require Save or Cancel before those actions.
- Start with guardrails of 20 dashboards per browser and 24 KPIs per custom dashboard. Make these named configuration limits and display actionable messages. These are proposed POC guardrails to validate through measurement, not measured system capacity.

### Filters, focus, and export

- Each custom dashboard remembers its own time window, granularity, and dimension filters. Theme, currency, and Local/UTC remain global presentation preferences.
- Show the union of dimensions supported by the selected KPIs. Apply each dimension only to KPIs declaring support in `specs`. Normalize unsupported dimensions to `all` for that metric's request and calculation.
- When a non-default filter affects only some cards, display a compact message such as **Terminal T1 applies to 2 of 5 KPIs**, plus each card's effective scope. Runway metrics must never acquire a misleading Terminal T1 label. Preserve existing “not applicable” behavior for supported but incompatible selections.
- Remove filters for dimensions no longer used by any selected KPI and reset their stored values to `all`. Use membership including temporarily unavailable KPIs to determine supported dimensions when metadata is still known.
- Focus opens within the current dashboard, with its effective filters and without navigating to the KPI's default category. Closing restores focus to its trigger or the dashboard heading if that trigger no longer exists.
- **Export dashboard** exports its visible saved or draft membership, matching the view currently on screen. Include dashboard name/ID, source category, KPI ID/title, value/unit, effective scope, as-of timestamp, and status. Exclude cards removed in the active draft. Preserve CSV escaping and current currency/timezone formatting; failed metrics export an explicit status with an empty value, never zero.

## 3. Architecture changes required by the current code

This is more than a sidebar addition. The current dependencies are explicit:

| Current module            | Current coupling                                                                | Planned change                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `catalog.ts`              | `CategoryId` and category membership describe the operational taxonomy          | Keep the taxonomy and 71 stable KPI IDs; custom dashboards reference that catalog                                        |
| `navigation.ts`           | Parses only `#/kpis/:categoryId` using a fixed substring                        | Parse a route union for category and dashboard destinations; preserve current category URLs                              |
| `CategoryApp.tsx`         | Derives the heading, members, filters, query, focus, and export from a category | Extract the shared shell/navigation and a workspace controller; resolve the active destination before rendering          |
| `CategoryGrid.tsx`        | Reads the category store directly and obtains identity from `snapshot.category` | Extract a shared `KpiGrid` and reusable card, driven by widgets, layout, results, and callbacks                          |
| `workspace.ts`            | Validates and restores only KPIs belonging to a fixed category                  | Extract shared geometry/packing utilities; retain category membership validation and add dashboard membership validation |
| `filters.ts`              | Filter maps accept only fixed `CategoryId` keys                                 | Share filter parsing/normalization utilities; add custom dashboard filter preferences keyed by stable dashboard ID       |
| `source.ts` / `models.ts` | A snapshot returns all KPIs for one category                                    | Add a selection-based metric request/result contract; retain the category adapter for compatibility                      |

Do not widen `CategoryId` to arbitrary strings or insert user-created records into `categories`. That would mix domain classification with personal configuration and weaken existing validation.

### Shared workspace and identities

Use a discriminated workspace reference: `{ kind: 'category', categoryId }` or `{ kind: 'dashboard', dashboardId }`. Derived store/navigation keys must include the kind, preventing category/dashboard collisions.

Introduce a stable `widgetId` separately from `kpiId` for custom dashboards now. Grid positions refer to widget IDs; data requests refer to KPI IDs. Although the POC allows one instance per KPI, this separation allows future comparisons with distinct filters without changing the meaning of stored coordinates. A category adapter can derive stable widget IDs from its KPI IDs without rewriting existing category storage.

Keep `KpiGrid` controlled: it receives a workspace document, per-widget metric state, editing state, and action callbacks. It does not select a store based on metric metadata. Share the actual card/chart/focus rendering rather than copying the category grid into a dashboard component.

### Custom dashboard document

| Field                                     | Purpose                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| `id`, `airportId`, `name`, `description`  | Stable identity, airport scope, user-facing metadata          |
| `schemaVersion`                           | Stored document shape and migration rules                     |
| `revision`, `createdAt`, `updatedAt`      | Local change detection and future server concurrency support  |
| `widgets: { widgetId, kpiId, display }[]` | Ordered KPI references and independent chart/table preference |
| `layouts: { desktop, tablet, mobile }`    | Positions keyed by widget ID with validated bounds            |

Store layout constraints centrally; do not trust editable browser data for minimum widths/heights. Never persist metric results, observation rows, JSX, catalog definitions, or authentication information with a dashboard. Filter preferences live separately from the saved editing document so changing a filter does not create a layout draft.

### Data loading and cache correctness

- Extend the existing source boundary with `metrics(kpiIds, filters, signal)`, returning results and failures keyed by KPI ID. The static implementation calls the existing calculations for selected metrics only; formulas and fixtures remain unchanged. Keep `snapshot(category, ...)` as a compatibility wrapper.
- Normalize filters per KPI before calculation; preserve effective scope alongside the result. Derive a stable query key from airport, source/catalog version, sorted unique KPI IDs, and normalized request filters. Layout, dashboard title, widget order, and clock ticks must not affect the data key. TanStack Query requires query keys to include the variables on which a request depends: see its [query-key guidance](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys).
- Return loading, success, empty/not-applicable, and error states distinctly. A failed KPI gets a retry action without blanking healthy cards. Cancel obsolete requests on filter/route changes and never render results for an old selection as the new selection.
- Fetch only the active workspace's metrics; do not fetch all 71 to populate the library. The library uses metadata. A future HTTP adapter should batch selected metrics and expose per-item failures instead of requiring one network call per card.
- Static data may retain infinite staleness. Live adapters must introduce feed-specific freshness, per-metric timestamps, retry policy, and reconnect handling; they cannot inherit that static policy unchanged.

### Persistence and recovery

- Add an asynchronous `DashboardRepository` interface for list/load/create/save/delete and a localStorage implementation. Keep existing category layout v2 and filter v1 keys intact. New custom data uses a separate airport-scoped namespace, for example `aeropulse.dashboards.meridian.v1`; custom filter preferences use their own versioned key.
- Validate the collection envelope and each dashboard independently with Zod. Reject duplicate widget IDs/KPI membership, missing/duplicate coordinates, out-of-bounds geometry, invalid references, oversized strings, and exceeded limits. Repair recoverable geometry through a documented deterministic policy. One corrupt dashboard must not reset every dashboard or overwrite the original stored text.
- Preserve retired/unknown KPI references as **KPI unavailable** cards, with a Remove action, rather than silently deleting user configuration. Known but unauthorized KPIs in production must not reveal protected metadata. Missing new catalog KPIs must never be automatically inserted into custom dashboards.
- Persist only after a valid create/save/delete command; never write on every drag event or clock tick. Promote a draft to saved state only after storage succeeds. On quota/access failure keep the draft, show a truthful error, and allow retry.
- Handle storage events: refresh clean documents; if another tab modifies a dashboard with an open draft, retain the draft and show a conflict message. Detect revision changes before saving and require reload/reapply instead of knowingly overwriting changes. localStorage has no transactional compare-and-swap, so simultaneous writes still have a residual race in the POC; do not claim collaboration guarantees.
- Browser storage is scoped to an origin and can be unavailable. Dashboard configuration will not automatically transfer between the Workers domain, GitHub Pages, another browser, or another device. State this compactly in onboarding/documentation; [MDN documents localStorage persistence and access restrictions](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## 4. Technology choices and tradeoffs

Retain the project's installed stack and pinned versions. This feature needs no new runtime library, backend, or framework migration.

| Decision                                                     | Benefits                                                                              | Costs / mitigation                                                                                                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Personal dashboards reference a shared KPI catalog           | One definition per metric; easy cross-category composition; taxonomy remains reliable | Mixed metrics can have different scope and freshness; show effective filters and timestamps                                                                                                                  |
| Shared category/dashboard grid engine                        | Existing resizing, focus, accessibility, and styling improvements apply to both       | Refactoring can regress category behavior; adapt categories first and run regression tests before adding CRUD                                                                                                |
| Existing React Grid Layout                                   | Already integrated; supports drag, resize, and responsive layouts                     | Geometry and chart resizing still need careful validation; reuse measured container widths and test all breakpoints; see the [project documentation](https://github.com/react-grid-layout/react-grid-layout) |
| Zustand for documents/drafts, TanStack Query for metric data | Matches existing responsibilities; avoids mixing layout edits with telemetry          | Broad store subscriptions can rerender every chart; use workspace-specific selectors and stable callbacks                                                                                                    |
| Radix dialogs/menus, existing tokens and typography          | Consistent UI and keyboard/focus foundations                                          | A drawer still needs explicit labeling, focus restoration, scroll behavior, and mobile checks                                                                                                                |
| Zod and localStorage behind a repository                     | Small POC, static hosting, validated configuration; replaceable persistence           | Device/origin-bound, limited storage, no authoritative identity or atomic concurrency; use errors and explicit production gates                                                                              |
| Explicit Save/Cancel for configuration                       | Predictable demonstrations; safe experimentation; failed saves retain work            | More clicks and draft states; retain clear edit banners and navigation indicators                                                                                                                            |
| One KPI instance per dashboard initially                     | Simpler picker, clear membership, fewer accidental duplicates                         | Side-by-side T1/T2 comparison waits for widget-specific filters; separate widget IDs prepare that extension                                                                                                  |

### Alternatives considered

1. **Treat custom dashboards as new catalog categories.** Initially less UI work, but it mixes user state with fixed KPI ownership, breaks category validation assumptions, and makes future sharing harder. Prefer separate dashboard entities.
2. **Copy KPI definitions/data into each dashboard.** Provides superficial independence but allows formulas, labels, and snapshots to drift. Store references and independent presentation settings instead.
3. **Build a second grid specifically for custom dashboards.** Fast first mockup, but doubles resizing, focus, theme, and accessibility maintenance. Extract the existing engine instead.
4. **Add a database and accounts immediately.** Enables shared/device-independent dashboards, but expands the POC into identity, authorization, migrations, and operations. Introduce those after UX acceptance through the repository boundary.

## 5. Delivery sequence and acceptance gates

### Phase 1: Extract and protect the existing experience

Extract the controlled grid/card, geometry validation, workspace reference, and shell boundaries. Adapt current categories to those components while preserving category routes, storage keys, drafts, filters, search, hide/restore, exports, and focus behavior.

**Exit:** existing category tests pass; a saved category arrangement reloads unchanged; no custom dashboard UI is required yet.

### Phase 2: Model, persistence, and dashboard navigation

Implement document schemas, the repository, custom document/draft store, route parsing, sidebar section, creation, rename, duplicate, delete, and empty/not-found/error states. Names are plain text. Unknown/deleted dashboard URLs get a helpful recovery view, rather than silently becoming a different category.

**Exit:** create/rename/reload/delete work; malformed data and blocked storage preserve usable state; Back/Forward and direct URLs behave correctly.

### Phase 3: Compose cross-category KPIs

Implement the selection-based data adapter, KPI library drawer, batch selection, Add to dashboard actions, independent membership/layout editing, Remove/Undo, and source-category labels. Wire the existing focus view and dashboard CSV export.

**Exit:** one dashboard contains KPIs from at least three source categories; saved arrangement survives reload; removing/resizing one never changes another dashboard or a default category.

### Phase 4: Mixed-filter behavior and interaction polish

Implement dashboard filter memory, per-metric normalization and scope labels, partial-filter messages, partial errors/retries, storage conflict handling, responsive drawer, keyboard paths, and dark/light styling. Ensure unsaved edits survive route navigation and cannot be overwritten by external additions.

**Exit:** mixed-terminal/runway filtering is demonstrably correct; focus and export use current scope; rapid navigation does not flash stale results; mobile has no page overflow.

### Phase 5: Verification and team demonstration

Complete the tests below, update the README, demo script, architecture/stack documentation, and verification record. Capture desktop/mobile screenshots of a mixed dashboard and KPI drawer. Publish through the existing release process after implementation acceptance.

**Exit:** the demo flow is repeatable, existing category functionality remains intact, and browser-only storage limitations are accurately documented.

## 6. Verification plan

### Unit and integration scenarios

- Document/schema invariants; valid empty dashboard; naming/limit boundaries; independent dashboard/widget IDs on duplicate; category membership rules remain unchanged.
- Save/Cancel for add/remove/reorder/resize; remove cleans every breakpoint; Undo restores geometry; new cards append without moving existing cards; reset preserves membership.
- Malformed JSON, one bad document among valid documents, unknown KPI references, quota/access errors, stale revisions, deleted dashboards, and conflict notifications that preserve drafts.
- Filter normalization for a mixed passenger/runway dashboard, incompatible movement selection, irrelevant-filter reset, stable cache identity after rename/reorder, and changed identity after membership/filter updates.
- Correct export membership, source category, unavailable status, effective scope, escaping, and presentation formatting.

### Browser and accessibility scenarios

1. Create **Morning Operations**, select KPIs from three categories, save, resize/reorder, save again, reload, and verify membership/geometry at desktop, tablet, and mobile breakpoints.
2. Put one KPI on two dashboards; edit one; verify the other and its source category are unchanged. Attempt a duplicate add and verify a clear Already added state.
3. Add from a source category; verify destination persistence and destination-filter semantics. Try a destination with a draft and verify it is protected.
4. Cancel membership/layout changes, switch routes with drafts, duplicate, rename, delete the active dashboard, and exercise direct links and browser history.
5. Filter Terminal T1 on a dashboard with passenger and runway metrics; inspect the partial-filter message, both effective scopes, focus detail, and CSV.
6. Inject a failing metric and a delayed obsolete request; healthy cards remain useful and stale responses never replace the new workspace.
7. Exercise keyboard-only creation, library search/selection, card resizing alternatives, menus, focus view, Escape, dialog focus return, and axe checks in both themes.
8. Check drawer/navigation/long names at 390, 768, 1440, and 1920px. Verify global Inter typography, no horizontal page overflow, reduced motion, and continued clock/preferences behavior.
9. Open two tabs, modify the same dashboard, verify clean refresh versus draft conflict, and test storage-disabled save behavior.

Use Vitest for domain/repository behavior and Playwright for complete user flows. Run typecheck, lint, formatting, unit tests, production build, and browser tests against the production preview. Avoid tests that only restate schema implementation or assert internal CSS classes.

Measure drag/resize responsiveness with a representative 12-card dashboard and at the proposed 24-card limit. Check component render counts during clock ticks, drawer search, and layout edits; mount only the active grid. Record timings and browser/device context before choosing any further performance limits or virtualization.

## 7. Production extension after POC acceptance

1. Replace the local repository with authenticated server persistence; scope queries and writes by tenant, airport, and owner. Add private/shared visibility and server-enforced viewer/editor/owner roles when sharing is introduced.
2. Store versioned dashboard documents with server revisions/ETags and atomic conditional updates. Return conflicts explicitly; support recovery/history before offering concurrent editing.
3. Replace static calculations with the batch metric adapter, server-side KPI authorization, response validation, per-item errors, freshness indicators, and cancellation. Changing a dashboard must not change permission to a metric.
4. Scope caches by authenticated tenant/airport/user where applicable and clear them on account/scope changes. Do not share protected results solely because their KPI IDs match.
5. Introduce catalog lifecycle/version rules, inaccessible/retired KPI handling, layout migrations, audit records for sharing/deletion, and operational monitoring.
6. Consider per-widget filter overrides and repeated KPI instances, dashboard templates, pin/default-home selection, import/export of dashboard configuration, and team folders after the core composition workflow is validated.

Backend/database/vendor selection is a separate production architecture decision based on identity, tenancy, hosting, recovery, and operational requirements. The frontend feature should not prematurely require a particular cloud service.

## 8. Suggested team demo

Create **Morning Operations** → add OTP, turnaround, and passenger security KPIs → arrange and resize → save → apply a filter and explain which cards it affects → focus a KPI → reload → show the original categories and another dashboard retain their own layouts.

The proposed deliverable is personal, cross-category dashboards with independent saved configuration and the current static data. Sharing, accounts, live feeds, and cross-device persistence are later production capabilities.
