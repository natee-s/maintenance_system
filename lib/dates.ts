export function formatDate(date: Date | string | null | undefined, time = false) { return date ? new Intl.DateTimeFormat("th-TH",{timeZone:"Asia/Bangkok",dateStyle:"medium",...(time ? {timeStyle:"short" as const} : {})}).format(new Date(date)) : "—"; }
export function bangkokDay(now = new Date()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Bangkok",year:"numeric",month:"2-digit",day:"2-digit"}).format(now); }
export function dateInput(date: Date | null) { return date?.toISOString().slice(0,10) ?? ""; }
