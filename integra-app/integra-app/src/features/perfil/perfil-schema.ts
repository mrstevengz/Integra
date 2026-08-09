import {z} from 'zod'

export const OPCIONES_GENEROS = [
    {valor: 'MASCULINO', etiqueta: 'Masculino'},
    {valor: 'FEMENINO', etiqueta: 'Femenino'},
    {valor: 'SIN DEFINIR', etiqueta: 'Otro'}
]

export const TIPOS_SANGRE = [
    {valor: 'A+', etiqueta: 'A+'},
    {valor: 'A-', etiqueta: 'A-'},
    {valor: 'B+', etiqueta: 'B+'},
    {valor: 'B-', etiqueta: 'B-'},
    {valor: 'AB+', etiqueta: 'AB+'},
    {valor: 'AB-', etiqueta: 'AB-'},
    {valor: 'O+', etiqueta: 'O+'},
    {valor: 'O-', etiqueta: 'O-'},
]



export const perfilSchema = z.object({
    nombre: z.string().trim().min(2, {error: 'Ingresa tu nombre'}).max(60, {error: 'Maximo 60 caracteres'}),
    apellidos: z.string().trim().min(2, {error: 'Ingresa tu apellido'}).max(60, {error: 'Maximo 60 caracteres'}),

    genero: z.string().trim(),

    cedula: z.string().trim().max(20, {error: 'Maximo 20 caracteres'}).refine((v) => v === '' || v.length >= 5, { error: 'Cédula demasiado corta' }),

    tipoSangre: z.string().trim(),

    telefono: z.string().min(8, {error: 'Ingresa tu numero de telefono'}).max(20, {error: 'Maximo 20 caracteres'})
    .regex(/^[\d+()\s-]+$/, { error: 'Solo números, espacios y + ( ) -' }),
    medicoTratante: z.string().trim().min(2, {error: 'Ingresa el nombre del medico tratante'}).max(60, {error: 'Maximo 60 caracteres'}),
})

export type PerfilForm = z.infer<typeof perfilSchema>
