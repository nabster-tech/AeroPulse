import { useEffect, useMemo, useState } from 'react';
import { airport } from '../categories/airport';
import { usePresentation } from '../presentation';

export function ToolbarClock() {
  const { localAndUtc, toggleTimeZones } = usePresentation();
  const [now, setNow] = useState(() => new Date());
  const timeZone = localAndUtc ? 'UTC' : airport.timeZone;
  const zoneLabel = localAndUtc ? 'UTC' : airport.timeZoneAbbreviation;
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }),
    [timeZone],
  );

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const interval = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return (
    <button
      type="button"
      className="toolbar-clock"
      aria-label="Show UTC"
      aria-pressed={localAndUtc}
      aria-live="off"
      title={`Showing ${localAndUtc ? 'UTC' : `${airport.name} local time (${zoneLabel})`}. Click to switch to ${localAndUtc ? 'local time' : 'UTC'}.`}
      onClick={toggleTimeZones}
    >
      <time dateTime={now.toISOString()}>
        <span className="toolbar-clock-time">{formatter.format(now)}</span>
        <span className="toolbar-clock-zone">{zoneLabel}</span>
      </time>
    </button>
  );
}
