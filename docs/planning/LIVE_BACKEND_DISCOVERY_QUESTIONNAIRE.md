# AeroPulse integration with AOS: live backend discovery questionnaire

Created: 21 October 2026, 02:30 IST (UTC+05:30)  
Purpose: Collect evidence from the Airport Operations System (AOS) project so we can design, estimate, and implement AeroPulse's live backend and integration with AOS.  
Status: Discovery request; no backend, integration architecture, vendor, or release scope has been approved by this document.

## How to use this document

Give this entire document to the agent with access to the **AOS** project's code, architecture, API documentation, schemas, and operational context. Appendix A embeds the current KPI inventory so the questionnaire can be used without access to the AeroPulse repository. Referenced AeroPulse files can be supplied separately for exact adapter implementation.

### Instructions for the project-aware agent

Investigate AOS and answer the numbered questions below, including the AOS-specific questions in Section 0B. Start with the current customer branch, deployed version, database schema, adapter topology, and station context, rather than assuming that every component mentioned in the work records is present in that deployment. Work read-only: do not change code, infrastructure, permissions, or operational data during discovery. Do not provision services or deploy anything. Record secret names and mechanisms when relevant, never secret values, tokens, connection strings, or identifiable passenger records.

Distinguish these answer states:

- **Confirmed:** supported by a repository file, schema, API definition, configuration, test, or approved document.
- **Proposed:** your recommendation; include alternatives and tradeoffs.
- **Unknown:** cannot be established from available context; identify the person/system/document needed.
- **Not applicable:** explain why.
- **Conflicting:** evidence disagrees; list the conflicting sources and the owner who must resolve it.

For every question provide: **ID, answer state, answer, evidence with file path/symbol or document/API reference, integration impact, and unresolved decision/owner**. Cite relevant line numbers when available. Separate repository evidence from runtime behavior verified in an authorized environment. Do not infer that a package, configuration entry, or demo endpoint proves an operational capability exists. Do not invent field mappings, formulas, latency guarantees, infrastructure capacity, or approvals.

Use **P0** for questions that block architecture or the first live release. Other questions are required for production design; mark them **P1** for the agreed first release or **P2** if explicitly deferred. Return answers for all IDs, including unknown/not-applicable ones. Finish with the deliverables in Section 18 and a list of owner questions that cannot be answered from project context.

## 0. AeroPulse context supplied to the agent

- AeroPulse is currently a React/TypeScript/Vite static SPA, with Recharts, React Grid Layout, Radix UI, TanStack Query, Zustand, and Zod. There is no backend, database, login, or live-feed adapter in the AeroPulse application code reviewed for this handoff.
- It renders **71 KPIs in 11 operational categories**, using deterministic fixtures for the fictional Meridian International airport (`meridian`, `MDI`), fixed at **17 September 2026, 14:00 Asia/Kolkata**. These airport IDs, dimensions, timestamps, source labels, formulas, and thresholds are POC assumptions, not target-system contracts.
- The UI already supports category navigation, filtering, drag/resize, independent saved category layouts, focus/detail views, CSV export, light/dark/system themes, and EUR/USD/INR presentation preferences.
- Layouts, filters, and preferences are browser-local. Personal cross-category dashboards are planned in `CUSTOM_DASHBOARDS_IMPLEMENTATION_PLAN.md`; they are not implemented. Discovery should account for their future persistence and permissions without assuming their first-release inclusion.
- The current asynchronous adapter supports category snapshots and KPI details. Both return fixture calculations immediately. Its query configuration uses infinite staleness, no automatic retry, and no refresh on window focus. Those static policies are not a live-data specification.
- The current result model includes all underlying `rows` with the aggregate. Production may need separate bounded trend/detail queries and server-generated exports instead of sending raw operational records with each card.
- Current filters are time range (`today`, last six hours, last hour), granularity (15 minutes, hour, day), terminal, movement, carrier, runway, and resource. Options are hardcoded to fixture values. Today/time windows are tied to the fixture day and must be redesigned for real timestamps and airport calendars.
- The toolbar clock toggles **Local**, meaning the user's device timezone, and **UTC**. Operational reporting needs its own airport/business timezone semantics; do not assume the toolbar clock defines the operational day.
- Currency conversions use fixed illustrative rates. The current 71 KPIs have no monetary unit. Currency integration is conditional on approved monetary KPIs, not automatically a backend dependency.
- The existing public demo URL is `https://aeropulse.nabster-tech.workers.dev/`. A public demo's hosting does not establish where the real system or live backend should run.

Current adapter shape, supplied for compatibility analysis rather than as the final API design:

```ts
interface CategorySource {
  snapshot(
    category: CategoryId,
    filters: CategoryFilters,
    signal?: AbortSignal,
  ): Promise<CategorySnapshot>;
  details(id: KpiId, filters: CategoryFilters, signal?: AbortSignal): Promise<KpiResult>;
}

interface CategorySnapshot {
  category: CategoryId;
  asOf: string;
  version: string;
  metrics: KpiResult[];
}

interface KpiResult {
  id: KpiId;
  value: number | null;
  reference: number | null;
  numerator: number;
  denominator: number;
  state: 'ready' | 'empty' | 'not-applicable';
  rows: Observation[];
  spec: MetricSpec;
  scope: string;
  asOf: string;
}
```

`CategoryId`, `KpiId`, `CategoryFilters`, `Observation`, and `MetricSpec` are existing frontend domain types. Full models are in `src/categories/models.ts`; catalog identities are in `src/categories/catalog.ts`. Spec fields currently include unit, aggregation, provisional formula/source, supported dimensions, optional scale/target, direction of improvement, comparison label, and event/report/scenario kind.

## 0A. AOS context from the supplied work records

The following are **secondary-source discovery leads**, not findings from a review of current AOS code or a live environment. They come from these local records supplied through the resume folder:

