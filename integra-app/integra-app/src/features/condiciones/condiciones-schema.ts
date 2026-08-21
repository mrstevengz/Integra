import {z} from 'zod'
import { OpcionPicker } from '@/components/CampoSelect'

export const TIPO_CONDICION: OpcionPicker[] = [
  { valor: 'Cardiovascular', etiqueta: 'Cardiovascular' },
  { valor: 'Metabolica o Endocrina', etiqueta: 'Metabólica o Endocrina' },
  { valor: 'Respiratoria', etiqueta: 'Respiratoria' },
  { valor: 'Neurologica', etiqueta: 'Neurológica' },
  { valor: 'Musculo-esqueletica', etiqueta: 'Músculo-esquelética' },
  { valor: 'Digestiva o Gastrointestinal', etiqueta: 'Digestiva o Gastrointestinal' },
  { valor: 'Salud Mental o Emocional', etiqueta: 'Salud Mental o Emocional' },
  { valor: 'Neurodesarrollo o Neurodivergencia', etiqueta: 'Neurodesarrollo' },
  { valor: 'Inmunologica o Autoinmune', etiqueta: 'Inmunológica o Autoinmune' },
  { valor: 'Oncologica', etiqueta: 'Oncológica' },
  { valor: 'Renal o Urinaria', etiqueta: 'Renal o Urinaria' },
  { valor: 'Dermatologica', etiqueta: 'Dermatológica' },
  { valor: 'Sensorial o Discapacidad', etiqueta: 'Sensorial o Discapacidad' },
  { valor: 'Otra condicion', etiqueta: 'Otra condición' }
]

export const condicionesSchema = z.object({
    nombre: z.string().trim().min(2, {error: 'Ingresa el nombre de la condicion'}).max(60, {error: 'Maximo 60 caracteres'}),

    tipo: z.string().trim(),

    detalles: z.string().trim().refine((v) => v === '' || v.length >= 5 || v.length <= 200, { error: 'Detalles muy cortos / muy largos' }),

})

export type CondicionesForm = z.infer<typeof condicionesSchema>
