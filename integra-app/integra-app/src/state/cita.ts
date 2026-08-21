import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { convertirALista } from "./helpers";
import { fechaLocal } from "./medicacion";


//TODO: POR COMENTAR


export type Cita = {
    id: string;
    perfil_id: string;
    tipo_citas: string;
    especialidad: string;
    medico: string;
    institucion: string;
    programada_para: Date;
    notas: string;
    created_at?: string;
}

export const cita$ = observable(syncedTable({
    collection: 'citas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Cita>,
    realtime: true,
    persist: {name: 'citas'}
}))

//IDs de las citas resueltas, de la tabla de resultados. Se hace esto para no volver a llamar la tabla de resultaods ne las otras funciones
export function idsResueltas(
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Set<string> {
    return new Set(
        convertirALista(resultados)
            .filter((r) => r && r.perfil_id === perfilId && r.cita_id)
            .map((r) => r.cita_id)
    )
}

//Citas a atender, las que se muestran en la pestalla de proximas, si no aparecen en la tabla de citaresultado, no estan resueltas.
export function citasNoResueltas(
    todos: Record<string, Cita> | undefined,
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Cita[] {
    const resueltas = idsResueltas(resultados, perfilId)
    return convertirALista(todos)
        .filter((c) => c && c.perfil_id === perfilId && c.programada_para)
        .filter((c) => !resueltas.has(c.id))
        .sort((a, b) =>
            new Date(a.programada_para).getTime() - new Date(b.programada_para).getTime()
        )
}

//Historial de citas en la tabla de resultados, de orden descendiente.
export function citasResueltas(
    todos: Record<string, Cita> | undefined,
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Cita[] {
    const resueltas = idsResueltas(resultados, perfilId)
    return convertirALista(todos)
        .filter((c) => c && c.perfil_id === perfilId && c.programada_para)
        .filter((c) => resueltas.has(c.id))
        .sort((a, b) =>
            new Date(b.programada_para).getTime() - new Date(a.programada_para).getTime()
        )
}

//Funcion para filtrar las citas que no estan resueltas y tienen la fecha de hoy.
export function filtrarPorDia(citas: Cita[], fecha: Date): Cita[] {
    const dia = fechaLocal(fecha)
    return citas.filter((c) => fechaLocal(new Date(c.programada_para)) === dia)
}

//El resultado de una cita concreta, para la pantalla de detalle.
export function resultadoDeCita(
    resultados: Record<string, ResultadoCita> | undefined,
    citaId: string,
): ResultadoCita | undefined {
    return convertirALista(resultados).find((r) => r?.cita_id === citaId)
}

export function fechaDesdeLocalISO(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d) 
}


export type ResultadoCita = {
    id: string;
    perfil_id: string;
    cita_id: string;
    tipo_resultado: string;
    diagnostico: string;
    instruccion?: string;
    ajuste_medicacion?: string;
    nota_cancelacion?: string
}

export const resultadoCita$ = observable(syncedTable({
    collection: 'citas_resultado',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, ResultadoCita>,
    realtime: true,
    persist: {name: 'citas_resultado'}
}))
