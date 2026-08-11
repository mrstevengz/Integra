import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { comoLista } from "./helpers";

//Enums para matchear la base de datos
export type FormaFarmaceutica =
    | 'tableta' | 'capsula' | 'jarabe' | 'suspension' | 'inyeccion'
    | 'gotas' | 'crema' | 'inhalador' | 'supositorio' | 'parche'

export type ConAlimentos = 'con' | 'sin' | 'indiferente'

export type EstadoToma = 'pendiente' | 'tomada' | 'pospuesta' | 'omitida'

//Respuestas que manda la base de datos
export type Medicamento = {
    id: string
    perfil_id: string
    nombre: string
    dosis: number
    unidad: string
    forma: FormaFarmaceutica
    con_alimentos: ConAlimentos | null
    indicaciones: string | null
    activo: boolean
    updated_at?: string | null
}

//Hora: Cuando lo debe tomar, dias se guarda como array [0,1,2,3,4] lunes, martes, miercoles,etc
export type Horario = {
    id: string
    perfil_id: string
    medicamento_id: string
    hora: string
    dias: number[]
    updated_at?: string | null
}

//Tabla para resolver que pasa con cada toma de medicamento. 
export type Toma = {
    id: string
    perfil_id: string
    medicamento_id: string
    horario_id: string | null
    programada_para: string
    estado: EstadoToma
    registrada_en: string | null
    pospuesta_hasta: string | null
    updated_at?: string | null
}

//LEGEND STATE CONSTS

export const medicamento$ = observable(syncedTable({
    collection: 'medicamentos',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicamento>,
    realtime: true,
    persist: {name: 'medicamentos'}
}))

export const horario$ = observable(syncedTable({
    collection: 'horarios',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Horario>,
    realtime: true,
    persist: {name: 'horarios'}
}))

export const toma$ = observable(syncedTable({
    collection: 'tomas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Toma>,
    realtime: true,
    persist: {name: 'tomas'}
}))

//HELPERS DE MEDICACION

//Reciba una lista de Medicamento, y retorna los medicamentos activos en orden alfabetico
export function medicamentosActivos(
    todos: Record<string, Medicamento> | undefined,
): Medicamento[] {
    return comoLista(todos)
        .filter((m) => m.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

//Recibe un id de medicamento y retorna los horarios de este
export function horariosDe(
    todos: Record<string, Horario> | undefined,
    medicamentoId: string,
): Horario[] {
    return comoLista(todos)
        .filter((h) => h.medicamento_id === medicamentoId)
        .sort((a, b) => a.hora.localeCompare(b.hora))
}

//Las tomas de un dia concreto, ordenadas por hora
export function tomasDelDia(
    todos: Record<string, Toma> | undefined,
    fecha: Date,
): Toma[] {
    const dia = fechaLocalISO(fecha)
    return comoLista(todos)
        .filter((t) => fechaLocalISO(new Date(t.programada_para)) === dia)
        .sort((a, b) => a.programada_para.localeCompare(b.programada_para))
}

//Utilidades de fecha/hora

//Retorna una fecha en hora local (hora de la region)
export function fechaLocalISO(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dia}`
}

//"08:00:00" => { horas: 8, minutos: 0 }
export function partirHora(hora: string): { horas: number; minutos: number } {
    const [h, m] = hora.split(':')
    return { horas: Number(h), minutos: Number(m) }
}

//08:00:00 => 8:00 a.m.
export function formatearHora(hora: string): string {
    const { horas, minutos } = partirHora(hora)
    const d = new Date()
    d.setHours(horas, minutos, 0, 0)
    return d.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
}