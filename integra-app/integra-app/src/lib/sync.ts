import {configureSynced} from '@legendapp/state/sync'
import {observablePersistSqlite} from '@legendapp/state/persist-plugins/expo-sqlite'
import {configureSyncedSupabase, syncedSupabase} from '@legendapp/state/sync-plugins/supabase'
import { Storage } from 'expo-sqlite/kv-store'
import { supabase } from './supabase'
import { Alert } from 'react-native'
import { syncState } from '@legendapp/state'

//Legend-State plugin config, apunta a los campos que deberia tener cada tabla
configureSyncedSupabase({
    changesSince: 'last-sync', //Cambios desde ultimo sync, compara el valor de la tabla con el ultimo sync con el servidor
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})

//
export const syncedTable = configureSynced(syncedSupabase, {
    supabase,
    persist: {plugin: observablePersistSqlite(Storage), retrySync: true}, //Escribe el SQLite en cada cambio que hay y lo recarga al abrir la aplicacion.
    retry: {infinite: true},
    onError: (error, params) => {
        console.error(`[sync:${params.source}]`, error.message)

        const msg = error.message ?? ''
        const esConflicto = msg.includes('duplicate key') || msg.includes('unique constraint')

        //Conflicto de clave unica = el servidor YA tiene esa fila (otro dispositivo
        //la creo). La escritura local sobra: se revierte para que no quede pegada
        //en la cola de pendientes y se reintente en cada arranque.
        if (esConflicto) {
            params.revert?.()

            //Ademas hay un hueco en el cache: la fila del servidor nunca llego.
            //Con changesSince 'last-sync' no va a llegar sola, hay que bajar todo.
            try {
                const value$ = params.setParams?.value$
                if (value$) syncState(value$).sync({ resetLastSync: true })
            } catch (e) {
                console.warn('[sync] no se pudo forzar resync', e)
            }
            return
        }

        if (msg.includes('permission denied') || msg.includes('row-level security')) {
            Alert.alert('Error de sincronizacion', 'No se pudo guardar en el servidor. Intente mas tarde')
        }
    }
})