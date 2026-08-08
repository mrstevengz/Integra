import {observable} from '@legendapp/state'
import {syncedTable} from '@/lib/sync'

//Esta variable funciona como el API call, se llama en la pantalla y carga directamente de la memoria del celular
export const articulo$ = observable(syncedTable({
    collection: 'articulos',
    //Par la tabla de articulo, no escribe ni actualiza, solo lee
    actions: ['read'],
    initial: {},
    persist: {name: 'articulos'}
}))