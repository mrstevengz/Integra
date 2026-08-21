import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { crearId } from "@/lib/ids";
import { fechaLocal } from "@/lib/fechas";
import { delPerfil, masRecientePrimero } from "./consultas";

export type SeccionExpediente =
    | 'datosPersonales'
    | 'condicionesYAlergias'
    | 'medicacionActiva'
    | 'historialMedicacion'
    | 'mediciones'
    | 'citas'
    | 'contactosEmergencia'

export type SeccionesExportadas = Record<SeccionExpediente, boolean>

export type RangoHistorial = '1m' | '3m' | '6m' | 'todo'

export type Vigencia = '1h' | '24h' | '7d' | '30d'

export type EstadoExportacion = 'activa' | 'vencida' | 'revocada'

export type Exportacion = {
    id: string
    perfil_id: string
    token: string
    codigo: string
    secciones: SeccionesExportadas
    rango_historial: RangoHistorial
    expira_en: string
    revocada_en: string | null
    created_at?: string
}

const HORAS_POR_VIGENCIA: Record<Vigencia, number> = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
}

const MESES_POR_RANGO: Record<Exclude<RangoHistorial, 'todo'>, number> = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
}

export const exportaciones$ = observable<Record<string, Exportacion>>(syncedTable({
    collection: 'exportaciones_expediente',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Exportacion>,
    realtime: true,
    persist: {name: 'exportaciones_expediente'}
}))

export function estadoDeExportacion(
    exportacion: Exportacion,
    ahora = Date.now(),
): EstadoExportacion {
    if (exportacion.revocada_en) return 'revocada'
    if (new Date(exportacion.expira_en).getTime() <= ahora) return 'vencida'
    return 'activa'
}

export function estaActiva(exportacion: Exportacion, ahora = Date.now()): boolean {
    return estadoDeExportacion(exportacion, ahora) === 'activa'
}

export function exportacionesDelPerfil(
    todas: Record<string, Exportacion> | undefined,
    perfilId: string | undefined,
): Exportacion[] {
    return delPerfil(todas, perfilId)
        .sort(masRecientePrimero((e) => e.created_at ?? e.expira_en))
}

export function seccionesIncluidas(exportacion: Exportacion): SeccionExpediente[] {
    return (Object.keys(exportacion.secciones) as SeccionExpediente[])
        .filter((seccion) => exportacion.secciones[seccion])
}

export function desdeCuando(rango: RangoHistorial, ahora = new Date()): Date | null {
    if (rango === 'todo') return null

    const desde = new Date(ahora)
    desde.setMonth(desde.getMonth() - MESES_POR_RANGO[rango])
    return desde
}

export function fechaDeExpiracion(vigencia: Vigencia, desde = new Date()): Date {
    return new Date(desde.getTime() + HORAS_POR_VIGENCIA[vigencia] * 3_600_000)
}

function generarCodigo(token: string, fecha: Date): string {
    const sufijo = token.replace(/-/g, '').slice(0, 4).toUpperCase()
    return `EXP-${fechaLocal(fecha)}-${sufijo}`
}

export function crearExportacion(
    perfilId: string,
    secciones: SeccionesExportadas,
    rango: RangoHistorial,
    vigencia: Vigencia,
): Exportacion {
    const ahora = new Date()
    const token = crearId()

    const exportacion: Exportacion = {
        id: crearId(),
        perfil_id: perfilId,
        token,
        codigo: generarCodigo(token, ahora),
        secciones,
        rango_historial: rango,
        expira_en: fechaDeExpiracion(vigencia, ahora).toISOString(),
        revocada_en: null,
    }

    exportaciones$[exportacion.id].set(exportacion)
    return exportacion
}

export function revocarExportacion(exportacionId: string) {
    exportaciones$[exportacionId].assign({ revocada_en: new Date().toISOString() })
}


export const SECCIONES_POR_DEFECTO: SeccionesExportadas = {
    datosPersonales: true,
    condicionesYAlergias: true,
    medicacionActiva: true,
    historialMedicacion: false,
    mediciones: true,
    citas: false,
    contactosEmergencia: true,
}

export const borradorExportacion$ = observable({
    secciones: { ...SECCIONES_POR_DEFECTO },
    rango: '3m' as RangoHistorial,
})

export function reiniciarBorrador() {
    borradorExportacion$.set({
        secciones: { ...SECCIONES_POR_DEFECTO },
        rango: '3m',
    })
}

export function alternarSeccion(seccion: SeccionExpediente) {
    const actual = borradorExportacion$.secciones[seccion].get()
    borradorExportacion$.secciones[seccion].set(!actual)
}

export function haySeccionesElegidas(secciones: SeccionesExportadas): boolean {
    return Object.values(secciones).some(Boolean)
}

export function afectaAlHistorial(secciones: SeccionesExportadas): boolean {
    return secciones.mediciones || secciones.citas
}

const BASE_ENLACE = 'https://mrstevengz.github.io/Integra'

export function enlaceDeExportacion(exportacion: Exportacion): string {
    return `${BASE_ENLACE}/#${exportacion.token}`
}