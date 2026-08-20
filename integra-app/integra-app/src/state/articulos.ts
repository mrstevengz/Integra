import {observable} from '@legendapp/state'
import {syncedTable} from '@/lib/sync'

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
export const articulo$ = observable(syncedTable({
    collection: 'articulos',
    //Par la tabla de articulo, no escribe ni actualiza, solo lee
    actions: ['read'],
    initial: {} as Record<string, Articulo>,
    realtime: true,
    persist: {name: 'articulos'}
}))

export function porCategoria(
    todos: Record<string, Articulo> | undefined,
    categoria: string,
): Articulo[] {
    return Object.values(todos ?? {}).filter((a) => a.categoria === categoria)
}

// export function porId(
//     todos: Record<string, Articulo> | undefined,
//     id: string,
// ): Articulo | undefined {
//     return todos?.[id]
// }