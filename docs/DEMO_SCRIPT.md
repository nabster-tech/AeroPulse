# Airport Operations Dashboard â€” team demo script

This script is designed for an eight-minute presentation of the deployed proof of concept. It demonstrates the product as it exists today: 71 KPIs in 11 categories, deterministic static data, category filters, focused analysis, configurable layouts, export, themes, and saved presentation preferences.

## Before the meeting

1. Open the [deployed dashboard](https://nabster-tech.github.io/airport-operations-dashboard/) in Chrome or Edge at 100% zoom. A viewport near 1440 Ã— 900 works well.
2. Select **Dark** from the theme selector and turn **IST + UTC** off so the button reads **Show UTC**.
3. Open **Airside Operations**, select **Reset filters**, then choose **Edit layout â†’ Reset layout â†’ Save layout**. Repeat the layout reset for **Passenger Flow** if it was changed during rehearsal.
4. Confirm that the browser permits downloads. The demo exports CSV files locally and sends nothing to an external service.
5. Keep this script open on a second screen. If the hosted site is unavailable, run `npm ci` followed by `npm run dev` from the project directory and use the URL printed by Vite.

Do not describe the figures as live airport data. The interface deliberately labels them **STATIC DEMO** and uses a fixed Meridian International snapshot from 17 September 2026 at 14:00 IST.

## Eight-minute presentation

### 0:00â€“0:40 â€” Set the context

**Screen:** Airside Operations overview.

**Say:**

> This is a proof of concept for a configurable airport operations workspace. It brings 71 requested KPIs into one interface and organizes them into 11 operational categories, from airside and turnaround through terminal operations and passenger flow. The data in this demonstration is static and deterministic, so today I am showing the workflow and interaction model rather than claiming a live operational integration.

Point to the **STATIC DEMO** label, the Meridian International airport identity, and the snapshot timestamp.

> Keeping the source and timestamp visible is intentional. An operator should always know which airport, time window, and data state they are looking at.

### 0:40â€“1:25 â€” Explain the category workspace

**Action:** Slowly move the pointer down the category navigation. Select **Turnaround Management**, then return to **Airside Operations**.

**Say:**

> Each category is its own workspace with the KPIs, filters, and layout that make sense for that function. The badge beside each category shows how many KPIs it contains. Navigation is URL-based, so browser Back and Forward work and a category survives a reload.

> The cards combine a headline value, its operational scope, a target or reference where one exists, and a chart or table. Status is communicated with text as well as color.

### 1:25â€“2:45 â€” Find and investigate a KPI

**Action:** Click **Find a KPI**, type `Security Queue Wait Time`, and select the result. The application moves to **Passenger Flow** and opens the KPI in the **MAIN FRAME** focus dialog.

**Say:**

> Search spans the complete catalog. Choosing a result takes me to the correct category and opens the KPI in a focused analysis view.

Point to the formula, headline result, source, definition version, snapshot timestamp, and underlying table.

> The focused view explains how the KPI is calculated, where the data is expected to come from, the current scope, the provisional target, and the underlying rows. That traceability is important because a headline number alone is difficult to challenge or approve.

**Action:** Change **Breakdown** from **Time interval** to **Group / resource**, then select **Table only**. Select it again to restore the chart.

> The same result can be inspected by time, operational group, or underlying records. The HTML table provides exact values and remains available alongside visual charts.

**Action:** Close the focus dialog.

### 2:45â€“3:45 â€” Apply operational filters

**Action:** In Passenger Flow, select **Last 6 hours**, **T1**, and **15 minutes**.

**Say:**

> Filters are driven by the active category. Here I can narrow passenger KPIs to Terminal 1, the last six hours, and 15-minute intervals. The cards recalculate from the shared static records, which keeps related KPIs internally consistent.

**Action:** Select **Airside Operations**, then return to **Passenger Flow**.

> Filter selections are remembered independently for each category, so changing the passenger view does not silently alter the airside workspace. The preferences also survive a browser reload on this device.

**Action:** Select **Reset filters** to restore a clean overview.

### 3:45â€“5:15 â€” Personalize the layout

**Action:** Select **Edit layout**.

**Say:**

> Layout editing is explicit. Changes remain in a draft until the user saves them, which prevents an accidental drag from immediately replacing a known workspace.

**Action:** Drag one card using its grip handle. Resize another from its right edge or bottom-right corner. Open a cardâ€™s three-dot menu and choose **Full width**, then **Taller**.

> Cards can be reordered and resized directly. The menu provides deterministic width, height, and ordering controls for keyboard users and for situations where precise pointer dragging is inconvenient.

**Action:** Open the three-dot menu on a less important card and choose **Hide KPI**. Point to **Restore KPIs**, then select **Save layout**.

> Users can hide lower-priority metrics without deleting them, restore them later, and save a different layout for every category. The cards compact to use the available width, and the charts resize with their containers.

**Action:** Switch to **Airside Operations**, then return to **Passenger Flow**.

> The Passenger Flow arrangement is retained while the Airside layout stays independent.

If dragging feels awkward during the live presentation, use **Full width**, **Taller**, **Move earlier**, and **Move later** from the card menu. These actions demonstrate the same saved-layout model without relying on precise pointer movement.

### 5:15â€“6:05 â€” Show presentation controls

**Action:** Select **Light**, then return to **Dark**. Select **Show UTC**.

**Say:**

> Light, dark, and system themes are available, and the preference persists between visits. Airport timelines use local IST by default. The UTC option shows both clocks and makes the UTC date explicit when the two zones fall on different calendar days.

**Action:** Open the currency selector and briefly show EUR, USD, and INR. Leave it on EUR.

> The presentation layer also supports EUR, USD, and INR. The current 71 operational KPIs do not contain monetary units, so switching currency correctly leaves these values unchanged. When commercial metrics are added, production will need an approved exchange-rate source and effective timestamp rather than the illustrative proof-of-concept rates.

### 6:05â€“7:10 â€” Show the passenger scenario and exports

**Action:** Use **Find a KPI** to search for `Predictive Passenger Flow`. Select **Predictive Passenger Flow & Dynamic Resource Allocation**.

**Say:**

> This view demonstrates how the same workspace can present a forecast scenario. It compares predicted passenger demand with a suggested desk allocation.

Point to the scenario explanation and suggested allocation table.

> The suggestion is deliberately read-only. In this demonstration it uses one processing desk per 60 forecast passengers in each 15-minute interval. It does not dispatch staff or equipment. A production workflow would require approved rules, permissions, audit history, and integration with the resource-management system.

**Action:** Select **Export details**. Close the focus dialog and select **Export category**.

> Users can export either the focused detail or the current category snapshot to CSV. The export includes scope, units, state, timestamp, and the active filtered values so the file remains understandable outside the dashboard.

### 7:10â€“8:00 â€” Explain the production path and close

**Screen:** Return to Airside Operations or leave the passenger scenario category visible.

**Say:**

> The proof of concept separates the interface from its data source. The current asynchronous adapter supplies deterministic fixture data; a production API can replace that adapter without rebuilding the category views, search, layouts, filters, focus mode, or export workflow.

> Production readiness still requires approved KPI definitions, authenticated airport and role access, server-owned calculations, freshness and data-quality states, partial-feed failure handling, shared preference storage, monitoring, and acceptance testing against the airportâ€™s managed browser and accessibility matrix.

> The decision I would like from this review is whether this category-based workspace and investigation flow are the right foundation for a read-only pilot. If they are, the next step is to select a small set of operational KPIs and connect them to versioned read-only data contracts.

Pause on the dashboard and invite questions.

## Three-minute cutdown

Use this sequence if the agenda is tight:

1. **0:00â€“0:30:** State that the PoC contains 71 KPIs across 11 categories and uses an explicitly labeled static snapshot.
2. **0:30â€“1:15:** Search for **Security Queue Wait Time**, open it, and show its formula, breakdown selector, source, and underlying table.
3. **1:15â€“2:00:** Close the focus view, apply **Last 6 hours** and **T1**, then enter layout edit mode and make one card **Full width** from its menu.
4. **2:00â€“2:30:** Search for **Predictive Passenger Flow**, explain that its allocation is a read-only precomputed scenario, and show **Export details**.
5. **2:30â€“3:00:** Explain the replaceable data adapter and ask for agreement on a read-only pilot with a small, approved KPI set.

## Likely questions and concise answers

### Is this using live airport data?

No. The PoC uses a fixed, internally consistent dataset for Meridian International at 17 September 2026, 14:00 IST. Static status and timestamps remain visible throughout the interface. Live feeds are production integration work.

### Why are there 71 KPIs rather than the original 12â€“15 cards?

The supplied KPI requirements contained 71 named metrics. The category model keeps the dashboard usable by showing the relevant subset for each operational function rather than placing all metrics in one grid.

### Can different users keep different layouts?

The PoC stores layouts and filters in the current browser. Production should store versioned user or team preferences in an authenticated service so layouts can move across workstations and support conflict handling and audit history.

### Does changing a filter update every KPI consistently?

Yes within this PoCâ€™s static source. Category KPIs are recalculated from related fixture records using the same filter state. Production calculations and reconciliation should be owned by an approved backend service.

### Is the dashboard accessible?

The PoC supports keyboard search, menu-based layout actions, focus-managed dialogs, exact-value HTML tables, text status cues, responsive controls, and automated WCAG checks. Production acceptance still needs manual assistive-technology testing and the agreed Firefox, WebKit, and managed-device matrix.

### Why does the currency selector appear to do nothing?

None of the current 71 operational KPIs is monetary. The selector is implemented for future commercial metrics, but it intentionally does not transform percentages, counts, minutes, or rates.

### Can the scenario automatically assign staff?

No. It is explicitly a read-only, precomputed demonstration using one desk per 60 forecast passengers per 15-minute interval. Automated dispatch would require approved business rules, permissions, system integration, exception handling, and an audit trail.

### What should be built next?

Choose a small read-only pilot scope, approve its formulas and owners, define versioned KPI snapshot contracts, connect the first source systems behind the existing adapter, add authentication and role enforcement, and validate freshness, reconciliation, partial failures, performance, accessibility, and browser support in staging.

## Presenter recovery notes

- **A card will not drag:** Confirm **Edit layout** is active and drag from the grip icon. Use **Move earlier**, **Move later**, or **Full width** from the three-dot menu as the reliable fallback.
- **A resize handle is hard to grab:** Use **Full width**, **Standard width**, **Taller**, or **Shorter** from the card menu.
- **A KPI appears to be missing:** Open **Edit layout â†’ Restore KPIs** or choose **Reset layout** and save.
- **Filters show rehearsal values:** Select **Reset filters** in the active category. Filters are intentionally remembered per category.
- **The exported file is not visible:** Check the browser downloads panel. The dashboard creates the CSV entirely in the browser.
- **The hosted page is unavailable:** Use the local Vite fallback prepared before the meeting. The PoC does not need a backend at runtime.
- **The audience asks for a live refresh:** Reiterate that deterministic data keeps the workflow review repeatable. Polling, streaming, freshness, degraded states, and recovery behavior belong to the production data contract.

## Closing slide text

**Proposed decision:** Approve the category-based workspace for a read-only pilot.

**Pilot scope:** A small set of approved KPIs, one airport, authenticated users, versioned snapshot APIs, data-quality and freshness states, and server-backed preferences.

**Success measure:** Operators can find, interpret, filter, arrange, and export trusted KPI data faster while retaining the source, definition, scope, and timestamp needed to verify every result.

