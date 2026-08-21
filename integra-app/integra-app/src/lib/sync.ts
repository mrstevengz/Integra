import { syncState } from '@legendapp/state'
import { configureSynced } from '@legendapp/state/sync'
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite'
import { configureSyncedSupabase, syncedSupabase } from '@legendapp/state/sync-plugins/supabase'
import { Storage } from 'expo-sqlite/kv-store'
import { supabase } from './supabase'
import { crearId } from './ids'
import { Alert } from 'react-native'
import { auth$ } from '@/state/auth'

//Legend-State plugin config, apunta a los campos que deberia tener cada tabla
configureSyncedSupabase({
    generateId: crearId,
    changesSince: 'last-sync', //Cambios desde ultimo sync, compara el valor de la tabla con el ultimo sync con el servidor
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})

function esConflictoDeClave(mensaje: string): boolean {
    return mensaje.includes('duplicate key') || mensaje.includes('unique constraint')
}

function esErrorDePermisos(mensaje: string): boolean {
    return mensaje.includes('permission denied') || mensaje.includes('row-level security')
}

export const syncedTable = configureSynced(syncedSupabase, {
    supabase,
    persist: {plugin: observablePersistSqlite(Storage), retrySync: true}, //Escribe el SQLite en cada cambio que hay y lo recarga al abrir la aplicacion.
    retry: {infinite: true},
    waitFor: () => !!auth$.session.get(),
    onError: (error, params) => {
        console.error(`[sync:${params.source}]`, error.message)

        const msg = error.message ?? ''

        //Conflicto de clave unica = el servidor YA tiene esa fila (otro dispositivo
        //la creo). La escritura local sobra: se revierte para que no quede pegada
        //en la cola de pendientes y se reintente en cada arranque.
        if (esConflictoDeClave(msg)) {
            params.revert?.()
            try {
                const value$ = params.setParams?.value$
                if (value$) syncState(value$).sync({ resetLastSync: true })
            } catch (e) {
                console.warn('[sync] no se pudo forzar resync', e)
            }
            return
        }

        if (esErrorDePermisos(msg)) {
            Alert.alert('Error de sincronizacion', 'No se pudo guardar en el servidor. Intente mas tarde')
        }
    }
})
