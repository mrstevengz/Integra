import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";

export type ContactoEmergencia = {
    id: string;
    perfil_id: string;
    nombre: string
    telefono: string;
    relacion: string
}

//Collection name debe matchear la tabla de Supabase
export const contactoEmergencia$ = observable(syncedTable({
    collection: 'contactosemergencia',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, ContactoEmergencia>,
    realtime: true,
    persist: {name: 'contactosemergencia'}
}))

export function porId(
    todos: Record<string, ContactoEmergencia> | undefined,
    id: string,
): ContactoEmergencia | undefined {
    return todos?.[id]
}