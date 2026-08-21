const LOCALE = 'es-CR'
const MS_PER_DAY = 86_400_000

export type DateKey = string

export type TimeOfDay = {
    hours: number
    minutes: number
}

export function toDateKey(date: Date): DateKey {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function fromDateKey(key: DateKey): Date {
    const [year, month, day] = key.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function isSameDay(a: Date, b: Date): boolean {
    return toDateKey(a) === toDateKey(b)
}

export function startOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function daysBetween(from: Date, to: Date): number {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY)
}

export function parseTimeOfDay(time: string): TimeOfDay {
    const [hours, minutes] = time.split(':').map(Number)
    return { hours, minutes }
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' })
}

export function formatClockTime(time: string): string {
    const { hours, minutes } = parseTimeOfDay(time)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return formatTime(date)
}

export function formatDate(
    date: Date,
    options: { longMonth?: boolean; withYear?: boolean } = {},
): string {
    const text = date
        .toLocaleDateString(LOCALE, {
            weekday: 'short',
            day: 'numeric',
            month: options.longMonth ? 'long' : 'short',
            year: options.withYear ? 'numeric' : undefined,
        })
        .replace(/[.,]/g, '')

    return text.charAt(0).toUpperCase() + text.slice(1)
}