1. `personal-projects/Resume/AOS_PROJECT_WORK_AND_RESUME_POINTS.md`, especially Sections 1–2, the ATC interface work, the mobile queue-topology investigation, and Copy Handling Agents. The record explicitly distinguishes implemented work from analysis/plans and requires release verification.
2. `personal-projects/Resume/AOS_COMPLETE_WORK_AND_CV_RECORD.md`, especially Sections 2, 4, 5, 7, and 8: architecture, TSI mappings, T2 Integration Broker, WebSwing session/security review, and build/runtime provenance.

These documents may not be available in the AOS agent's workspace. Their relevant leads are summarized here; the agent should validate them against its own repository and deployment evidence. Do not treat career-profile claims or investigated features as proof of current production behavior.

| Work-record lead                                                                                                                                         | Relevance to AeroPulse discovery                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Java 8, Oracle BC4J/ADF Business Components, Oracle Database/PLSQL, Swing and WebSwing                                                                   | Determine a supported headless API/data boundary. Browser-delivered Swing does not establish a reusable REST API or React-compatible module.                            |
| Modules named `util`, `fw`, `cdm`, `rm`, `rat`, `dfw`, `mqif`, and `jgantt`                                                                              | Locate domain ownership, business rules, integration entry points, build dependencies, and the correct extension module.                                                |
| Metadata flow involving `CatApplication.xml`, action factories, frame starters, application modules, and view objects                                    | Establish how to launch/link a separate web dashboard and how backend permissions/business rules can be reused independently of UI actions.                             |
| Operational tables named `PL_ARRIVAL`, `PL_DEPARTURE`, and `PL_TURN`; separate schedule/master and reference data                                        | Verify canonical flight-leg/turn identities, operational versus planning scenarios, station filters, and safe joins; do not derive identities from labels alone.        |
| TSI mapping of daily flight versus schedule feeds; `PA_`/`PD_` leg distinctions; multi-gate/belt allocation sequences                                    | Map source fields using actual schema/FKs and interface context; avoid counting the wrong leg, scenario, or allocation instance.                                        |
| Dynamic attributes in `PA_/PD_ADDITIONALINFO` JSON, metadata in `SY_DYNAMICATTRIBUTES`, and attribute authorization                                      | Some milestones may be customer-specific attributes rather than ordinary columns; confirm presence, permissions, type, and history per deployment.                      |
| XML/XSD/XSLT adapter graphs, MQIF, `BfwAdapter` service nodes, and references to ActiveMQ/Solace or IBM MQ/AQ, files, and SFTP in different integrations | Inventory the selected deployment's real transport and message semantics. Do not assume these broker technologies coexist or all interfaces expose full analytics data. |
| Operational/seasonal/planning scenarios, station/customer configuration, menu authorization, and resource allocations                                    | Dashboard tenancy and KPI eligibility must follow actual AOS boundaries rather than the POC's single-airport assumption.                                                |
| Gradle modules, Ant-produced `run` installations, per-customer config, `datachanges.csv`, and WebSwing app mappings                                      | Verify deployed artifacts/configuration as well as source; plan compatible migrations and rollout without assuming source changes are already running.                  |
| Prior analyses of logout/lock coverage, BC4J range-window writes, message deduplication, and queue-topology mismatches                                   | Check the relevant integration failure modes explicitly; historical investigations do not prove these defects are present now.                                          |

Do not infer that Spring Boot, PostgreSQL, Angular, or technology used in other resume projects is part of AOS. Confirm any such component in AOS before proposing reuse.

## 0B. AOS-specific questions to answer first

