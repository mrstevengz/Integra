//----------UTILIDADES GENERALES DE FECHAS-------------

const LOCALE = 'es-CR'
const MS_POR_DIA = 86_400_000

export type HoraDelDia = {
    horas: number
    minutos: number
}

//Retorna una fecha en hora local (hora de la region)
export function fechaLocal(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dia}`
}

export function desdeFechaLocal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function esMismoDia(a: Date, b: Date): boolean {
    return fechaLocal(a) === fechaLocal(b)
}

export function inicioDelDia(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function diasEntre(desde: Date, hasta: Date): number {
    return Math.round((inicioDelDia(hasta) - inicioDelDia(desde)) / MS_POR_DIA)
}

//"08:00:00" => { horas: 8, minutos: 0 }
export function dividirHora(hora: string): HoraDelDia {
    //Extrae la hora y minutos de el string de hora que le pasa
    const [h, m] = hora.split(':')

    //Retorna un objeto, con horas y minutos en numero
    return { horas: Number(h), minutos: Number(m) }
}

export function formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' })
}

//Pasar un string completo de hora a formato texto con AM y PM. 08:00:00 => 8:00 a.m.
export function formatearHoraDeTexto(hora: string): string {
    const { horas, minutos } = dividirHora(hora)
    const d = new Date()
    d.setHours(horas, minutos, 0, 0)
    return formatearHora(d)
}

//Se le pasa una fecha (Date) y la retorna formateada con las opciones que se piden. mesLargo? retorna el mes completo, si no por ej. Ago -> Agosto. conAnio? retorna el año, ambos son opcionales, si no se pasan retorna dia, fecha y mes.
export function formatearFecha(
    date: Date,
    opciones: { mesLargo?: boolean; conAnio?: boolean } = {},
): string {
    const cleanDate = date.toLocaleDateString(LOCALE, {
        weekday: 'short',
        day: 'numeric',
        month: opciones.mesLargo ? 'long' : 'short',
        year: opciones.conAnio ? 'numeric' : undefined,
    }).replace(/\./g, '').replace(/\,/g, '')

    return cleanDate.charAt(0).toUpperCase() + cleanDate.slice(1)
}