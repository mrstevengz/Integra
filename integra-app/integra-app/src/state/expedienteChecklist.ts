import { observable } from "@legendapp/state"
import { observablePersistSqlite } from "@legendapp/state/persist-plugins/expo-sqlite"
import { synced } from "@legendapp/state/sync"
import { Storage } from 'expo-sqlite/kv-store'

export type Checklist = {
    id: string,
    label: string,
    incompleta: boolean
}

export const expedienteChecklist$ = observable(synced({
    initial: {} as Record<string, boolean>,
    persist: {name: 'expedienteChecklist', plugin: observablePersistSqlite(Storage)}
}))
