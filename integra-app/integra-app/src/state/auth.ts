import {supabase} from '@/lib/supabase'
import { observable } from '@legendapp/state'
import { getAllSyncStates } from '@legendapp/state/sync'
import type { Session } from '@supabase/supabase-js'
import { Storage } from 'expo-sqlite/kv-store'

export const auth$ = observable({
    session: null as Session | null,
    cargando: true,
    cerrandoSesion: false
})

supabase.auth.onAuthStateChange((_evento, sesion) => {
    auth$.session.set(sesion)
    auth$.cargando.set(false)
})

export async function cerrarSesion() {
    //Bloquea la navegacion hasta que la limpieza termine por completo.
    auth$.cerrandoSesion.set(true)

    try {
        //Invalidar la sesion local y del servidor
        await supabase.auth.signOut()

        //Resetear TODAS las tablas sincronizadas 
        //en memoria y en su cache persistida
        await Promise.all(
            getAllSyncStates().map(([syncState$]) => syncState$.reset())
        )

        //Borrar el resto de la cache local (sesion de supabase, por ej)
        await Storage.clear()
    } finally {
        auth$.cerrandoSesion.set(false)
    }
}
