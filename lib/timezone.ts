const KOREA_TIME_ZONE = "Asia/Seoul";

function formatInTimeZoneParts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KOREA_TIME_ZONE,
    ...options
  }).formatToParts(date);
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function toKstDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = formatInTimeZoneParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return `${getPart(parts, "year")}-${getPart(parts, "month")}-${getPart(parts, "day")}`;
}

export function toKstMonthKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = formatInTimeZoneParts(date, {
    year: "numeric",
    month: "2-digit"
  });

  return `${getPart(parts, "year")}-${getPart(parts, "month")}`;
}

export function toKstYear(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = formatInTimeZoneParts(date, {
    year: "numeric"
  });

  return getPart(parts, "year");
}

export function getCurrentKstMonthKey(now = new Date()) {
  return toKstMonthKey(now);
}

export function getUtcRangeForKstMonth(monthKey: string) {
  const [yearString, monthString] = monthKey.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  const start = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0, 0)).toISOString();
  const endExclusive = new Date(Date.UTC(year, month, 1, -9, 0, 0, 0)).toISOString();

  return { start, endExclusive };
}
