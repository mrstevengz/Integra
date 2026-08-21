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

export const alergias$ = observable(syncedTable({
    collection: 'alergias',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Alergia>,
    realtime: true,
    persist: {name: 'alergias'},
}))

