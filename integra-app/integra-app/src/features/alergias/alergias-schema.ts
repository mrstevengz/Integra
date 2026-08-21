import {z} from 'zod'
import { OpcionPicker } from '@/components/CampoSelect'

export const SEVERIDAD_ALERGIA: OpcionPicker[] = [
  {valor: 'Leve', etiqueta: 'Leve'},
  {valor: 'Moderada', etiqueta: 'Moderada'},
  {valor: 'Grave', etiqueta: 'Grave'}
]

export const alergiasSchema = z.object({
    nombre: z.string().trim().min(2, {error: 'Ingresa el nombre de la alergia'}).max(60, {error: 'Maximo 60 caracteres'}),

    severidad: z.string().trim(),

    detalles: z.string().trim().refine((v) => v === '' || v.length >= 5 || v.length <= 200, { error: 'Detalles muy cortos / muy largos' }),
})

export type AlergiasForm = z.infer<typeof alergiasSchema>
