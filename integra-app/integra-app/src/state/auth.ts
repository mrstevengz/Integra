import {supabase, almacenamientoAuth} from '@/lib/supabase'
import { observable } from '@legendapp/state'
import { getAllSyncStates } from '@legendapp/state/sync'
import type { Session } from '@supabase/supabase-js'

export const auth$ = observable({
    session: null as Session | null,
    cargando: true,
    cerrandoSesion: false
})

//TODO: POR COMENTAR

async function limpiarDatosLocales() {
    //Resetear TODAS las tablas sincronizadas 
    //en memoria y en su cache persistida
    await Promise.all(
        getAllSyncStates().map(([syncState$]) => syncState$.reset())
    )

    //Borrar el resto de la cache local (sesion de supabase, por ej)
    await almacenamientoAuth.clear()
}

supabase.auth.onAuthStateChange((evento, sesion) => {
    auth$.session.set(sesion)
    auth$.cargando.set(false)

    if(evento === "SIGNED_OUT" && !auth$.cerrandoSesion.get()) {
        limpiarDatosLocales()
    }
})

export async function cerrarSesion() {
    //Bloquea la navegacion hasta que la limpieza termine por completo.
    auth$.cerrandoSesion.set(true)

    try {
        //Invalidar la sesion local y del servidor
        await supabase.auth.signOut()
        await limpiarDatosLocales()
    } finally {
        auth$.cerrandoSesion.set(false)
    }
}