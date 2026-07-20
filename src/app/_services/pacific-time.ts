const TIME_ZONE = 'America/Los_Angeles';

// formatToParts exists on Intl.DateTimeFormat in all evergreen browsers, but this
// project's TypeScript version (2.7) predates the lib.d.ts declarations for it.
function partsToMap(formatter: Intl.DateTimeFormat, date: Date): { [key: string]: string } {
  const parts: Array<{ type: string; value: string }> = (formatter as any).formatToParts(date);
  return parts.reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {} as { [key: string]: string });
}

/** Converts a UTC ISO string to a `datetime-local` input value representing that instant in Pacific time. */
export function utcIsoToPacificDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const parts = partsToMap(new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }), date);
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

/** Converts a `datetime-local` input value, interpreted as Pacific wall-clock time, to a UTC ISO string. */
export function pacificDateTimeLocalToUtcIso(localValue: string): string {
  const [datePart, timePart] = localValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const parts = partsToMap(new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }), utcGuess);
  const asIfUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  const offsetMillis = asIfUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offsetMillis).toISOString();
}

/** Formats a UTC ISO string as e.g. "Saturday, July 19 at 9:00 AM PDT". Falls back to a plain string on unsupported browsers. */
export function formatPacificDisplay(iso: string): string {
  try {
    const date = new Date(iso);
    const parts = partsToMap(new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
    }), date);
    return `${parts.weekday}, ${parts.month} ${parts.day} at ${parts.hour}:${parts.minute} ${parts.dayPeriod} ${parts.timeZoneName}`;
  } catch (e) {
    return new Date(iso).toString();
  }
}
