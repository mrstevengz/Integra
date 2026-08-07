import {configureSynced} from '@legendapp/state/sync'
import {observablePersistSqlite} from '@legendapp/state/persist-plugins/expo-sqlite'
import {configureSyncedSupabase, syncedSupabase} from '@legendapp/state/sync-plugins/supabase'
import { Storage } from 'expo-sqlite/kv-store'
import { supabase } from './supabase'

//Legend-State plugin config, apunta a los campos que deberia tener cada tabla
configureSyncedSupabase({
    changesSince: 'last-sync', //Cambios desde ultimo sync, compara el valor de la tabla con el ultimo sync con el servidor
    fieldCreatedAt: 'created-at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})

//
export const syncedTable = configureSynced(syncedSupabase, {
    supabase,
    persist: {plugin: observablePersistSqlite(Storage), retrySync: true}, //Escribe el SQLite en cada cambio que hay y lo recarga al abrir la aplicacion.
    retry: {infinite: true}
})