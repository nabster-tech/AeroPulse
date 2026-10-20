# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resilience.spec.ts >> responsive widths and mobile category navigation remain usable
- Location: tests\e2e\resilience.spec.ts:54:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 44
Received:    30
```

# Page snapshot

```yaml
- generic [ref=e1]:
    - generic [ref=e3]:
        - link "Skip to dashboard" [ref=e4] [cursor=pointer]:
            - /url: '#main-content'
        - generic [ref=e5]:
            - banner [ref=e6]:
                - generic [ref=e7]:
                    - button "Open KPI categories" [ref=e8] [cursor=pointer]
                    - strong [ref=e11]: Airside Operations
                - button "Show UTC" [ref=e12] [cursor=pointer]:
                    - time [ref=e13]:
                        - generic [ref=e14]: 17:26:46
                        - generic [ref=e15]: Local
                - button "Open settings" [ref=e17] [cursor=pointer]
            - main [ref=e21]:
                - generic [ref=e22]:
                    - generic [ref=e23]:
                        - generic [ref=e24]: AIRPORT OPERATIONS
                        - heading "Airside Operations." [active] [level=1] [ref=e28]
                        - paragraph [ref=e29]: Flight punctuality and schedule adherence
                    - generic [ref=e30]:
                        - button "Export category" [ref=e31] [cursor=pointer]
                        - button "Edit layout" [ref=e34] [cursor=pointer]
                - status [ref=e38]: 'Airside Operations: 9 KPIs'
                - generic [ref=e39]:
                    - generic [ref=e40]:
                        - text: Time window
                        - combobox "Time window" [ref=e41]:
                            - option "Today" [selected]
                            - option "Last 6 hours"
                            - option "Last hour"
                    - generic [ref=e42]:
                        - text: Terminal
                        - combobox "Terminal" [ref=e43]:
                            - option "All terminals" [selected]
                            - option "T1"
                            - option "T2"
                            - option "International"
                    - generic [ref=e44]:
                        - text: Movement
                        - combobox "Movement" [ref=e45]:
                            - option "All movements" [selected]
                            - option "arrivals"
                            - option "departures"
                    - generic [ref=e46]:
                        - text: Carrier
                        - combobox "Carrier" [ref=e47]:
                            - option "All carriers" [selected]
                            - option "Meridian Air"
                            - option "Sky Jet"
                            - option "Aero Express"
                    - generic [ref=e48]:
                        - text: Runway
                        - combobox "Runway" [ref=e49]:
                            - option "All runways" [selected]
                            - option "09L/27R"
                            - option "09R/27L"
                    - generic [ref=e50]:
                        - text: Granularity
                        - combobox "Granularity" [ref=e51]:
                            - option "15 minutes"
                            - option "Hourly" [selected]
                            - option "Daily"
                    - button "Reset filters" [ref=e52] [cursor=pointer]
                - generic [ref=e53]:
                    - strong [ref=e56]: 9 of 9 KPIs visible
                    - generic [ref=e57]: Provisional demo definitions · open a KPI for its calculation
                - generic [ref=e59]:
                    - article "On-Time Performance (OTP) – All Flights" [ref=e61]:
                        - generic [ref=e62]:
                            - heading "On-Time Performance (OTP) – All Flights" [level=3] [ref=e64]
                            - generic [ref=e65]:
                                - button "Focus On-Time Performance (OTP) – All Flights" [ref=e66] [cursor=pointer]
                                - button "Settings for On-Time Performance (OTP) – All Flights" [ref=e72] [cursor=pointer]
                        - generic [ref=e77]:
                            - generic [ref=e78]:
                                - generic [ref=e79]: '82.7'
                                - generic [ref=e80]: '%'
                            - paragraph [ref=e81]: 162 observations
                            - generic [ref=e82]: Demo target 85 %
                        - img "On-Time Performance (OTP) – All Flights chart; exact values in detail table" [ref=e84]:
                            - application [ref=e87]:
                                - generic [ref=e104]:
                                    - generic [ref=e105]:
                                        - generic [ref=e106]: 01:00 IST
                                        - generic [ref=e108]: 05:00 IST
                                        - generic [ref=e110]: 09:00 IST
                                        - generic [ref=e112]: 13:00 IST
                                    - generic [ref=e114]:
                                        - generic [ref=e115]: '0'
                                        - generic [ref=e117]: '25'
                                        - generic [ref=e119]: '50'
                                        - generic [ref=e121]: '75'
                                        - generic [ref=e123]: '100'
                        - generic [ref=e125]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e129]
                            - generic [ref=e130]: DEMO
                    - article "OTP – Base/Hub Carrier Flights" [ref=e132]:
                        - generic [ref=e133]:
                            - heading "OTP – Base/Hub Carrier Flights" [level=3] [ref=e135]
                            - generic [ref=e136]:
                                - button "Focus OTP – Base/Hub Carrier Flights" [ref=e137] [cursor=pointer]
                                - button "Settings for OTP – Base/Hub Carrier Flights" [ref=e143] [cursor=pointer]
                        - generic [ref=e148]:
                            - generic [ref=e149]:
                                - generic [ref=e150]: '85.2'
                                - generic [ref=e151]: '%'
                            - paragraph [ref=e152]: 54 observations
                            - generic [ref=e153]: Demo target 85 %
                        - img "OTP – Base/Hub Carrier Flights chart; exact values in detail table" [ref=e155]:
                            - application [ref=e158]:
                                - generic [ref=e175]:
                                    - generic [ref=e176]:
                                        - generic [ref=e177]: 01:00 IST
                                        - generic [ref=e179]: 05:00 IST
                                        - generic [ref=e181]: 09:00 IST
                                        - generic [ref=e183]: 13:00 IST
                                    - generic [ref=e185]:
                                        - generic [ref=e186]: '0'
                                        - generic [ref=e188]: '25'
                                        - generic [ref=e190]: '50'
                                        - generic [ref=e192]: '75'
                                        - generic [ref=e194]: '100'
                        - generic [ref=e196]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e200]
                            - generic [ref=e201]: DEMO
                    - article "SOBT Adherence" [ref=e203]:
                        - generic [ref=e204]:
                            - heading "SOBT Adherence" [level=3] [ref=e206]
                            - generic [ref=e207]:
                                - button "Focus SOBT Adherence" [ref=e208] [cursor=pointer]
                                - button "Settings for SOBT Adherence" [ref=e214] [cursor=pointer]
                        - generic [ref=e219]:
                            - generic [ref=e220]:
                                - generic [ref=e221]: '63'
                                - generic [ref=e222]: '%'
                            - paragraph [ref=e223]: 81 observations
                            - generic [ref=e224]: Demo target 80 %
                        - img "SOBT Adherence chart; exact values in detail table" [ref=e226]:
                            - application [ref=e229]:
                                - generic [ref=e246]:
                                    - generic [ref=e247]:
                                        - generic [ref=e248]: 01:00 IST
                                        - generic [ref=e250]: 05:00 IST
                                        - generic [ref=e252]: 09:00 IST
                                        - generic [ref=e254]: 12:00 IST
                                    - generic [ref=e256]:
                                        - generic [ref=e257]: '0'
                                        - generic [ref=e259]: '25'
                                        - generic [ref=e261]: '50'
                                        - generic [ref=e263]: '75'
                                        - generic [ref=e265]: '100'
                        - generic [ref=e267]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e271]
                            - generic [ref=e272]: DEMO
                    - article "SIBT Adherence" [ref=e274]:
                        - generic [ref=e275]:
                            - heading "SIBT Adherence" [level=3] [ref=e277]
                            - generic [ref=e278]:
                                - button "Focus SIBT Adherence" [ref=e279] [cursor=pointer]
                                - button "Settings for SIBT Adherence" [ref=e285] [cursor=pointer]
                        - generic [ref=e290]:
                            - generic [ref=e291]:
                                - generic [ref=e292]: '64.2'
                                - generic [ref=e293]: '%'
                            - paragraph [ref=e294]: 81 observations
                            - generic [ref=e295]: Demo target 80 %
                        - img "SIBT Adherence chart; exact values in detail table" [ref=e297]:
                            - application [ref=e300]:
                                - generic [ref=e317]:
                                    - generic [ref=e318]:
                                        - generic [ref=e319]: 01:00 IST
                                        - generic [ref=e321]: 05:00 IST
                                        - generic [ref=e323]: 09:00 IST
                                        - generic [ref=e325]: 13:00 IST
                                    - generic [ref=e327]:
                                        - generic [ref=e328]: '0'
                                        - generic [ref=e330]: '25'
                                        - generic [ref=e332]: '50'
                                        - generic [ref=e334]: '75'
                                        - generic [ref=e336]: '100'
                        - generic [ref=e338]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e342]
                            - generic [ref=e343]: DEMO
                    - article "AOBT Deviation" [ref=e345]:
                        - generic [ref=e346]:
                            - heading "AOBT Deviation" [level=3] [ref=e348]
                            - generic [ref=e349]:
                                - button "Focus AOBT Deviation" [ref=e350] [cursor=pointer]
                                - button "Settings for AOBT Deviation" [ref=e356] [cursor=pointer]
                        - generic [ref=e361]:
                            - generic [ref=e362]:
                                - generic [ref=e363]: '7.7'
                                - generic [ref=e364]: min
                            - paragraph [ref=e365]: 81 observations
                            - generic [ref=e366]: Static demonstration · provisional definition
                        - img "AOBT Deviation chart; exact values in detail table" [ref=e368]:
                            - application [ref=e371]:
                                - generic [ref=e388]:
                                    - generic [ref=e389]:
                                        - generic [ref=e390]: 01:00 IST
                                        - generic [ref=e392]: 05:00 IST
                                        - generic [ref=e394]: 09:00 IST
                                        - generic [ref=e396]: 12:00 IST
                                    - generic [ref=e398]:
                                        - generic [ref=e399]: '0'
                                        - generic [ref=e401]: '4'
                                        - generic [ref=e403]: '8'
                                        - generic [ref=e405]: '12'
                                        - generic [ref=e407]: '16'
                        - generic [ref=e409]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e413]
                            - generic [ref=e414]: DEMO
                    - article "AIBT Deviation" [ref=e416]:
                        - generic [ref=e417]:
                            - heading "AIBT Deviation" [level=3] [ref=e419]
                            - generic [ref=e420]:
                                - button "Focus AIBT Deviation" [ref=e421] [cursor=pointer]
                                - button "Settings for AIBT Deviation" [ref=e427] [cursor=pointer]
                        - generic [ref=e432]:
                            - generic [ref=e433]:
                                - generic [ref=e434]: '6.5'
                                - generic [ref=e435]: min
                            - paragraph [ref=e436]: 81 observations
                            - generic [ref=e437]: Static demonstration · provisional definition
                        - img "AIBT Deviation chart; exact values in detail table" [ref=e439]:
                            - application [ref=e442]:
                                - generic [ref=e459]:
                                    - generic [ref=e460]:
                                        - generic [ref=e461]: 01:00 IST
                                        - generic [ref=e463]: 05:00 IST
                                        - generic [ref=e465]: 09:00 IST
                                        - generic [ref=e467]: 13:00 IST
                                    - generic [ref=e469]:
                                        - generic [ref=e470]: '0'
                                        - generic [ref=e472]: '4'
                                        - generic [ref=e474]: '8'
                                        - generic [ref=e476]: '12'
                                        - generic [ref=e478]: '16'
                        - generic [ref=e480]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e484]
                            - generic [ref=e485]: DEMO
                    - article "Base Flight Delay >60 min" [ref=e487]:
                        - generic [ref=e488]:
                            - heading "Base Flight Delay >60 min" [level=3] [ref=e490]
                            - generic [ref=e491]:
                                - button "Focus Base Flight Delay >60 min" [ref=e492] [cursor=pointer]
                                - button "Settings for Base Flight Delay >60 min" [ref=e498] [cursor=pointer]
                        - generic [ref=e503]:
                            - generic [ref=e504]:
                                - generic [ref=e505]: '1'
                                - generic [ref=e506]: flights
                            - paragraph [ref=e507]: 54 observations
                            - generic [ref=e508]: Static demonstration · provisional definition
                        - img "Base Flight Delay >60 min chart; exact values in detail table" [ref=e510]:
                            - application [ref=e513]:
                                - generic [ref=e530]:
                                    - generic [ref=e531]:
                                        - generic [ref=e532]: 01:00 IST
                                        - generic [ref=e534]: 05:00 IST
                                        - generic [ref=e536]: 09:00 IST
                                        - generic [ref=e538]: 13:00 IST
                                    - generic [ref=e540]:
                                        - generic [ref=e541]: '0'
                                        - generic [ref=e543]: '0.25'
                                        - generic [ref=e545]: '0.5'
                                        - generic [ref=e547]: '0.75'
                                        - generic [ref=e549]: '1'
                        - generic [ref=e551]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e555]
                            - generic [ref=e556]: DEMO
                    - article "Average Departure Delay" [ref=e558]:
                        - generic [ref=e559]:
                            - heading "Average Departure Delay" [level=3] [ref=e561]
                            - generic [ref=e562]:
                                - button "Focus Average Departure Delay" [ref=e563] [cursor=pointer]
                                - button "Settings for Average Departure Delay" [ref=e569] [cursor=pointer]
                        - generic [ref=e574]:
                            - generic [ref=e575]:
                                - generic [ref=e576]: '8.3'
                                - generic [ref=e577]: min
                            - paragraph [ref=e578]: 81 observations
                            - generic [ref=e579]: Demo target 15 min
                        - img "Average Departure Delay chart; exact values in detail table" [ref=e581]:
                            - application [ref=e584]:
                                - generic [ref=e601]:
                                    - generic [ref=e602]:
                                        - generic [ref=e603]: 01:00 IST
                                        - generic [ref=e605]: 05:00 IST
                                        - generic [ref=e607]: 09:00 IST
                                        - generic [ref=e609]: 12:00 IST
                                    - generic [ref=e611]:
                                        - generic [ref=e612]: '0'
                                        - generic [ref=e614]: '4'
                                        - generic [ref=e616]: '8'
                                        - generic [ref=e618]: '12'
                                        - generic [ref=e620]: '16'
                        - generic [ref=e622]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e626]
                            - generic [ref=e627]: DEMO
                    - article "Average Arrival Delay" [ref=e629]:
                        - generic [ref=e630]:
                            - heading "Average Arrival Delay" [level=3] [ref=e632]
                            - generic [ref=e633]:
                                - button "Focus Average Arrival Delay" [ref=e634] [cursor=pointer]
                                - button "Settings for Average Arrival Delay" [ref=e640] [cursor=pointer]
                        - generic [ref=e645]:
                            - generic [ref=e646]:
                                - generic [ref=e647]: '7.2'
                                - generic [ref=e648]: min
                            - paragraph [ref=e649]: 81 observations
                            - generic [ref=e650]: Demo target 15 min
                        - img "Average Arrival Delay chart; exact values in detail table" [ref=e652]:
                            - application [ref=e655]:
                                - generic [ref=e672]:
                                    - generic [ref=e673]:
                                        - generic [ref=e674]: 01:00 IST
                                        - generic [ref=e676]: 05:00 IST
                                        - generic [ref=e678]: 09:00 IST
                                        - generic [ref=e680]: 13:00 IST
                                    - generic [ref=e682]:
                                        - generic [ref=e683]: '0'
                                        - generic [ref=e685]: '4'
                                        - generic [ref=e687]: '8'
                                        - generic [ref=e689]: '12'
                                        - generic [ref=e691]: '16'
                        - generic [ref=e693]:
                            - generic "All terminal · All movement · All carrier · All runway" [ref=e697]
                            - generic [ref=e698]: DEMO
                - generic [ref=e699]:
                    - generic [ref=e700]: 9 defined KPIs · Airside Operations
                    - generic [ref=e703]: Static snapshot · 17 Sep 2026 · 14:00 IST
    - generic [aria-hidden] [ref=e704]: 11:00 IST
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { categories, categoryEntries } from '../../src/categories/catalog';
  3   | import { storageKeys } from '../../src/categories/airport';
  4   | test('all 71 focus views open and release size observers', async ({ page }) => {
  5   |   test.setTimeout(180_000);
  6   |   await page.addInitScript(() => {
  7   |     const Native = window.ResizeObserver,
  8   |       active = new Map<object, Set<Element>>();
  9   |     window.ResizeObserver = class extends Native {
  10  |       constructor(cb: ResizeObserverCallback) {
  11  |         super(cb);
  12  |         active.set(this, new Set());
  13  |       }
  14  |       observe(el: Element, opts?: ResizeObserverOptions) {
  15  |         active.get(this)?.add(el);
  16  |         super.observe(el, opts);
  17  |       }
  18  |       unobserve(el: Element) {
  19  |         active.get(this)?.delete(el);
  20  |         super.unobserve(el);
  21  |       }
  22  |       disconnect() {
  23  |         active.get(this)?.clear();
  24  |         super.disconnect();
  25  |       }
  26  |     };
  27  |     Object.defineProperty(window, '__observations', {
  28  |       get: () => [...active.values()].reduce((n, s) => n + s.size, 0),
  29  |     });
  30  |   });
  31  |   await page.goto('/');
  32  |   const errors: string[] = [];
  33  |   page.on('pageerror', (e) => errors.push(e.message));
  34  |   for (const category of categories) {
  35  |     await page.locator('nav a[href="#/kpis/' + category.id + '"]').click();
  36  |     await expect(page.locator('.kpi-card')).toHaveCount(categoryEntries(category.id).length);
  37  |     const observed = () =>
  38  |       page.evaluate(() => (window as unknown as { __observations: number }).__observations);
  39  |     const baseline = await observed();
  40  |     for (const kpi of categoryEntries(category.id)) {
  41  |       const button = page.locator('[data-widget="' + kpi.id + '"] .focus-button');
  42  |       await button.click();
  43  |       await expect(
  44  |         page.getByRole('dialog').getByRole('heading', { name: kpi.title, exact: true }),
  45  |       ).toBeVisible();
  46  |       await page.keyboard.press('Escape');
  47  |       await expect(page.getByRole('dialog')).toHaveCount(0);
  48  |       await expect(button).toBeFocused();
  49  |     }
  50  |     await expect.poll(observed).toBe(baseline);
  51  |   }
  52  |   expect(errors).toEqual([]);
  53  | });
  54  | test('responsive widths and mobile category navigation remain usable', async ({ page }) => {
  55  |   await page.goto('/');
  56  |   for (const width of [390, 768, 1440, 1920]) {
  57  |     await page.setViewportSize({ width, height: 1000 });
  58  |     const responsiveOverflow = await page.evaluate(async () => {
  59  |       let largest = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  60  |       for (let frame = 0; frame < 20; frame += 1) {
  61  |         await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  62  |         largest = Math.max(
  63  |           largest,
  64  |           document.documentElement.scrollWidth - document.documentElement.clientWidth,
  65  |         );
  66  |       }
  67  |       return largest;
  68  |     });
  69  |     await expect(page.locator('.kpi-card')).toHaveCount(9);
  70  |     expect(responsiveOverflow, `transient horizontal overflow at ${width}px`).toBe(0);
  71  |     await expect
  72  |       .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
  73  |       .toBeLessThanOrEqual(width);
  74  |   }
  75  |   await page.setViewportSize({ width: 390, height: 844 });
  76  |   const mobileGeometry = await page.evaluate(() => ({
  77  |     cardsInsideViewport: [...document.querySelectorAll('[data-widget]')].every((node) => {
  78  |       const rectangle = node.getBoundingClientRect();
  79  |       return rectangle.left >= 0 && rectangle.right <= document.documentElement.clientWidth;
  80  |     }),
  81  |     smallestTopbarControl: Math.min(
  82  |       ...[...document.querySelectorAll('.topbar button, .topbar select')].map(
  83  |         (node) => node.getBoundingClientRect().height,
  84  |       ),
  85  |     ),
  86  |   }));
  87  |   expect(mobileGeometry.cardsInsideViewport).toBe(true);
> 88  |   expect(mobileGeometry.smallestTopbarControl).toBeGreaterThanOrEqual(44);
      |                                                ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  89  |   await page.screenshot({ path: 'screenshots/review-after-mobile.png', fullPage: true });
  90  |   await page.getByRole('button', { name: 'Open KPI categories' }).click();
  91  |   await page.getByRole('dialog').locator('a[href="#/kpis/airside-safety"]').click();
  92  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  93  |   await expect(page.locator('.kpi-card')).toHaveCount(8);
  94  |   await page.locator('.focus-button').first().click();
  95  |   await expect(page.getByRole('dialog')).toBeVisible();
  96  |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  97  |   await page.keyboard.press('Escape');
  98  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  99  | });
  100 | test('corrupt storage recovers and blocked saving retains the draft', async ({ page }) => {
  101 |   await page.addInitScript((keys) => {
  102 |     localStorage.setItem(keys.layouts, 'bad json');
  103 |     localStorage.setItem(keys.filters, 'bad json');
  104 |     Storage.prototype.setItem = () => {
  105 |       throw new DOMException('Blocked', 'SecurityError');
  106 |     };
  107 |   }, storageKeys);
  108 |   await page.goto('/');
  109 |   await expect(page.locator('.notice')).toContainText('could not be read');
  110 |   await expect(page.locator('.kpi-card')).toHaveCount(9);
  111 |   await page.getByRole('button', { name: 'Edit layout', exact: true }).click();
  112 |   await page.getByRole('button', { name: 'Save layout', exact: true }).click();
  113 |   await expect(page.locator('.notice')).toContainText('Could not save');
  114 |   await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  115 | });
  116 | test('unknown category route recovers to the first category', async ({ page }) => {
  117 |   await page.goto('/#/kpis/unknown');
  118 |   await expect(page).toHaveURL(/#\/kpis\/airside-operations$/);
  119 |   await expect(page.locator('.kpi-card')).toHaveCount(9);
  120 | });
  121 |
```
