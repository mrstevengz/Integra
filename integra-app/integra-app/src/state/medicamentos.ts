import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";
import { delPerfil, porNombre } from "./consultas";

//-------Tipos para los ENUMS de la base de datos--------

//Tipo para representar los campos de la forma farmaceutica del medicamento que se esta agregando. Se usa en features/medicacion/TomasDelDia.tsx y features/medicacion/generar-tomas.ts
export type FormaFarmaceutica =
    | 'tableta' | 'capsula' | 'jarabe' | 'suspension' | 'inyeccion'
    | 'gotas' | 'crema' | 'inhalador' | 'supositorio' | 'parche'

//Tipo para representar el campo Con Alimentos? del formulario y el ENUM en la base de datos
export type ConAlimentos = 'con' | 'sin' | 'indiferente'

//Tipo para representar la forma del horario en la base de datos. Cada medicacion puede tener hasta un max de 5 horarios. Se presenta la hora como string y los dias como un array de numeros, donde [0, 2, 4] representan Domingo, Martes y Jueves tanto en el UI como en la funcion de generar tomas. Se hace de esta manera porque la funcion de JavaScript para Date, retorna una lista de dias de la misma forma array.
export type HorarioMed = {
    id: string
    hora: string
    dias: number[]
}

//Tipo para representar el Medicamento de la base de datos
export type Medicamento = {
    id: string
    perfil_id: string
    nombre: string
    dosis: number
    unidad: string
    forma: FormaFarmaceutica
    con_alimentos: ConAlimentos | null
    indicaciones: string | null
    activo: boolean
    horarios: HorarioMed[]
    updated_at?: string | null
    created_at?: string | null
}

//Variable de legend state para la tabla de medicamentos, permisos de select, create y update unicamente para el usuario con el id del row. 
export const medicamentos$ = observable<Record<string, Medicamento>>(syncedTable({
    collection: 'medicamentos',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicamento>,
    realtime: true,
    persist: {name: 'medicamentos'}
}))

//----------------HELPERS----------------

//Recibe una lista de medicamentos, y el id del usuario por proteccion contra la cache. Regresa la lista ordenada, todos los medicamentos que le pertenecen al ID que se le pasa y tienen el tag de activo
export function medicamentosActivos(
    todos: Record<string, Medicamento> | undefined, perfilId: string | undefined,
): Medicamento[] {
    return delPerfil(todos, perfilId)
        .filter((m) => m.activo)
        .sort(porNombre)
}

//Retorna los horarios ordenados de un medicamento especifico.
export function horariosOrdenados(m: Medicamento): HorarioMed[] {
    return [...m.horarios].sort((a, b) => a.hora.localeCompare(b.hora))
}

//[0,1,2,3,4,5,6] -> "Todos los dias" | [1,3,5] -> "L, M, V"
export function formatearDias(dias: number[]): string {
    if (dias.length === 7) return 'Todos los dias'
    if (dias.length === 0) return 'Sin dias'

    const letras = ['D', 'L', 'K', 'M', 'J', 'V', 'S']
    return [...dias].sort((a, b) => a - b).map((d) => letras[d]).join(', ')
}