- **R01 [P0]:** Which AOS customer/station, modules, branches, schema version, application build, JRE, WebSwing version/application block, and deployed configuration are the integration target? Is the first rollout one airport/customer or a reusable multi-customer feature? Identify source-versus-runtime differences.
- **R02 [P0]:** How should users open AeroPulse from native Swing and from WebSwing: external browser link, authenticated new tab, same-portal navigation, or another approved mechanism? Which menu/action/configuration files and authorization functions own this, and can a standalone dashboard deployment coexist with both clients?
- **R03 [P0]:** Is there an existing supported headless AOS service boundary? Compare extending one, exposing a service around BC4J/PLSQL, using approved reporting views/read replicas, and consuming an analytics projection. Which AOS rules/permissions would each option bypass or need to reproduce? Do not select a framework solely because the frontend uses TypeScript.
- **R04 [P0]:** Which exact `PL_ARRIVAL`, `PL_DEPARTURE`, `PL_TURN`, scenario, station, and reference keys should identify eligible operations? What selects the live operational scenario, and how do we exclude planning/seasonal/test scenarios and avoid double-counting linked legs, codeshares, cancellations, and cross-day operations?
- **R05 [P0]:** Where do required scheduled, estimated, target, business, and actual milestone timestamps live for this customer? Trace units, timezone/null semantics, provenance, and schedule revisions through columns, BC4J attributes, XML mappings, and any dynamic-attribute JSON. Confirm whether all required milestones are persisted and historically recoverable.
- **R06:** If fields are dynamic attributes, how do `SY_DYNAMICATTRIBUTES`, `PA_/PD_ADDITIONALINFO`, and attribute authorization determine available values? Are `FW_UTIL.AddViewAttribute` or equivalent registration rules relevant here? What varies by customer, and can these attributes be queried safely and indexed where needed?
- **R07:** Which resource allocation tables/entities and sequence/validity fields represent stands, gates, belts, counters, closures, and virtual/master resources? How do actual versus planned intervals, repeated assignments, cancellations/cleanup jobs, and capacity rules affect utilization and availability KPIs?
- **R08 [P0]:** What existing AOS user, station, scenario, function, and field-level permissions must the API enforce? How can a web identity be validated against these rules without trusting a UI menu's visibility or accepting a station ID supplied by the browser as authorization?
- **R09 [P0]:** How should AeroPulse respond to AOS login, logout, lock/unlock, idle timeout, station/scenario switch, and identity changes across native/WebSwing windows? Is there an approved session/token bridge, or must it authenticate separately? Define how cached data and live subscriptions are cleared when access changes.
- **R10:** If BC4J is used server-side, what application-module pooling, transaction ownership, security context, passivation, thread-safety, cursor/range, fetch-size, and disposal rules apply? Can aggregate/detail queries run headlessly without sharing Swing user state, unsaved edits, or UI range-limited results?
- **R11 [P0]:** Which existing MQIF/adapter interfaces publish committed changes relevant to analytics? For the selected customer, identify actual brokers, queues/topics, filters, station/scenario keys, schemas, originators, ACK/NACK behavior, dataset/replay windows, and delivery ownership. Does each message represent an authoritative business change or a filtered integration view?
- **R12 [P0]:** How can an analytics consumer receive its own approved durable subscription or copy without competing with current operational consumers, consuming their messages, changing their acknowledgements, or sending operational commands? Demonstrate source-to-broker-to-consumer routing with the correct customer configuration and subjects.
- **R13:** Do outbound suppression/deduplication, adapter restart replay, bounded query windows, XML transforms, or originator filters omit events needed for complete metrics? What separate bootstrap/reconciliation path, checkpoint, deletion handling, and periodic validation are required for an analytics projection?
- **R14:** For TSI/T2 Integration Broker or similar feeds actually deployed here, which mappings distinguish daily flights from reference/schedule records, arrivals from departures, foreign keys from display codes, and sequenced allocations from overview strings? Which mapping specs/schemas are authoritative and versioned?
- **R15 [P0]:** Which passenger/security, baggage delivery/mishandling, safety, weather, forecast, or survey KPIs have source records beyond flight/resource allocation in this AOS deployment? For example, belt allocation does not establish bag-delivery timestamps or queue wait observations. Identify missing external feeds explicitly rather than deriving unavailable metrics from unrelated AOS fields.
- **R16:** What read-only Oracle access or service permissions, query plans/indexes, reporting isolation, incremental extraction markers, transaction consistency, and driver/database-version constraints are approved? Can modified-time polling capture every correction/delete, and what evidence supports that? Assess CDC/log-based options only if available, licensed, and operationally approved.
- **R17:** What Java 8/module compatibility, new-service runtime allowance, Gradle/Ant packaging, signed artifact requirements, customer-specific configuration copies, `datachanges.csv` migration sequence, source registration, and rollback steps would apply? Which Jenkins/GitLab or other current pipeline actually releases these changes?
- **R18:** Which authoritative AOS reports/views can reconcile the first live KPI slice? Confirm actual deployed query/template versions where reports are used as an oracle, including database-stored compiled templates if applicable. Which unit, database, broker, and customer integration environments can validate the complete path?

Return an AOS-specific comparison of integration options with reuse, permission coverage, correctness, source load, deployment compatibility, and operational burden. The work records establish investigation starting points; the current project's evidence must determine the architecture.

## 1. Product boundaries and launch scope

- **A01 [P0]:** What is the actual target project, repository/service structure, business purpose, and current deployment topology? Which repositories or services are outside your available context?
- **A02 [P0]:** Is AeroPulse being embedded in the existing application's shell, added as a route/module, deployed as a separate authenticated SPA, or delivered through an iframe/microfrontend? What determines that choice, and who owns routing, navigation, styling, dependency compatibility, and releases?
- **A03 [P0]:** Who will use it: operations-room staff, airport management, airlines, handlers, administrators, external customers, or public users? Which user journeys and decisions must the first live release support?
- **A04 [P0]:** Is this read-only analytics, or are acknowledgements, assignments, alerts, recommendations, exports, and operational commands expected? Identify each write action and the owning backend; distinguish viewing a scenario from dispatching resources.
- **A05 [P0]:** Which airports, tenants, categories, and specific KPI IDs are in the first live slice? Must all 71 launch together? Define accepted behavior for unsupported or unavailable KPIs; production must not silently substitute fixture values.
- **A06:** Who accepts delivery, and what timeline, staffing, budget, procurement, licensing, operational criticality, and availability constraints shape the scope? What is explicitly excluded?

## 2. Existing backend and reuse opportunities

- **B01 [P0]:** What runtimes, frameworks, service conventions, API gateway, databases, schema/migration tools, workers/schedulers, and deployment patterns are already used? Cite actual services and versions where evidenced.
- **B02 [P0]:** Which existing APIs, aggregates, authentication middleware, authorization rules, reference-data services, audit systems, and preference services can AeroPulse reuse? Which are documented interfaces versus internal implementation details?
- **B03:** Is there an established API style and contract registry: REST/OpenAPI, GraphQL, RPC, events/schema registry, SDKs, or generated clients? What compatibility and deprecation rules apply?
- **B04 [P0]:** Can AeroPulse access an existing reporting/analytics database or read replica? Are direct reads permitted, and how will analytics workloads be isolated from transactional operations?
- **B05:** Is there an existing data warehouse/lake, ETL/ELT pipeline, metric/semantic layer, or business intelligence definition that already owns these calculations? What can be reused without duplicating business logic?
- **B06:** What constraints apply to adding services, languages, packages, message infrastructure, or databases? Should the integration be a module in the existing backend, a backend-for-frontend, a separate analytics service, or a combination? Give evidence-based options rather than assuming a new stack.

## 3. Source systems, access, and ingestion

