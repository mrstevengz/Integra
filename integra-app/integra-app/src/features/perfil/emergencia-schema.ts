import {z} from 'zod'
import { OpcionPicker } from '../../components/CampoSelect'


export const TIPO_RELACION: OpcionPicker[] = [
    {valor: 'Primaria', etiqueta: "Primaria"},
    {valor: 'Secundaria', etiqueta: "Secundaria"},
    {valor: 'Especializada', etiqueta: "Especializada"},
]

export const emergenciaSchema = z.object({
    nombre: z.string().trim().min(2, {error: "Escriba un nombre"}).max(80, {error: "El nombre es muy largo"}),

    telefono: z.string().trim().min(8, {error: 'Ingresa tu numero de telefono'}).max(20, {error: 'Maximo 20 caracteres'}),

    relacion: z.string().trim()
})

export type EmergenciaForm = z.infer<typeof emergenciaSchema>