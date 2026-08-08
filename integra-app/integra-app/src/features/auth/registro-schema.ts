import {z} from 'zod'

export const registroSchema = z.object({
    //Para paso 1 del form, datos basicos
    nombre: z.string().trim().min(2, {error: 'Ingresa tu nombre'}).max(60, {error: 'Maximo 60 caracteres'}),

    apellidos: z.string().trim().min(2, {error: 'Ingresa tu apellido'}).max(60, {error: 'Maximo 60 caracteres'}),

    email: z.email({error: "Correo electronico invalido"}),

    fechaNacimiento: z.date({error: "Selecciona tu fecha de nacimiento"}).refine((d) => d <= new Date(), {error: "La fecha no puede ser futura"}),


    //Paso 2 - contra
    password: z.string().min(8, {error: "Minimo 8 caracteres"}),

    confirmar: z.string(),

    //Paso 3 - contacto

    telefono: z.string().min(8, {error: 'Ingresa tu numero de telefono'}).max(20, {error: 'Maximo 20 caracteres'})
    .regex(/^[\d+()\s-]+$/, { error: 'Solo números, espacios y + ( ) -' }),

    cedula: z.string().trim().max(20, {error: 'Maximo 20 caracteres'}).refine((v) => v === '' || v.length >= 5, { error: 'Cédula demasiado corta' }),

    
}).refine((v) => v.password === v.confirmar, {
    error: "Las contraseñas no coinciden",
    path: ['confirmar'],
})

export type RegistroForm = z.infer<typeof registroSchema>