- **C01 [P0]:** For each KPI family, what is the authoritative source: airport operational database, flight/turnaround system, airport collaborative decision-making platform, resource system, baggage system, passenger/queue sensors, safety/incident system, weather service, or reporting platform? Identify product/service, owner, and the exact interface or table/topic when known.
- **C02 [P0]:** How can each source be consumed: existing aggregates, REST/GraphQL, webhook, message subscription, change-data capture, scheduled files, or database query? Which modes are approved, supported, and accessible from the intended deployment network?
- **C03 [P0]:** What access approval, service identity, endpoint discovery, private networking, certificate, allowlist, vendor license, contract, and data-use rights are required? Which integrations already have test access?
- **C04:** What are each source's publication cadence, rate/concurrency limits, pagination/cursors, payload size, batch support, ordering guarantees, and historical query limits? Does “live” mean event publication or periodically refreshed snapshots?
- **C05 [P0]:** What sample schemas and sanitized payloads exist for normal events, updates/corrections, deletion/cancellation, empty results, missing fields, and errors? Identify schema versions, optional fields, enum meanings, units, and timestamp formats.
- **C06:** What happens on duplicates, out-of-order events, sequence gaps, disconnects, and expired cursors? Are stable event IDs, entity revisions, replay, backfill, and upstream retention available?
- **C07:** How do we obtain initial history and a consistent starting snapshot before incremental ingestion? Can backfills run without exhausting upstream capacity or changing current totals incorrectly?
- **C08:** Who operates ingestion failures, quarantine/dead-letter handling, vendor escalation, source credential rotation, and schema changes? Which source dependencies or commercial terms block a live pilot?

Return a source inventory with: source ID/name, domain/KPI IDs, owner, interface, access state, schema evidence, cadence/latency, limits, retention/replay, network boundary, and outstanding dependencies.

## 4. Entity mapping and reference data

- **D01 [P0]:** What are the stable keys for tenant, airport, terminal, stand/gate, runway, airline/carrier, flight leg, turnaround, aircraft, resource, baggage event, queue checkpoint, incident, and weather observation? Which identifiers are local, vendor-specific, or globally unique?
- **D02 [P0]:** How are flight legs and turnarounds joined across sources, including codeshares, reused flight numbers, diversions, returns to stand, midnight crossings, cancellations, and aircraft swaps? Where is the authoritative linkage?
- **D03:** Where do active filter options come from, and how are they permission-scoped, airport-specific, and effective-dated? How are renamed terminals, reconfigured runways, retired resources, and historic entity names represented?
- **D04:** How are base/hub carriers, aircraft types, movement directions, resource classes, milestones, incident severities, capacity, and planned targets maintained? Who approves changes and resolves conflicting classifications?
- **D05:** Which fields are personally identifiable, commercially sensitive, safety-sensitive, or restricted? What aggregate/detail/lineage data can each audience receive, and can synthetic or sanitized representative data be supplied for development?

## 5. KPI definition and feasibility workbook

- **E01 [P0]:** For every KPI in Appendix A, is it already available, derivable, missing a source, unsupported, or definition-blocked? Identify exact source fields, authoritative formula, owner, and evidence. Do not treat the fixture's formula as approved.
- **E02 [P0]:** What are the exact numerator, denominator, population, grouping, units, scale, event/milestone timestamps, inclusion/exclusion rules, null/zero behavior, and minimum valid sample size? For averages, are sample-weighted values required? For rates, what exposure denominator and multiplier apply?
- **E03 [P0]:** What defines on-time/adherence and delay for each milestone? Which schedule baseline applies: original, latest revised, target, or frozen reference? Are early events signed, clamped, or excluded, and what happens to pending/cancelled/diverted flights?
- **E04:** How are occupancy/utilization computed from overlapping intervals, planned capacity, closures, maintenance, weather restrictions, and changing operating hours? What event pairs define turnaround, wait, processing, baggage, and incident-response duration?
- **E05:** Which KPIs require forecasts, simulations, surveys, external benchmarks, manual inputs, reports, or predictive models? Are these actual services or only future requirements? For models, identify version, inference cadence, horizon, validity, confidence, and fallback behavior.
- **E06:** What thresholds, targets, tolerances, direction-of-improvement rules, comparison periods, and aggregation granularities apply per airport/carrier/aircraft type? Are they effective-dated and configurable, and by whom?
- **E07 [P0]:** Which existing reports/source totals are the reconciliation oracle? What test periods, edge cases, accepted tolerance, lineage, and business-owner signoff establish correctness for each launch KPI?
- **E08:** Where should computation run: reuse an existing metric service, compute on demand, incremental aggregation, scheduled materialization, or a hybrid? Compare freshness, reproducibility, correction handling, source load, and cost using actual volumes.

Return one workbook record for **each of the 71 stable KPI IDs**, containing:

`kpiId; exact title; launch priority; feasibility status; business owner; source system/interface/table/topic; required field mappings and joins; formula/version; numerator/denominator/population; units; supported dimensions; time/calendar semantics; exclusions; null/zero/quality rules; target/threshold source; aggregate/trend/detail shape; freshness target; reconciliation evidence; blockers and owner`.

Mark unknown fields explicitly. If only a subset is currently feasible, still account for every KPI so coverage gaps remain visible.

## 6. Time, freshness, and historical correctness

- **F01 [P0]:** What are the airport IANA timezones, operational-day boundaries, reporting calendars, and shift definitions? How do they differ from a viewer's Local/UTC clock? How are daylight-saving transitions and cross-midnight flight operations handled?
- **F02 [P0]:** For every source/KPI, what do event time, source update time, ingestion time, calculation time, and response time mean? Which timestamp should the UI display, and how do we detect clock skew or a source that stopped publishing?
- **F03 [P0]:** What end-to-end freshness targets and stale/unavailable thresholds are required per KPI? Distinguish source delay, ingestion delay, processing delay, network delivery, and rendering; “updates every five seconds” alone is not an end-to-end freshness guarantee.
- **F04:** Are windows rolling, calendar-based, completed buckets only, or current partial buckets? Define inclusive/exclusive endpoints, snapshot consistency, bucket alignment, data completeness, and whether all cards need a common as-of watermark.
- **F05:** How late can events arrive or be corrected, and how long can finalized KPIs change? What recomputation/backfill, audit/version history, and cache invalidation apply to late arrivals and schedule revisions?
- **F06:** What history lengths and granularities must users query? What are raw-event, aggregate, export, audit, and deleted-configuration retention periods, and which policies/legal obligations establish them?

