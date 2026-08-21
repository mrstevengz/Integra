import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { fechaLocal } from "@/lib/fechas";
import { convertirALista, delPerfil, masAntiguoPrimero, masRecientePrimero } from "./consultas";

//TODO: POR COMENTAR

export type TipoCita = 'primera' | 'control' | 'rutina' | 'prioritaria' | 'urgencias'

export type TipoResultado = 'asistida' | 'no asistida' | 'cancelada'

export type Cita = {
    id: string;
    perfil_id: string;
    tipo_citas: TipoCita;
    especialidad: string;
    medico: string;
    institucion: string;
    programada_para: Date;
    notas: string;
    created_at?: string;
}

export type ResultadoCita = {
    id: string;
    perfil_id: string;
    cita_id: string;
    tipo_resultado: TipoResultado;
    diagnostico: string;
    instruccion?: string;
    ajuste_medicacion?: string;
    nota_cancelacion?: string
    created_at?: string;
}

export const citas$ = observable<Record<string, Cita>>(syncedTable({
    collection: 'citas',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Cita>,
    realtime: true,
    persist: {name: 'citas'}
}))

export const resultadosCita$ = observable<Record<string, ResultadoCita>>(syncedTable({
    collection: 'citas_resultado',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, ResultadoCita>,
    realtime: true,
    persist: {name: 'citas_resultado'}
}))

//IDs de las citas resueltas, de la tabla de resultados. Se hace esto para no volver a llamar la tabla de resultaods ne las otras funciones
function idsResueltas(
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Set<string> {
    return new Set(delPerfil(resultados, perfilId).map((r) => r.cita_id))
}

//Citas a atender, las que se muestran en la pestalla de proximas, si no aparecen en la tabla de citaresultado, no estan resueltas.
export function citasNoResueltas(
    todos: Record<string, Cita> | undefined,
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Cita[] {
    const resueltas = idsResueltas(resultados, perfilId)
    return delPerfil(todos, perfilId)
        .filter((c) => c.programada_para)
        .filter((c) => !resueltas.has(c.id))
        .sort(masAntiguoPrimero((c) => c.programada_para))
}

//Historial de citas en la tabla de resultados, de orden descendiente.
export function citasResueltas(
    todos: Record<string, Cita> | undefined,
    resultados: Record<string, ResultadoCita> | undefined,
    perfilId: string | undefined,
): Cita[] {
    const resueltas = idsResueltas(resultados, perfilId)
    return delPerfil(todos, perfilId)
        .filter((c) => c.programada_para)
        .filter((c) => resueltas.has(c.id))
        .sort(masRecientePrimero((c) => c.programada_para))
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

export function estaVencida(cita: Cita, ahora = Date.now()): boolean {
    return new Date(cita.programada_para).getTime() < ahora
}