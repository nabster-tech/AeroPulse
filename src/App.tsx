import { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Menu from '@radix-ui/react-dropdown-menu';
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Grip,
  HelpCircle,
  LayoutDashboard,
  Menu as MenuIcon,
  Navigation,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { airport, defaultFilters, number, rangeLabels, snapshotLabel, terminals } from './config';
import { categories, definitions, registry } from './widgetRegistry';
import { useTelemetry } from './data/useTelemetry';
import { useWorkspace } from './layout/layoutStore';
import type { Category, Filters, Snapshot, WidgetId } from './types';
import { DashboardGrid } from './components/DashboardGrid';
import { FocusDialog } from './components/FocusDialog';
import { useDesktop } from './components/useDesktop';
function exportSnapshot(snapshot: Snapshot, filters: Filters) {
  const rows = [
    ['Metric', 'Value', 'Unit', 'State', 'Scope', 'Window', 'As of', 'Mode'],
    ...definitions.map((d) => {
      const m = snapshot.widgets[d.id];
      return [
        d.title,
        m.state === 'ready' ? String(m.value) : '',
        m.unit,
        m.state,
        m.scope,
        rangeLabels[filters.range],
        snapshot.asOf,
        'Static demo',
      ];
    }),
  ];
  const csv = rows
    .map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download =
    'airside-meridian-' + filters.range + '-' + filters.terminal + '-' + filters.movement + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [collapsed, setCollapsed] = useState(false),
    [mobileOpen, setMobileOpen] = useState(false);
  const [focused, setFocused] = useState<{ id: WidgetId; trigger: HTMLElement } | null>(null);
  const isDesktop = useDesktop();
  const query = useTelemetry(filters);
  useEffect(() => {
    if (!mobileOpen || isDesktop) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector<HTMLButtonElement>('.sidebar-close')?.focus();
    return () => {
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => previous?.focus());
    };
  }, [mobileOpen, isDesktop]);
  const doc = useWorkspace((s) => s.draft ?? s.document),
    editing = useWorkspace((s) => s.draft !== null),
    notice = useWorkspace((s) => s.notice),
    lastHidden = useWorkspace((s) => s.lastHidden);
  const begin = useWorkspace((s) => s.begin),
    cancel = useWorkspace((s) => s.cancel),
    save = useWorkspace((s) => s.save),
    reset = useWorkspace((s) => s.reset),
    restore = useWorkspace((s) => s.restore),
    clearNotice = useWorkspace((s) => s.clearNotice);
  const focus = useCallback(
    (id: WidgetId, trigger: HTMLElement) => setFocused({ id, trigger }),
    [],
  );
  const navigate = (id: Category | 'all') => {
    setCategory(id);
    setMobileOpen(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
      return;
    }
    const positions = doc.layouts.desktop
      .filter((p) => !doc.hidden.includes(p.i))
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const target = positions.find((p) => registry[p.i].category === id);
    if (target)
      document
        .getElementById('widget-' + target.i)
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  };
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const attention = query.data?.widgets.security.data.rows.find(
    (r) => r.terminal === 't2' && r.label.includes('North'),
  );
  return (
    <div
      className={
        'app-shell ' + (collapsed ? 'sidebar-collapsed ' : '') + (mobileOpen ? 'mobile-open' : '')
      }
    >
      <a href="#main-content" className="skip-link">
        Skip to dashboard
      </a>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      <aside
        className="sidebar"
        aria-label="Workspace navigation and filters"
        role={isDesktop ? 'complementary' : 'dialog'}
        aria-modal={!isDesktop && mobileOpen ? true : undefined}
        aria-hidden={isDesktop ? collapsed : !mobileOpen}
        inert={isDesktop ? collapsed : !mobileOpen}
        onKeyDown={(e) => {
          if (isDesktop || !mobileOpen) return;
          if (e.key === 'Escape') {
            e.preventDefault();
            setMobileOpen(false);
          }
          if (e.key === 'Tab') {
            const focusable = [
              ...e.currentTarget.querySelectorAll<HTMLElement>(
                'a[href],button:not([disabled]),select',
              ),
            ].filter((el) => el.offsetParent !== null);
            const first = focusable[0],
              last = focusable.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <button
          className="icon-button sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
        <a className="brand" href="#main-content" onClick={() => navigate('all')}>
          <span className="brand-mark">
            <Navigation size={24} fill="currentColor" />
          </span>
          <span>
            airside<span className="brand-period">.</span>
          </span>
        </a>
        <div className="airport-selector">
          <span className="airport-code">{airport.code}</span>
          <div>
            <strong>Meridian International</strong>
            <span>Airport operations center</span>
          </div>
          <span className="airport-status" title="Demo workspace" />
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="navigation">
          <button
            className={category === 'all' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate('all')}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
            <span className="nav-count">{13 - doc.hidden.length}</span>
          </button>
          {categories.map((c) => (
            <button
              className={'nav-item ' + (category === c.id ? 'active' : '')}
              key={c.id}
              onClick={() => navigate(c.id)}
            >
              <c.icon size={17} />
              <span>{c.short}</span>
              <span className="nav-count">
                {
                  definitions.filter((d) => d.category === c.id && !doc.hidden.includes(d.id))
                    .length
                }
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-filters">
          <div className="sidebar-label">
            <span>GLOBAL FILTERS</span>
            <SlidersHorizontal size={12} />
          </div>
          <label className="filter-label" htmlFor="time-range">
            Time window
          </label>
          <select
            id="time-range"
            value={filters.range}
            onChange={(e) => updateFilter('range', e.target.value as Filters['range'])}
          >
            {Object.entries(rangeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="filter-label" htmlFor="terminal">
            Terminal
          </label>
          <select
            id="terminal"
            value={filters.terminal}
            onChange={(e) => updateFilter('terminal', e.target.value as Filters['terminal'])}
          >
            <option value="all">All terminals</option>
            {Object.entries(terminals).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="filter-label" htmlFor="movement">
            Movement
          </label>
          <select
            id="movement"
            value={filters.movement}
            onChange={(e) => updateFilter('movement', e.target.value as Filters['movement'])}
          >
            <option value="all">All movements</option>
            <option value="arrivals">Arrivals</option>
            <option value="departures">Departures</option>
          </select>
          <button className="reset-filters" onClick={() => setFilters(defaultFilters)}>
            <RotateCcw size={12} />
            Reset filters
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="demo-panel">
            <span className="demo-orbit">
              <Activity size={15} />
            </span>
            <div>
              <strong>Static demo data</strong>
              <span>17 Sep 2026 · 14:00 IST</span>
            </div>
          </div>
          <div className="desk-profile">
            <span className="avatar">OC</span>
            <div>
              <strong>Operations center</strong>
              <span>Personal workspace</span>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={!isDesktop && mobileOpen}>
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="icon-button"
              aria-label={mobileOpen ? 'Close sidebar' : 'Toggle sidebar'}
              onClick={() => {
                if (window.innerWidth < 1100) setMobileOpen((v) => !v);
                else setCollapsed((v) => !v);
              }}
            >
              <MenuIcon size={19} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>Overview</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="date-label">
              <Clock3 size={13} />
              17 Sep 2026 <span className="date-divider">/</span> 14:00 IST
            </span>
            <span className="demo-badge">
              <span className="tiny-dot" />
              DEMO
            </span>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="icon-button" aria-label="About this demo">
                  <HelpCircle size={18} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="about-dialog">
                  <Dialog.Title>Welcome to Airside</Dialog.Title>
                  <Dialog.Description>
                    This is an interactive demonstration of an airport operations workspace. Every
                    value is fixed to 17 September 2026 at 14:00 IST. Time filters use that
                    reference time.
                  </Dialog.Description>
                  <p>
                    Your dashboard layout is saved only in this browser. Use Edit layout to
                    rearrange, resize, hide, and restore cards. Open a card's focus view to see its
                    definition and underlying data.
                  </p>
                  <Dialog.Close asChild>
                    <button className="primary-button">
                      Got it <Check size={15} />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <Compass size={13} />
                AIRPORT OPERATIONS
              </div>
              <h1>
                Airport overview<span className="title-period">.</span>
              </h1>
              <p>The whole airport. One clear picture.</p>
            </div>
            <div className="heading-actions">
              <button
                className="secondary-button export-button"
                onClick={() => query.data && exportSnapshot(query.data, filters)}
                disabled={!query.data}
              >
                <ArrowDownToLine size={15} />
                Export snapshot
              </button>
              {!editing && (
                <button className="primary-button" onClick={begin}>
                  <Settings2 size={16} />
                  Edit layout
                </button>
              )}
            </div>
          </div>
          {editing ? (
            <div className="edit-toolbar">
              <div>
                <span className="editing-icon">
                  <Grip size={19} />
                </span>
                <div>
                  <strong>Make this workspace yours</strong>
                  <span>Drag a card to move it. Drag its right edge to set the width.</span>
                </div>
              </div>
              <div className="edit-actions">
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <button className="secondary-button">
                      <Plus size={14} />
                      Restore cards {doc.hidden.length > 0 && '(' + doc.hidden.length + ')'}
                      <ChevronDown size={12} />
                    </button>
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Content className="menu-content" align="end">
                      {doc.hidden.length ? (
                        doc.hidden.map((id) => (
                          <Menu.Item className="menu-item" key={id} onSelect={() => restore(id)}>
                            {registry[id].title}
                          </Menu.Item>
                        ))
                      ) : (
                        <Menu.Item className="menu-item" disabled>
                          All cards are visible
                        </Menu.Item>
                      )}
                    </Menu.Content>
                  </Menu.Portal>
                </Menu.Root>
                <button className="text-button" onClick={reset}>
                  Reset
                </button>
                <button className="secondary-button" onClick={cancel}>
                  Cancel
                </button>
                <button className="primary-button" onClick={save}>
                  <Save size={14} />
                  Save layout
                </button>
              </div>
            </div>
          ) : (
            <div className="overview-toolbar">
              <div className="scope-summary">
                <span className="overview-dot" />
                <strong>{13 - doc.hidden.length} indicators</strong>
                <span className="summary-separator">/</span>
                <span>
                  {filters.terminal === 'all' ? 'All terminals' : terminals[filters.terminal]}
                </span>
                <span className="summary-separator">/</span>
                <span>{filters.movement === 'all' ? 'All movements' : filters.movement}</span>
              </div>
              <div className="segmented" aria-label="Time window">
                {(Object.keys(rangeLabels) as Filters['range'][]).reverse().map((r) => (
                  <button
                    key={r}
                    aria-pressed={filters.range === r}
                    onClick={() => updateFilter('range', r)}
                  >
                    {rangeLabels[r]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              {lastHidden && editing && (
                <button className="text-button" onClick={() => restore(lastHidden)}>
                  Undo hide
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={clearNotice}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {!editing &&
            attention &&
            (filters.terminal === 'all' || filters.terminal === 't2') &&
            filters.movement !== 'arrivals' && (
              <div className="attention-banner">
                <div className="attention-icon">
                  <Activity size={17} />
                </div>
                <p>
                  <strong>Terminal 2 needs attention</strong>
                  <span>
                    North security is averaging {number(attention.value, 1)} min. Review checkpoint
                    capacity.
                  </span>
                </p>
                <button
                  onClick={(e) => {
                    updateFilter('terminal', 't2');
                    updateFilter('movement', 'departures');
                    focus('security', e.currentTarget);
                  }}
                >
                  View details <ArrowRight size={15} />
                </button>
              </div>
            )}
          {query.isPending ? (
            <div className="loading-grid" role="status" aria-label="Loading airport indicators">
              {definitions.map((d) => (
                <div key={d.id} className="skeleton-card" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="error-panel" role="alert">
              <h2>Couldn't open this snapshot</h2>
              <p>The dashboard data could not be read.</p>
              <button className="primary-button" onClick={() => void query.refetch()}>
                Try again
              </button>
            </div>
          ) : (
            <DashboardGrid snapshot={query.data} onFocus={focus} />
          )}
          <footer className="page-footer">
            <span>
              <Navigation size={12} />
              Airside · Operations, in perspective.
            </span>
            <span>Static demo data · {snapshotLabel} IST</span>
          </footer>
        </main>
      </div>
      {focused && (
        <FocusDialog
          key={focused.id}
          id={focused.id}
          filters={filters}
          trigger={focused.trigger}
          onClose={() => setFocused(null)}
        />
      )}
    </div>
  );
}