## 7. API and frontend integration contracts

- **G01 [P0]:** What authenticated API boundary should the browser call, and who owns its contract? Should it reuse existing endpoints or expose a dashboard-oriented aggregate interface? How is the browser prevented from needing operational source credentials or raw cross-system joins?
- **G02 [P0]:** How should the API request arbitrary KPI selections across categories, tenant/airport scope, absolute start/end timestamps, granularity, dimensions, and comparison periods? How are unsupported filters rejected or normalized, and how are effective scopes returned per metric?
- **G03 [P0]:** What response envelope contains value/unit, numerator/denominator, formula/catalog version, source/lineage, targets, per-metric timestamps, completeness, effective scope, and item-level errors? Which states distinguish zero, no eligible data, not applicable, stale, source unavailable, and forbidden?
- **G04:** How are trend series, grouped breakdowns, event rows, and raw details requested separately and bounded? Specify cursors/pagination, stable sort order, maximum rows/series/groups/date ranges, downsampling, precision, and safe numeric serialization.
- **G05:** Are batch requests all-or-nothing or partial-success? How do request timeouts, cancellation, retries, idempotency where relevant, correlation IDs, structured error codes, and rate-limit responses behave?
- **G06:** What provides authorized airport/reference-data/filter options and KPI metadata? How are catalog/schema versions discovered, validated, cached, and rolled out without breaking older frontend deployments?
- **G07:** Should CSV exports be browser-generated from bounded results or server-side jobs for large/sensitive datasets? How are exports scoped, audited, limited, expired, safely escaped, and made consistent with the exact screen filters/as-of time?
- **G08:** What must change in AeroPulse's adapter/types to support the real contract? Call out fixture-minute timestamps, bundled `rows`, hardcoded dimensions/airport, static snapshot labels, provisional specs, infinite staleness, retry policy, and browser cache isolation.

Return candidate endpoint/operation contracts with sanitized request/response examples for: session/context, permitted airports/reference data/catalog, batch summaries, trends, paginated details, source health/freshness, and exports. Include an OpenAPI/JSON Schema or the project's equivalent contract outline. Distinguish existing endpoints from proposed ones.

## 8. Live delivery, polling, and recovery

- **H01 [P0]:** Which KPI latency requirements actually require streaming, and which can use polling? What existing gateway/proxy, browser, connection-count, idle-timeout, authentication, and platform constraints affect polling, server-sent events, or WebSockets?
- **H02:** If polling is selected, what cadence, jitter, visibility/offline pause, conditional request/cache strategy, retry backoff, and source-load budget apply? How is a stalled request prevented from overlapping indefinitely?
- **H03:** If streaming is selected, what are the subscription scope, payload version, snapshot-versus-delta semantics, sequence/cursor, heartbeat, replay retention, gap detection, deduplication, and backpressure/coalescing rules?
- **H04 [P0]:** How does the client bootstrap a snapshot and start live updates without missing or duplicating a change between those steps? What happens after lost connectivity, expired replay position, expired login, permission change, or airport switch?
- **H05:** How should a stale or disconnected dashboard behave: retain a labeled last-known value, blank specific cards, disable export, or another agreed policy? How can the user distinguish a working live connection from fresh upstream data?
- **H06:** What soak/reconnect/load testing and measurable acceptance targets establish correct live delivery? Which components own connection health and upstream freshness alerts?

## 9. Identity, tenancy, authorization, and application embedding

- **I01 [P0]:** What identity provider and login/session flow already exist? How does an embedded or separate AeroPulse app obtain identity using approved mechanisms, including session renewal, logout, redirect/base-path behavior, and idle timeout?
- **I02 [P0]:** What is the tenancy model, and how is the allowed organization/airport scope derived on the server? What stops a caller from changing a request's airport, dashboard, export, or KPI ID to access another scope?
- **I03 [P0]:** What roles/attributes control category visibility, KPI access, underlying detail, export, dashboard editing/sharing, administration, and sensitive source data? Provide an authorization matrix and existing enforcement locations.
- **I04:** If embedding or multiple origins are involved, what are the CORS, cookie, CSRF, content-security-policy/frame, trusted-origin, token-handling, and API routing requirements? How are browser credentials kept separate from service-to-service source credentials?
- **I05:** Can shared operations-room screens/kiosk sessions be used, and how are they authenticated, restricted, renewed, and revoked? Are offline or public views allowed at all?
- **I06:** How do account changes, permission revocation, logout, and tenant switches invalidate frontend/server caches, subscriptions, downloads, and remembered configuration? Which operations need audit records?

## 10. Server persistence for categories, custom dashboards, and preferences

