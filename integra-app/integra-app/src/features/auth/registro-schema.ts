import {z} from 'zod'

export const registroSchema = z.object({
    nombre: z.string().trim().min(2, {error: 'Ingresa tu nombre'}).max(60, {error: 'Maximo 60 caracteres'}),

    apellidos: z.string().trim().min(2, {error: 'Ingresa tu apellido'}).max(60, {error: 'Maximo 80 caracteres'}),

    email: z.email({error: "Correo electronico invalido"}),

    password: z.string().min(8, {error: "Minimo 8 caracteres"}),

    confirmar: z.string(),

    fechaNacimiento: z.date({error: "Selecciona tu fecha de nacimiento"}).refine((d) => d <= new Date(), {error: "La fecha no puede ser futura"}),

}).refine((v) => v.password === v.confirmar, {
    error: "Las contraseñas no coinciden",
    path: ['confirmar'],
})

export type RegistroForm = z.infer<typeof registroSchema>
