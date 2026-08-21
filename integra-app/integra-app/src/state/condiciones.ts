import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { delPerfil, porCreacion } from "./consultas";

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
export const condiciones$ = observable<Record<string, Condicion>>(syncedTable({
    collection: 'condiciones',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Condicion>,
    realtime: true,
    persist: {name: 'condiciones'}
}))

export function condicionesDelPerfil(
    todas: Record<string, Condicion> | undefined,
    perfilId: string | undefined,
): Condicion[] {
    return delPerfil(todas, perfilId).sort(porCreacion)
}