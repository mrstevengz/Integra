import {z} from 'zod'

export const TIPO_CITA = [
    {valor: 'primera', etiqueta: 'Primera vez'},
    {valor: 'control', etiqueta: 'Control o seguimiento'},
    {valor: 'rutina', etiqueta: 'Rutina o preventiva'},
    {valor: 'prioritaria', etiqueta: 'Prioritaria'},
    {valor: 'urgencias', etiqueta: 'Urgencia'},
]
export const citasSchema = z.object({

    tipoCita: z.string().trim().min(1, {error: 'Selecciona el tipo de cita'}),

    especialidad: z.string().trim()
        .min(2, {error: 'Ingresa la especialidad'})
        .max(40, {error: 'Maximo 40 caracteres'}),

    medico: z.string().trim().min(2, {error: 'Ingresa el nombre del medico'})
        .max(60, {error: 'Maximo 60 caracteres'}),

    institucion: z.string().trim()
        .min(2, {error: 'Ingresa la institucion donde sera la cita'})
        .max(60, {error: 'Maximo 60 caracteres'}),
    
    fecha: z.date({ error: 'Selecciona la fecha' }),
    hora: z.date({ error: 'Selecciona la hora' }),

    notas: z.string().trim().max(200, {error: 'Maximo 200 caracteres'})

})

export type CitaForm = z.infer<typeof citasSchema>