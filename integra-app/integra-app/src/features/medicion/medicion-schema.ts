import {z} from 'zod'

export const OPCIONES_CONTEXTO = [
    {valor: 'en_ayunas', etiqueta: 'En ayunas'},
    {valor: 'despues_comer', etiqueta: 'Despues de comer'},
    {valor: 'antes_dormir', etiqueta: 'Antes de dormir'},
    {valor: 'en_reposo', etiqueta: 'En reposo'},
    {valor: 'despues_ejercicio', etiqueta: 'Despues de ejercicio'},
    {valor: 'otro', etiqueta: 'Otro'},
]

const numeroMedicion = z.number({error: 'Ingresa un valor'}).positive({error: 'Debe ser mayor que cero'}).max(1000, {error: 'Valor  fuera de rango'})

export const medicionSchema = z.object({
    valor: numeroMedicion,
    medidoEn: z.date({ error: 'Selecciona la fecha' }).refine((d) => d <= new Date(), { error: 'No puede ser en el futuro' }),

    contexto: z.string(),

    nota: z.string().trim().max(200, {error: 'Maximo 200 caracteres'})
})

export const medicionDobleSchema = medicionSchema.extend({
    valorSecundario: numeroMedicion.optional()
})

export type MedicionForm = {
    valor: number
    valorSecundario?: number
    medidoEn: Date
    contexto: string
    nota: string
}

//Valor inicial del contador
export function valorInicial(min: number, max: number): number {
    return Math.round(((min + max) / 2) * 10) / 10
}

//Funcion para sumar o restar (determina cuanto avanza). Para la temperatura, de 0.1 en 0.1, para el resto, de 1 en 1
export function pasoDe(min: number , max: number): number {
    return (max-min) < 10 ? 0.1 : 1
}

export function redondear(n: number): number {
    return Math.round(n * 10) / 10
}