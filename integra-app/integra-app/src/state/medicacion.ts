import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { convertirALista } from "./helpers";

//-------Tipos para los ENUMS de la base de datos--------

//Tipo para representar los campos de la forma farmaceutica del medicamento que se esta agregando. Se usa en features/medicacion/TomasDelDia.tsx y features/medicacion/generar-tomas.ts
export type FormaFarmaceutica =
    | 'tableta' | 'capsula' | 'jarabe' | 'suspension' | 'inyeccion'
    | 'gotas' | 'crema' | 'inhalador' | 'supositorio' | 'parche'

//Tipo para representar el campo Con Alimentos? del formulario y el ENUM en la base de datos
export type ConAlimentos = 'con' | 'sin' | 'indiferente'


//Tipo para representar el estado de la toma en la base de datos. 
export type EstadoToma = 'pendiente' | 'tomada' | 'pospuesta' | 'omitida'

//Tipo para representar la forma del horario en la base de datos. Cada medicacion puede tener hasta un max de 5 horarios. Se presenta la hora como string y los dias como un array de numeros, donde [0, 2, 4] representan Domingo, Martes y Jueves tanto en el UI como en la funcion de generar tomas. Se hace de esta manera porque la funcion de JavaScript para Date, retorna una lista de dias de la misma forma array.
export type HorarioMed = {
    id: string
    hora: string
    dias: number[]
}



//Tipo para representar el Medicamento de la base de datos
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

//Tipo para representar una toma. Para cada medicamento, solo se genera 1 toma, y se le asigna los dias basado en el campo de horarios[] en Medicamento
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


//Variable de legend state para la tabla de medicamentos, permisos de select, create y update unicamente para el usuario con el id del row. 
export const medicamento$ = observable<Record<string,Medicamento>>(syncedTable({
    collection: 'medicamentos',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicamento>,
    realtime: true,
    persist: {name: 'medicamentos'}
}))

//Mismo de arriba pero para tomas
export const toma$ = observable<Record<string, Toma>>(syncedTable({
    collection: 'tomas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Toma>,
    realtime: true,
    persist: {name: 'tomas'}
}))

//----------------HELPERS----------------

//Recibe una lista de medicamentos, y el id del usuario por proteccion contra la cache. Regresa la lista ordenada, todos los medicamentos que le pertenecen al ID que se le pasa y tienen el tag de activo
export function medicamentosActivos(
    todos: Record<string, Medicamento> | undefined, perfilId: string | undefined,
): Medicamento[] {
    if (!perfilId) return []
    return convertirALista(todos)
        .filter((m) => m.perfil_id === perfilId)
        .filter((m) => m.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

//Retorna los horarios ordenados de un medicamento especifico.
export function horariosOrdenadosdeMedicamento(m: Medicamento): HorarioMed[] {
    return [...m.horarios].sort((a, b) => a.hora.localeCompare(b.hora))
}

//[0,1,2,3,4,5,6] -> "Todos los dias" | [1,3,5] -> "L, M, V"
export function listaDiasAString(dias: number[]): string {
    if (dias.length === 7) return 'Todos los dias'
    if (dias.length === 0) return 'Sin dias'

    const letras = ['D', 'L', 'K', 'M', 'J', 'V', 'S']
    return [...dias].sort((a, b) => a - b).map((d) => letras[d]).join(', ')
}

//Retorna las tomas de un dia especifico, de un usuario.
export function tomasDelDia(
    todos: Record<string, Toma> | undefined,
    fecha: Date,
    perfilId: string | undefined,
): Toma[] {
    const dia = fechaLocal(fecha)
    return convertirALista(todos)
        //Descarta filas incompletas antes de tocarlas, donde la toma existe, el id pertenece al usuario y tiene el campo de programada_para
        .filter((t) => t && t.perfil_id === perfilId && t.programada_para)
        //Solo retorna las del dia que se le pasa
        .filter((t) => fechaLocal(new Date(t.programada_para)) === dia)
        //Ordena por la hora, de mas temprano a mas tarde.
        .sort((a, b) =>
            new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
        )
}

//----------UTILIDADES GENERALES DE FECHAS-------------

//Retorna una fecha en hora local (hora de la region)
export function fechaLocal(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dia}`
}

//"08:00:00" => { horas: 8, minutos: 0 }
export function dividirHoraAObjeto(hora: string): { horas: number; minutos: number } {
    //Extrae la hora y minutos de el string de hora que le pasa
    const [h, m] = hora.split(':')

    //Retorna un objeto, con horas y minutos en numero
    return { horas: Number(h), minutos: Number(m) }
}

//Pasar un string completo de hora a formato texto con AM y PM. 08:00:00 => 8:00 a.m.
export function formatearHoraAString(hora: string): string {
    const { horas, minutos } = dividirHoraAObjeto(hora)
    const d = new Date()
    d.setHours(horas, minutos, 0, 0)
    return d.toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit' })
}

//Se le pasa una fecha (Date) y la retorna formateada con las opciones que se piden. monthLong? retorna el mes completo, si no por ej. Ago -> Agosto. needYear? retorna el año, ambos son opcionales, si no se pasan retorna dia, fecha y mes.
export function formatearFechaAString(date: Date, monthLong?: boolean, needYear?: boolean): string {
    const cleanDate = date.toLocaleDateString('es-CR', {
        weekday: 'short',
        day: 'numeric',
        month: monthLong ? 'long' : 'short',
        year: needYear ? 'numeric' : undefined,
    }).replace(/\./g, '').replace(/\,/g, '')

    return cleanDate.charAt(0).toUpperCase() + cleanDate.slice(1)
}

//Tipo para agrupar las tomas por dias
export type GrupoTomas = {
    hora: string        //"08:00", sirve de llave
    etiqueta: string    //"8:00 a. m.", para mostrar
    instante: number    //milisegundos, para ordenar
    tomas: Toma[]
}

//Agrupa las dosis del dia por hora exacta.
//Dos medicamentos a las 8:00 caen en el mismo grupo; uno a las 11:00 va aparte.
export function agruparTomasPorHora(tomas: Toma[]): GrupoTomas[] {
    //Crea un nuevo hashmap con su llave y el grupo de tomas como valor
    const mapa = new Map<string, GrupoTomas>()

    //Por cada toma en el arreglo de tomas que se le pasa
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

        //Si no, se agrega al grupo
        mapa.get(hora)!.tomas.push(t)
    }

    //De HashMap a arreglo, ordenado cronologicamente
    return [...mapa.values()].sort((a, b) => a.instante - b.instante)
}