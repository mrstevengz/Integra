import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { comoLista } from "./helpers";

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

//Un tipo de dos valores, como la presion arterial
export function esDoble(tipo: TipoMedicion): boolean {
    return tipo.etiqueta_secundaria !== null
}

export const tipoMedicion$ = observable<Record<string, TipoMedicion>>(syncedTable({
    collection: 'tipomedicion',
    actions: ['read'],
    initial: {} as Record<string, TipoMedicion>,
    persist: {name: 'tipomedicion'},
}))

export function tiposOrdenados(
    todos: Record<string, TipoMedicion> | undefined,
): TipoMedicion[] {
    return comoLista(todos).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

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

export const medicion$ = observable<Record<string, Medicion>>(syncedTable({
    collection: 'mediciones',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicion>,
    realtime: true,
    persist: {name: 'mediciones'},
}))

//Las mediciones de un tipo, de la mas reciente a la mas antigua
export function medicionesDe(
    todos: Record<string, Medicion> | undefined,
    tipoId: string,
    perfilId: string | undefined,
): Medicion[] {
    if (!perfilId) return []
    return comoLista(todos)
        .filter((m) => m.perfil_id === perfilId && m.tipo_medicion_id === tipoId)
        .sort((a, b) => new Date(b.medido_en).getTime() - new Date(a.medido_en).getTime())
}

export function medicionesOrdenadas(
    todos: Record<string, Medicion> | undefined,
    perfilId: string | undefined,
): Medicion[] {
    if (!perfilId) return []
    return comoLista(todos)
        .filter((m) => m.perfil_id === perfilId)
        .sort((a, b) => new Date(b.medido_en).getTime() - new Date(a.medido_en).getTime())
}