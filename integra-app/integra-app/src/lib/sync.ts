import {configureSynced} from '@legendapp/state/sync'
import {observablePersistSqlite} from '@legendapp/state/persist-plugins/expo-sqlite'
import {configureSyncedSupabase, syncedSupabase} from '@legendapp/state/sync-plugins/supabase'
import { Storage } from 'expo-sqlite/kv-store'
import { supabase } from './supabase'

configureSyncedSupabase({
    changesSince: 'last-sync',
    fieldCreatedAt: 'created-at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})

export const syncedTable = configureSynced(syncedSupabase, {
    supabase,
    persist: {plugin: observablePersistSqlite(Storage), retrySync: true},
    retry: {infinite: true}
})