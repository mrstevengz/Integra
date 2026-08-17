import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { comoLista } from "./helpers";
import { fechaLocalISO } from "./medicacion";


export type Cita = {
    id: string;
    perfil_id: string;
    tipo_citas: string;
    especialidad: string;
    medico: string;
    institucion: string;
    programada_para: Date;
    notas: string;
    cancelada?: boolean;
    nota_cancelacion?: string


}
export const cita$ = observable(syncedTable({
    collection: 'citas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Cita>,
    realtime: true,
    persist: {name: 'citas'}
}))


export function citasDelDia(
    todos: Record<string, Cita> | undefined,
    fecha: Date,
    perfilId: string | undefined,
): Cita[] {
    const dia = fechaLocalISO(fecha)
    return comoLista(todos)
        //Descarta filas incompletas antes de tocarlas
        .filter((c) => c && c.perfil_id === perfilId && c.programada_para)
        .filter((c) => fechaLocalISO(new Date(c.programada_para)) === dia)
        //Ordena por el INSTANTE, no por el texto. Funciona con string, Date o numero.
        .sort((a, b) =>
            new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
        )
}

export function citasProximas(
    todos: Record<string, Cita> | undefined,
    fecha: Date,
    perfilId: string | undefined
): Cita[] {
    const dia = fechaLocalISO(fecha)
    return comoLista(todos)
    .filter((c) => c && c.perfil_id === perfilId && c.programada_para)
    .filter((c) => fechaLocalISO(new Date(c.programada_para)) > dia && c.cancelada === false)
    .sort((a, b) =>
        new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
    )
}

export function citasPasadas(
    todos: Record<string, Cita> | undefined,
    fecha: Date,
    perfilId: string | undefined
): Cita[] {
    const dia = fechaLocalISO(fecha)
    return comoLista(todos)
    .filter((c) => c && c.perfil_id === perfilId && c.programada_para)
    .filter((c) => fechaLocalISO(new Date(c.programada_para)) < dia || c.cancelada === true)
    .sort((a, b) =>
        new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
    )
}