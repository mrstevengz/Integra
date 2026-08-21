import { syncedTable } from '@/lib/sync'
import { observable } from '@legendapp/state'
import { convertirALista } from './consultas'

//TODO: POR COMENTAR

export type Articulo = {
    id: string
    titulo: string
    categoria: string
    sintomas: string
    tratamientos: string
    cuidados: string,
    updated_at: string | null
}

//Esta variable funciona como el API call, se llama en la pantalla y carga directamente de la memoria del celular
//Par la tabla de articulo, no escribe ni actualiza, solo lee
export const articulos$ = observable<Record<string, Articulo>>(syncedTable({
    collection: 'articulos',
    actions: ['read'],
    initial: {} as Record<string, Articulo>,
    realtime: true,
    persist: {name: 'articulos'}
}))

export function articulosDeCategoria(
    todos: Record<string, Articulo> | undefined,
    categoria: string,
): Articulo[] {
    return convertirALista(todos).filter((a) => a.categoria === categoria)
}