- **J01 [P0]:** Which configuration must follow a user across devices: existing category layouts, custom dashboards, filters, theme, currency, timezone preference, default landing view, and sidebar state? Which should remain per-device or per-session?
- **J02:** Should custom dashboards be private, shared with named users/roles, airport-wide, team templates, or public? What are viewer/editor/owner permissions, ownership-transfer rules, and behavior when an owner leaves?
- **J03:** Can an existing user-preferences/document service store versioned dashboards and widget layouts, or is a new schema needed? What document/entity keys and tenant/airport constraints prevent accidental mixing?
- **J04:** How will revisions/ETags, conditional writes, concurrent edits, Save/Cancel drafts, rename/delete/duplicate operations, soft deletion, history, and recovery work? Is real-time collaborative editing required, or are explicit conflicts acceptable?
- **J05:** How are widget IDs, KPI references, responsive coordinates, display settings, size limits, future per-widget filters, retired KPIs, and unauthorized KPI references validated and migrated server-side?
- **J06:** Should current browser-local layouts/preferences be offered for one-time import after login? How are schema compatibility, provenance, user consent, conflicts, domain changes, and browser configurations from different users handled?

Return a proposed configuration schema with ownership/scope, version/revision fields, validation, permissions, API operations, and a migration approach. Treat custom dashboard functionality as planned scope to confirm.

## 11. Storage, processing architecture, and scale

- **K01 [P0]:** What are measured or estimated airports, concurrent users/screens, selected KPIs per screen, ingestion events per second/peak, event sizes, history volume, export sizes, and query patterns? Label estimates and their source; include expected growth.
- **K02:** What are the existing database/storage capabilities, indexing/partitioning approaches, connection limits, read replicas, retention policies, and backup tools? How do time-series queries, joins, corrections, and tenant isolation fit them?
- **K03:** Which stages need durable ingestion, normalization, aggregation, materialized views, caches, or scheduled jobs? Which can use existing infrastructure? Define delivery/idempotency guarantees and replay checkpoints for each boundary.
- **K04:** How are cache keys partitioned by tenant, airport, access scope, formula version, filters, window, and data watermark? What invalidates them on corrections, role changes, target changes, or catalog releases?
- **K05:** What bounds query cost and protects sources: indexes, preaggregation, date/group/row caps, rate limits, quotas, backpressure, export queues, and per-tenant fairness? How is cache stampede avoided?
- **K06:** What are the workload-based alternatives for backend/runtime/database/event transport, their fit with the existing platform, operational burden, capacity/cost assumptions, and migration costs? Identify which decisions need a benchmark before selection.

## 12. Hosting, networking, delivery, and environment configuration

- **L01 [P0]:** Where does the actual project run today, and where must frontend, APIs, processors, and storage run? Is the existing Workers demo retained, moved, or restricted? Are sources reachable only on-premises or through private connectivity?
- **L02:** Which development, integration, staging, and production environments exist? How are domains, TLS, ingress, DNS, service discovery, firewall rules, source allowlists, and deployment regions managed?
- **L03:** What are the approved secret-management, service-account, rotation, certificate, environment-variable, and configuration-discovery conventions? Supply required variable/binding names and ownership, not values. Which configuration can be public in the Vite bundle?
- **L04:** What CI/CD checks, migration order, backward-compatible contract rollout, feature flags, staged exposure, health gates, rollback, and infrastructure-as-code conventions must this project use?
- **L05:** What network egress, runtime duration, connection, scheduler, storage, regional residency, and disaster-recovery constraints affect the design? Are there mandatory vendors, account boundaries, or procurement dependencies?

## 13. Security, data handling, and governance

- **M01 [P0]:** What organizational data classifications, contractual obligations, jurisdiction/residency requirements, retention/deletion policies, and security review gates apply? Identify confirmed requirements and owners rather than assuming a certification is mandatory.
- **M02:** What is the threat model across browser, application API, operational sources, ingestion workers, storage, exports, and admin actions? Where are trust boundaries, least-privilege policies, encryption/key management, and source request validation enforced?
- **M03:** What controls prevent injection, unauthorized object access, unbounded queries, unsafe exports, credential exposure, malicious incoming events, and sensitive data leakage through logs or error messages? Which existing middleware/tools cover them?
- **M04:** Which activities require auditability, how are actor/scope/request IDs recorded, and what access/retention/tamper controls apply? Who reviews incidents and security findings before launch?

## 14. Reliability, observability, and operating ownership

- **N01 [P0]:** What are the required API availability, percentile response latency, per-KPI freshness/completeness, recovery-time objective, and recovery-point objective? Which are established commitments versus targets awaiting agreement?
- **N02:** What logs, metrics, and traces already exist? How will request correlation, source lag, ingestion backlog, missing sequences, calculation errors, stale cards, cache behavior, export failures, and client failures be observed without logging sensitive payloads?
- **N03:** How should source-specific failure degrade service, and what timeouts, retry/backoff limits, circuit-breaking, overload handling, dead-letter recovery, and dependency isolation are needed?
- **N04:** Who owns alerts/on-call, source-provider escalation, dashboard/backend support, runbooks, replay/backfill, schema drift, target changes, and formula approvals? What operational staffing is actually available?
- **N05:** What backups and restore drills exist, and how will restoration reconcile replay positions, aggregates, permissions, and user dashboards? Can recovery be tested outside production?

## 15. Validation, environments, and acceptance evidence

- **O01 [P0]:** What authorized sandbox, sanitized history, source simulator, reference reports, and test identities are available to validate the first live slice? What cannot be exercised until a source owner provides access?
- **O02:** How will API contract/schema tests, deterministic KPI golden datasets, formula reconciliation, midnight/DST/late-event tests, and correction replay tests be organized? Which existing tests cover these behaviors, and what gaps remain?
- **O03:** What end-to-end scenarios cover login expiry, forbidden tenant/airport/KPI access, filter scope, partial sources, stale data, reconnect/gap recovery, exports, concurrent dashboard saves, and storage/service failures?
- **O04:** What realistic load/soak, burst, failure-injection, backfill, and restore tests are required? Define datasets, concurrency, duration, acceptance thresholds, and safe environments rather than asserting current capacity.
- **O05:** Who signs off on domain accuracy, security, operations, accessibility/browser support, and user acceptance? What evidence and rollback criteria are required to enter live pilot and then production?

