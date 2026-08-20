import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";

//TODO: POR COMENTAR

export type Alergia = {
    id: string;
    perfil_id: string;
    nombre: string
    severidad: string;
    detalles: string
    created_at?: string
}

export const alergia$ = observable(syncedTable({
    collection: 'alergias',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Alergia>,
    realtime: true,
    persist: {name: 'alergias'},
    fieldDeleted: 'deleted'
}))

// export function porId(
//     todos: Record<string, Alergia> | undefined,
//     id: string,
// ): Alergia | undefined {
//     return todos?.[id]
// }