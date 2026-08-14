import { Path } from "react-hook-form"
import { RegistroForm } from "./registro-schema"

export type Paso = {
    titulo: string,
    subtitulo: string,
    campos: Path<RegistroForm>[]
}

export const PASOS: Paso[] = [
    {
        titulo: 'Informacion basica',
        subtitulo: 'Paso 1 de 3',
        campos: ['nombre', 'apellidos', 'email', 'fechaNacimiento']
    },
    {
        titulo: 'Contraseña',
        subtitulo: 'Paso 2 de 3 ——— elige una contraseña segura',
        campos: ['password', 'confirmar']
    },
    {
        titulo: 'Datos de contacto',
        subtitulo: 'Paso 3 de 3',
        campos: ['telefono', 'cedula']
    },
    
]