## 16. Conditional capabilities and future scope

- **P01:** If monetary KPIs are added, which currencies, authoritative FX source, valuation date, precision/rounding, historical restatement rules, permissions, and stale-rate behavior apply? Otherwise mark FX integration not applicable to the initial 71-KPI scope.
- **P02:** Are alert rules/notifications, scheduled reports, saved views, external sharing, or write-back planned? For each, identify channel, delivery guarantees, acknowledgement/audit rules, recipients' permissions, and owner; do not include it in the first release without confirmed scope.
- **P03:** Are forecast/scenario outputs already generated by the target project? What provenance and caveats distinguish observed, predicted, recommended, and manually overridden values, and what approval is required before acting on them?
- **P04:** Is offline use required? If so, what data may be cached, for how long, under which identity, with which encryption/expiry/revocation behavior? If not, specify the online-only degraded experience.

## 17. First live slice and implementation dependencies

- **Q01 [P0]:** Which 3–5 KPIs form the smallest useful first integration, based on source availability and approved definitions? Include at least one time-based metric and one filtered rate where feasible; explain any different choice.
- **Q02 [P0]:** What is the dependency order from source approvals and credentials through contract/schema work, ingestion, calculation, API, frontend adapter, login/permissions, and deployment? Which dependencies are on the critical path and who owns them?
- **Q03:** Propose a staged delivery: local integration with sanitized data, authenticated staging with real upstreams, reconciliation/shadow observation, limited live pilot, and broader production. Define entry/exit criteria, rollback, and explicit remaining mock functionality at each stage.
- **Q04:** What work is required in the existing project versus AeroPulse, and can the existing project's agent implement/provide API contracts and services without merging frontend repositories? Identify code locations and ownership boundaries.
- **Q05:** What effort ranges, staffing, source lead times, recurring costs, and unresolved assumptions apply to each stage? Separate engineering effort from vendor/access/approval waiting time; express confidence and what would change the estimate.

## 18. Required response package

Return a document named `AEROPULSE_AOS_BACKEND_DISCOVERY_ANSWERS_<YYYY-MM-DD>.md` with:

1. **Executive findings:** AOS deployment/customer scope, existing capabilities, reusable services, the proposed integration mode, and the P0 blockers. Distinguish facts from proposals and work-record leads from code/runtime evidence.
2. **Question-by-question answers:** preserve every question ID and the evidence/status/impact/owner format specified above.
3. **Current system diagram and proposed integration diagram:** show native Swing/WebSwing entry points, AOS module/service boundaries, Oracle, actual adapter/broker flows, the React browser, identity, API boundary, processing, stores, trust boundaries, and deployment/network locations; label unknown components.
4. **Source inventory and data-flow mapping:** source access, ownership, availability, cadence, schemas, joins, correction/replay behavior, and source-to-KPI dependencies.
5. **71-KPI feasibility/definition workbook:** one record per Appendix A ID with the fields in Section 5; include coverage totals and launch candidates.
6. **API contract outline:** existing versus proposed endpoints, schema/versioning, sanitized examples, auth/scope, pagination, effective filters, item errors, freshness, and limits.
7. **Identity and authorization matrix:** audiences/roles against tenant, airport, KPI, details, exports, and dashboard operations.
8. **Persistence and migration proposal:** operational data/aggregate storage plus separate user dashboard/preference schemas, ownership, revisions, and browser-preference migration.
9. **Live update decision:** polling/streaming options, evidence-based recommendation, latency/load assumptions, bootstrap consistency, reconnect, gaps, and degraded states.
10. **Integration gap list for AeroPulse:** actual frontend/configuration changes, adapter compatibility, fixture assumptions to remove, and what can remain unchanged.
11. **Nonfunctional requirements and operating model:** measurable reliability/freshness/latency targets, security/data governance, testing, observability, recovery, support, and costs.
12. **Delivery plan and decision register:** dependencies, phased work split between repositories/teams, first-live-slice acceptance criteria, estimates with confidence, prioritized risks, and unresolved owner questions.

Summarize each blocking decision in a table: `decision ID | question IDs | options | evidence | recommendation | approver/owner | dependency | required-by stage | status`.

If evidence is insufficient, supply a useful partial answer and a precise request for the missing artifact or owner decision. Do not claim the backend is ready because the frontend has an adapter, or that a demo is live telemetry because it is publicly deployed.

## Appendix A. Exact current KPI inventory

These IDs and titles are the frontend integration inventory. Titles do not establish approved formulas or guarantee that a matching source exists. Preserve the IDs when building the feasibility workbook. The authoritative requirements archive in the AeroPulse repository is `docs/planning/KPI_REQUIREMENTS.tsv`; the IDs come from `src/categories/catalog.ts`.

