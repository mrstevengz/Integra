import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { delPerfil, porCreacion } from "./consultas";

const PRIORIDAD_RELACION: Record<string, number> = {
    Primaria: 0,
    Secundaria: 1,
    Especializada: 2,
}

//Tipo para representar un contacto de emergencia en la base de datos.
export type ContactoEmergencia = {
    id: string;
    perfil_id: string;
    nombre: string
    telefono: string;
    relacion: string
    created_at?: string
    deleted?: boolean
}

//Variable de LegendState para la tabla de la base de datos, permite select, create y update unicamente al usuario que le pertenecen estos campos
export const contactosEmergencia$ = observable<Record<string, ContactoEmergencia>>(syncedTable({
    collection: 'contactosemergencia',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, ContactoEmergencia>,
    realtime: true,
    persist: {name: 'contactosemergencia'}
}))

function porPrioridad(a: ContactoEmergencia, b: ContactoEmergencia): number {
    return (PRIORIDAD_RELACION[a.relacion] ?? 99) - (PRIORIDAD_RELACION[b.relacion] ?? 99)
}

export function contactosDelPerfil(
    todos: Record<string, ContactoEmergencia> | undefined,
    perfilId: string | undefined,
): ContactoEmergencia[] {
    return delPerfil(todos, perfilId).sort((a, b) => porPrioridad(a, b) || porCreacion(a, b))
}