//Helpers para el formato

const z = (n: number) => String(n).padStart(2, "0")

function partes(iso: string) {
    const [anio, mes, dia] = (iso ?? "").slice(0, 10).split("-").map(Number)
    return anio && mes && dia ? { anio, mes, dia } : null
}

export function fechaCorta(iso: string): string {
    const p = partes(iso)
    return p ? `${z(p.dia)}/${z(p.mes)}/${p.anio}` : ""
}

export function fechaDeHoy(): string {
    const d = new Date()
    return `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function edadEnAnios(iso: string): number | null {
    const n = partes(iso)
    if (!n) return null
    const hoy = new Date()
    let a = hoy.getFullYear() - n.anio
    const m = hoy.getMonth() + 1 - n.mes
    if (m < 0 || (m === 0 && hoy.getDate() < n.dia)) a--
    return a >= 0 ? a : null
}

export function porCreacion<T extends { created_at?: string | null }>(a: T, b: T) {
    return (a.created_at ?? "9999").localeCompare(b.created_at ?? "9999")
}

export const ORDEN_RELACION: Record<string, number> = {
    Primaria: 0, Secundaria: 1, Especializada: 2,
}

export function esc(s: unknown): string {
    return String(s ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}