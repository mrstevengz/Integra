import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";

//Tipo para representar un contacto de emergencia en la base de datos.
export type ContactoEmergencia = {
    id: string;
    perfil_id: string;
    nombre: string
    telefono: string;
    relacion: string
    created_at?: string
}

//Variable de LegendState para la tabla de la base de datos, permite select, create y update unicamente al usuario que le pertenecen estos campos
export const contactoEmergencia$ = observable(syncedTable({
    collection: 'contactosemergencia',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, ContactoEmergencia>,
    realtime: true,
    persist: {name: 'contactosemergencia'}
}))


// export function porId(
//     todos: Record<string, ContactoEmergencia> | undefined,
//     id: string,
// ): ContactoEmergencia | undefined {
//     return todos?.[id]
// }