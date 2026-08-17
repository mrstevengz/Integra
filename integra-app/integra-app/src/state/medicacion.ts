import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { comoLista } from "./helpers";

//ENUMS para hacer match con la base de datos

export type FormaFarmaceutica =
    | 'tableta' | 'capsula' | 'jarabe' | 'suspension' | 'inyeccion'
    | 'gotas' | 'crema' | 'inhalador' | 'supositorio' | 'parche'

export type ConAlimentos = 'con' | 'sin' | 'indiferente'

export type EstadoToma = 'pendiente' | 'tomada' | 'pospuesta' | 'omitida'

//Forma de horario
export type HorarioMed = {
    id: string
    hora: string
    dias: number[]
}


//Forma de medicamento
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
    horarios: HorarioMed[]
    updated_at?: string | null
    created_at?: string | null
}

//Toma -> 1 por cada dia y hora del horario
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

export const medicamento$ = observable<Record<string,Medicamento>>(syncedTable({
    collection: 'medicamentos',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicamento>,
    realtime: true,
    persist: {name: 'medicamentos'}
}))


export const toma$ = observable<Record<string, Toma>>(syncedTable({
    collection: 'tomas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Toma>,
    realtime: true,
    persist: {name: 'tomas'}
}))

//HELPERS DE MEDICACION

//Recibe una lista de medicamentos, y el id del usuario por proteccion contra la cache. Regresa la lista ordenada, que tienen el ID especifico y ordenadas
export function medicamentosActivos(
    todos: Record<string, Medicamento> | undefined, perfilId: string | undefined,
): Medicamento[] {
    if (!perfilId) return []
    return comoLista(todos)
        .filter((m) => m.perfil_id === perfilId)
        .filter((m) => m.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

//Retorna los horarios de medicamentos ordenados por hora
export function horariosOrdenados(m: Medicamento): HorarioMed[] {
    return [...m.horarios].sort((a, b) => a.hora.localeCompare(b.hora))
}

//[0,1,2,3,4,5,6] -> "Todos los dias" | [1,3,5] -> "L, M, V"
export function resumenDias(dias: number[]): string {
    if (dias.length === 7) return 'Todos los dias'
    if (dias.length === 0) return 'Sin dias'

    const letras = ['D', 'L', 'K', 'M', 'J', 'V', 'S']
    return [...dias].sort((a, b) => a - b).map((d) => letras[d]).join(', ')
}

//Las tomas de un dia concreto, ordenadas por hora
export function tomasDelDia(
    todos: Record<string, Toma> | undefined,
    fecha: Date,
    perfilId: string | undefined,
): Toma[] {
    const dia = fechaLocalISO(fecha)
    return comoLista(todos)
        //Descarta filas incompletas antes de tocarlas
        .filter((t) => t && t.perfil_id === perfilId && t.programada_para)
        .filter((t) => fechaLocalISO(new Date(t.programada_para)) === dia)
        //Ordena por el INSTANTE, no por el texto. Funciona con string, Date o numero.
        .sort((a, b) =>
            new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
        )
}

//Utilidades de DateTime

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

//Se le pasa un date y retorna Jue 14 ago
export function formatearFecha(date: Date, monthLong?: boolean, needYear?: boolean): string {
    const cleanDate = date.toLocaleDateString('es-CR', {
        weekday: 'short',
        day: 'numeric',
        month: monthLong ? 'long' : 'short',
        year: needYear ? 'numeric' : undefined,
    }).replace(/\./g, '').replace(/\,/g, '')

    return cleanDate.charAt(0).toUpperCase() + cleanDate.slice(1)
}

//Un grupo de dosis que se toman a la misma hora
export type GrupoTomas = {
    hora: string        //"08:00", sirve de llave
    etiqueta: string    //"8:00 a. m.", para mostrar
    instante: number    //milisegundos, para ordenar
    tomas: Toma[]
}

//Agrupa las dosis del dia por hora exacta.
//Dos medicamentos a las 8:00 caen en el mismo grupo; uno a las 11:00 va aparte.
export function agruparPorHora(tomas: Toma[]): GrupoTomas[] {
    //Crea un nuevo mapa con una llave y el grupo de tomas
    const mapa = new Map<string, GrupoTomas>()

    //Por cada toma en el arreglo de tomas completo
    for (const t of tomas) {
        const d = new Date(t.programada_para)
        const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

        //Si es la primera dosis de esa hora, se crea el grupo
        if (!mapa.has(hora)) {
            mapa.set(hora, {
                hora,
                etiqueta: d.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' }),
                instante: d.getTime(),
                tomas: [],
            })
        }

        mapa.get(hora)!.tomas.push(t)
    }

    //De Map a arreglo, ordenado cronologicamente
    return [...mapa.values()].sort((a, b) => a.instante - b.instante)
}