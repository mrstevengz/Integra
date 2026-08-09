import {observable} from '@legendapp/state'
import {syncedTable} from '@/lib/sync'

export const perfil$ = observable(syncedTable({
    collection: 'perfiles',
    
    //Solo se puede leer y actualizar el propio perfil del usuario
    actions: ['read', 'update'],
    as: 'value',
    persist: {name: 'perfil'}
}))