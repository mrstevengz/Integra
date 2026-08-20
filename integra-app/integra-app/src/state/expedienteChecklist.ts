import { observable } from "@legendapp/state"
import { observablePersistSqlite } from "@legendapp/state/persist-plugins/expo-sqlite"
import { synced } from "@legendapp/state/sync"
import { Storage } from 'expo-sqlite/kv-store'

//La Checklist es un tipo y variable persistente para recordar SOLO en el dispositivo si el usuario ya completo su expediente, y asi no mostrar el mensaje de alerta.
//Para completar el expediente, el usuario debe completar los campos de datos personales, alergias, condiciones, etc. Referir a /expediente/completar.tsx para ver mas datos


//Tipo de Checklist (no es una tabla en la base de datos)
export type Checklist = {
    id: string,
    label: string,
    incompleta: boolean
}

//Variable de LegendState que SOLAMENTE se almacena en el telefono.
export const expedienteChecklist$ = observable(synced({
    initial: {} as Record<string, boolean>,
    persist: {name: 'expedienteChecklist', plugin: observablePersistSqlite(Storage)}
}))