| KPI ID                      | Category                   | Exact KPI title                                         |
| --------------------------- | -------------------------- | ------------------------------------------------------- |
| `ao-otp-all`                | Airside Operations         | On-Time Performance (OTP) – All Flights                 |
| `ao-otp-base`               | Airside Operations         | OTP – Base/Hub Carrier Flights                          |
| `ao-sobt`                   | Airside Operations         | SOBT Adherence                                          |
| `ao-sibt`                   | Airside Operations         | SIBT Adherence                                          |
| `ao-aobt`                   | Airside Operations         | AOBT Deviation                                          |
| `ao-aibt`                   | Airside Operations         | AIBT Deviation                                          |
| `ao-base-delay-60`          | Airside Operations         | Base Flight Delay >60 min                               |
| `ao-departure-delay`        | Airside Operations         | Average Departure Delay                                 |
| `ao-arrival-delay`          | Airside Operations         | Average Arrival Delay                                   |
| `tm-turnaround-time`        | Turnaround Management      | Aircraft Turnaround Time                                |
| `tm-milestones`             | Turnaround Management      | Turnaround Milestone Adherence                          |
| `tm-turnaround-delay`       | Turnaround Management      | Aircraft Turnaround Delay                               |
| `tm-tobt`                   | Turnaround Management      | TOBT Adherence                                          |
| `tm-tsat`                   | Turnaround Management      | TSAT Adherence                                          |
| `tm-ground-time`            | Turnaround Management      | Ground Time Utilization                                 |
| `ro-utilization`            | Runway Operations          | Runway Utilization                                      |
| `ro-occupancy`              | Runway Operations          | Runway Occupancy Time                                   |
| `ro-incursions`             | Runway Operations          | Runway Incursion Events                                 |
| `ro-configuration`          | Runway Operations          | Runway Configuration Utilization                        |
| `ro-capacity`               | Runway Operations          | Runway Capacity Utilization                             |
| `ro-throughput`             | Runway Operations          | Arrival/Departure Throughput                            |
| `ap-occupancy`              | Apron Operations           | Apron Occupancy Rate                                    |
| `ap-congestion`             | Apron Operations           | Apron Congestion Index                                  |
| `ap-stand-utilization`      | Apron Operations           | Stand Utilization                                       |
| `ap-allocation-conflicts`   | Apron Operations           | Stand Allocation Conflicts                              |
| `ap-vdgs`                   | Apron Operations           | VDGS Compliance                                         |
| `ap-taxi-time`              | Apron Operations           | Aircraft Taxi Time                                      |
| `ap-taxi-deviation`         | Apron Operations           | Taxi-Time Deviation                                     |
| `ap-taxiway-congestion`     | Apron Operations           | Taxiway Congestion                                      |
| `ap-taxi-proximity`         | Apron Operations           | Aircraft Taxiing Proximity Events                       |
| `as-incursion-rate`         | Airside Safety             | Runway Incursion Rate                                   |
| `as-aircraft-vehicle`       | Airside Safety             | Aircraft–Vehicle Conflict Events                        |
| `as-aircraft-aircraft`      | Airside Safety             | Aircraft–Aircraft Proximity Events                      |
| `as-aircraft-obstacle`      | Airside Safety             | Aircraft–Structure/Obstacle Events                      |
| `as-fod`                    | Airside Safety             | FOD Detection/Response Time                             |
| `as-wildlife`               | Airside Safety             | Wildlife Strike/Event Rate                              |
| `as-follow-me-availability` | Airside Safety             | Follow-Me Vehicle Availability                          |
| `as-follow-me-response`     | Airside Safety             | Follow-Me Response Time                                 |
| `gs-gpu`                    | Ground Support / Resources | GPU Utilization                                         |
| `gs-apu-gpu`                | Ground Support / Resources | APU Usage vs. GPU Availability                          |
| `gs-pbb`                    | Ground Support / Resources | PBB Utilization                                         |
| `gs-pbb-idle`               | Ground Support / Resources | PBB Idle Time                                           |
| `gs-resource-utilization`   | Ground Support / Resources | Airside Resource Utilization                            |
| `gs-allocation-success`     | Ground Support / Resources | Resource Allocation Success Rate                        |
| `wl-compliance`             | Weather / LVP              | LVP Activation Compliance                               |
| `wl-timeliness`             | Weather / LVP              | LVP Activation/Deactivation Timeliness                  |
| `wl-rvr`                    | Weather / LVP              | RVR Availability                                        |
| `wl-metar-availability`     | Weather / LVP              | METAR Availability Rate                                 |
| `wl-metar-timeliness`       | Weather / LVP              | METAR Issuance Timeliness                               |
| `wl-delay`                  | Weather / LVP              | Weather-Related Delay %                                 |
| `wl-disruption`             | Weather / LVP              | Weather Disruption Duration                             |
| `oe-capacity`               | Operational Efficiency     | Airside Capacity Utilization                            |
| `oe-stand-efficiency`       | Operational Efficiency     | Aircraft Stand Turnaround Efficiency                    |
| `oe-taxi-efficiency`        | Operational Efficiency     | Taxi Efficiency                                         |
| `oe-reallocation`           | Operational Efficiency     | Gate/Stand Reallocation Rate                            |
| `oe-recovery`               | Operational Efficiency     | Operational Disruption Recovery Time                    |
| `ra-resource-report`        | Reporting & Analytics      | Granularity Reports – Resource Utilization              |
| `ra-feed-failure`           | Reporting & Analytics      | Data-Feed Failure Rate                                  |
| `ra-drills`                 | Reporting & Analytics      | Emergency Drill Completion Rate                         |
| `to-bags`                   | Terminal Operations        | First Bag & Last Bag Delivery Time                      |
| `to-cute`                   | Terminal Operations        | CUTE (Airline Check-in Counter) Utilization             |
| `to-reconciliation`         | Terminal Operations        | Baggage Reconciliation Accuracy                         |
| `to-runway-report-accuracy` | Terminal Operations        | Runway Utilization Report Accuracy                      |
| `to-predictive-flow`        | Terminal Operations        | Predictive Passenger Flow & Dynamic Resource Allocation |
| `pf-throughput`             | Passenger Flow             | Passenger Throughput vs. Terminal Capacity              |
| `pf-boarding`               | Passenger Flow             | Processing Time - Boarding Gate                         |
| `pf-immigration-processing` | Passenger Flow             | Processing Time - Immigration                           |
| `pf-checkin-wait`           | Passenger Flow             | Check-in Queue Wait Time                                |
| `pf-security-wait`          | Passenger Flow             | Security Queue Wait Time                                |
| `pf-immigration-wait`       | Passenger Flow             | Immigration Queue Wait Time                             |
| `pf-satisfaction`           | Passenger Flow             | Passenger Satisfaction Index                            |
