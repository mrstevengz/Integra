import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";

//Tipo para representar una Condicion de la base de datos.
export type Condicion = {
    id: string;
    perfil_id: string;
    nombre: string
    tipo: string;
    detalles: string
    created_at?: string
}

//Variable de legend state, permite hacer select, create y update unicamente al usuario que le pertenecen estas filas. 
export const condicion$ = observable(syncedTable({
    collection: 'condiciones',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Condicion>,
    realtime: true,
    persist: {name: 'condiciones'}
}))

// export function porId(
//     todos: Record<string, Condicion> | undefined,
//     id: string,
// ): Condicion | undefined {
//     return todos?.[id]
// }