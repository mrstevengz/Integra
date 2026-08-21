import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { convertirALista, delPerfil, masRecientePrimero, porNombre } from "./consultas";

//Tipo para representar la tabla de TipoMedicion para TS
export type TipoMedicion = {
    id: string
    nombre: string
    unidad: string
    rango_min: number
    rango_max: number
    etiqueta_principal: string | null
    etiqueta_secundaria: string | null
    rango_min_secundario: number | null
    rango_max_secundario: number | null
    updated_at?: string | null
}

//Tipo para representar la tabla de Medicion para TS
export type Medicion = {
    id: string
    perfil_id: string
    tipo_medicion_id: string
    valor: number
    valor_secundario?: number | null
    medido_en: Date
    contexto: string | null
    nota: string | null
    created_at?: string | null
    updated_at?: string | null
}

//Variable / almacenamiento de Legend State. Retorna la tabla de tipo_medicion, y da permisos solo para SELECT
export const tiposMedicion$ = observable<Record<string, TipoMedicion>>(syncedTable({
    collection: 'tipomedicion',
    actions: ['read'],
    initial: {} as Record<string, TipoMedicion>,
    persist: {name: 'tipomedicion'}
}))

//Variable de LegendState para la tabla de mediciones. Da los permisos de select, create y update al usuario que tenga el mismo perfilId de la informacion en la tabla
export const mediciones$ = observable<Record<string, Medicion>>(syncedTable({
    collection: 'mediciones',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicion>,
    realtime: true,
    persist: {name: 'mediciones'}
}))

//Un tipo de dos valores, como la presion arterial
export function esDoble(tipo: TipoMedicion): boolean {
    return tipo.etiqueta_secundaria !== null
}

//Funcion helper para ordenar los tipos de mediciones en orden alfabetico.
export function tiposOrdenados(
    todos: Record<string, TipoMedicion> | undefined,
): TipoMedicion[] {
    return convertirALista(todos).sort(porNombre)
}

//Retorna una lista de mediciones ordenadas por la fecha en la que se hicieron. Se usa en index/index.tsx y medicion/historial.tsx para mostrar el historial de mediciones de un usuario
export function medicionesDelPerfil(
    todos: Record<string, Medicion> | undefined,
    perfilId: string | undefined,
): Medicion[] {
    return delPerfil(todos, perfilId).sort(masRecientePrimero((m) => m.medido_en))
}

//Retorna una array de objetos, donde estan las mediciones de un usuario y de un tipo especifico
export function medicionesDeTipo(
    todos: Record<string, Medicion> | undefined,
    tipoId: string,
    perfilId: string | undefined,
): Medicion[] {
    return medicionesDelPerfil(todos, perfilId).filter((m) => m.tipo_medicion_id === tipoId)
}