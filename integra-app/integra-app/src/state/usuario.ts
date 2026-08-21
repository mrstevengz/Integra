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

export function nombreCompleto(perfil: Perfil): string {
    return `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim()
}

export function edadEnAnios(fechaNacimiento: string): number | null {
    const [anio, mes, dia] = fechaNacimiento.slice(0, 10).split('-').map(Number)
    if (!anio || !mes || !dia) return null

    const hoy = new Date()
    let edad = hoy.getFullYear() - anio
    const diferenciaMeses = hoy.getMonth() + 1 - mes

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < dia)) edad--
    return edad >= 0 ? edad : null
}