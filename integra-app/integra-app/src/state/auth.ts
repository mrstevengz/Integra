import {supabase} from '@/lib/supabase'
import { observable } from '@legendapp/state'
import type { Session } from '@supabase/supabase-js'
import { Storage } from 'expo-sqlite/kv-store'

//Auth guarda el estado del usuario en la aplicacion, para poder llamar en cada pantalla y verificar al usuario logeado / llamar API calls especificas al usuario


//observable() permite asignar que propiedades van a ser observadas, leidas por legend-state
export const auth$ = observable({
    session: null as Session | null,
    cargando: true
})

//Listener para llamar la funcion cada vez que el estado del auth cambie.
supabase.auth.onAuthStateChange((_evento, sesion) => {
    auth$.session.set(sesion)
    auth$.cargando.set(false)
})

export async function cerrarSesion() {
    //Invalidar la sesion local y del servidor
    await supabase.auth.signOut()
    //Borrar toda la cache local
    await Storage.clear()
}

