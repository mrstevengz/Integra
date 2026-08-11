import { z } from 'zod'

export const OPCIONES_FORMA = [
    {valor: 'tableta', etiqueta: 'Tableta'},
    {valor: 'capsula', etiqueta: 'Capsula'},
    {valor: 'jarabe', etiqueta: 'Jarabe'},
    {valor: 'suspension', etiqueta: 'Suspension'},
    {valor: 'inyeccion', etiqueta: 'Inyeccion'},
    {valor: 'gotas', etiqueta: 'Gotas'},
    {valor: 'crema', etiqueta: 'Crema'},
    {valor: 'inhalador', etiqueta: 'Inhalador'},
    {valor: 'supositorio', etiqueta: 'Supositorio'},
    {valor: 'parche', etiqueta: 'Parche'},
]

export const OPCIONES_ALIMENTOS = [
    {valor: 'con', etiqueta: 'Con alimentos'},
    {valor: 'sin', etiqueta: 'Sin alimentos'},
    {valor: 'indiferente', etiqueta: 'Indiferente'},
]

export const OPCIONES_UNIDAD = [
    {valor: 'mg', etiqueta: 'mg'},
    {valor: 'g', etiqueta: 'g'},
    {valor: 'mcg', etiqueta: 'mcg'},
    {valor: 'ml', etiqueta: 'ml'},
    {valor: 'UI', etiqueta: 'UI'},
    {valor: 'gotas', etiqueta: 'gotas'},
    {valor: 'cucharadas', etiqueta: 'cucharadas'},
    {valor: 'tabletas', etiqueta: 'tabletas'},
    {valor: 'capsulas', etiqueta: 'capsulas'},
]

//Date.getDay() da domingo como 0, pero para leerlo mejor lo dejo de ultimo
export const DIAS_SEMANA = [
    {valor: 1, letra: 'L', nombre: 'Lunes'},
    {valor: 2, letra: 'K', nombre: 'Martes'},
    {valor: 3, letra: 'M', nombre: 'Miercoles'},
    {valor: 4, letra: 'J', nombre: 'Jueves'},
    {valor: 5, letra: 'V', nombre: 'Viernes'},
    {valor: 6, letra: 'S', nombre: 'Sabado'},
    {valor: 0, letra: 'D', nombre: 'Domingo'},
]

export const TODOS_LOS_DIAS = [0, 1, 2, 3, 4, 5, 6]

export const horarioFormSchema = z.object({
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {error: 'Hora invalida'}),
    dias: z.array(z.number()).min(1, {error: 'Selecciona al menos un dia'})
})

export const medicamentoSchema = z.object({
    nombre: z.string().trim()
        .min(2, {error: 'Ingresa el nombre del medicamento'})
        .max(80, {error: 'Maximo 80 caracteres'}),

    dosis: z.string().trim()
        .min(1, {error: 'Ingresa la dosis'})
        .refine((v) => /^\d+([.,]\d{1,3})?$/.test(v), {error: 'Solo numeros, ej: 50 o 2.5'}),

    unidad: z.string().trim().min(1, {error: 'Selecciona la unidad'}),

    forma: z.string().trim().min(1, {error: 'Selecciona la forma farmaceutica'}),

    con_alimentos: z.string().trim(),

    indicaciones: z.string().trim().max(300, {error: 'Maximo 300 caracteres'}),

    horarios: z.array(horarioFormSchema)
        .min(1, {error: 'Agrega al menos un horario'})
        .max(6, {error: 'Maximo 6 horarios por medicamento'}),
})

export type MedicamentoForm = z.infer<typeof medicamentoSchema>
export type HorarioForm = z.infer<typeof horarioFormSchema>

//Helper para pasar => "2,5" a 2.5
export function dosisANumero(dosis: string): number {
    return Number(dosis.replace(',', '.'))
}