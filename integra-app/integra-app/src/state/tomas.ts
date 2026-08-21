import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { fechaLocal, formatearHora } from "@/lib/fechas";
import { delPerfil, masAntiguoPrimero } from "./consultas";

//Tipo para representar el estado de la toma en la base de datos. 
export type EstadoToma = 'pendiente' | 'tomada' | 'pospuesta' | 'omitida'

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

//Tipo para agrupar las tomas por dias
export type GrupoTomas = {
    hora: string        //"08:00", sirve de llave
    etiqueta: string    //"8:00 a. m.", para mostrar
    instante: number    //milisegundos, para ordenar
    tomas: Toma[]
}

//Mismo de arriba pero para tomas
export const tomas$ = observable<Record<string, Toma>>(syncedTable({
    collection: 'tomas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Toma>,
    realtime: true,
    persist: {name: 'tomas'}
}))

//Retorna las tomas de un dia especifico, de un usuario.
export function tomasDelDia(
    todos: Record<string, Toma> | undefined,
    fecha: Date,
    perfilId: string | undefined,
): Toma[] {
    const dia = fechaLocal(fecha)
    return delPerfil(todos, perfilId)
        //Descarta filas incompletas antes de tocarlas, donde la toma existe, el id pertenece al usuario y tiene el campo de programada_para
        .filter((t) => t.programada_para)
        //Solo retorna las del dia que se le pasa
        .filter((t) => fechaLocal(new Date(t.programada_para)) === dia)
        //Ordena por la hora, de mas temprano a mas tarde.
        .sort(masAntiguoPrimero((t) => t.programada_para))
}

export function estaSinResolver(t: Toma): boolean {
    return t.estado === 'pendiente' || t.estado === 'pospuesta'
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
                etiqueta: formatearHora(d),
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