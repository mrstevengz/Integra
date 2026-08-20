import {observable} from '@legendapp/state'
import {syncedTable} from '@/lib/sync'

//Tipo para representar el perfil en TS
export type Perfil = {
    id: string
    nombre: string
    apellidos: string
    email: string
    fecha_nacimiento: string | null
    genero: string | null
    cedula: string | null
    telefono: string | null
    tipo_sangre: string | null
    medico_tratante: string | null
    created_at: string
    updated_at: string
    deleted: boolean
}

export const perfil$ = observable<Perfil>(syncedTable({
    collection: 'perfiles',
    
    //Solo se puede leer y actualizar el propio perfil del usuario
    actions: ['read', 'update'],
    as: 'value',
    initial: {},
    realtime: true,
    persist: {name: 'perfil'}
}))