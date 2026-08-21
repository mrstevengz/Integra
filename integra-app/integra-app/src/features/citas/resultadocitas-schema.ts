import {z} from 'zod'

export const RESULTADO_CITA = [
    {valor: 'asistida', etiqueta: 'Si, asisti'},
    {valor: 'no asistida', etiqueta: 'No asisti'},
    {valor: 'cancelada', etiqueta: 'Se cancelo'},
]

export const resultadoCitasSchema = z.object({

    resultado: z.string().trim().min(1, {error: 'Selecciona el resultado de la cita'}),

    diagnostico: z.string().trim().max(200, {error: 'Maximo 200 caracteres'}),

    instruccion: z.string().trim().max(200, {error: 'Maximo 200 caracteres'}),

    ajusteMedicacion: z.string().trim().max(200, {error: 'Maximo 200 caracteres'}),

    notaCancelacion: z.string().trim().max(200, {error: 'Maximo 200 caracteres'}),

})

export type ResultadoCitaForm = z.infer<typeof resultadoCitasSchema>