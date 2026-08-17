import { EstadoToma } from "@/state/medicacion";


export type EstadoVisual = {
    etiqueta: string
    tile: string          
    iconoColor: string    
    titulo: string        
    detalle: string       
    accionable: boolean   
}


export function etiquetaEstado(estado: EstadoToma): string {
    const map: Record<EstadoToma, string> = {
        pendiente: 'Pendiente',
        tomada: 'Tomada',
        pospuesta: 'Pospuesta',
        omitida: 'Omitida'
    }
    return map[estado]
}

export function colorEstado(estado: EstadoToma): string {
    const map: Record<EstadoToma, string> = {
        pendiente: 'text-neutral-600 font-medium',
        tomada: 'text-neutral-900 font-semibold',
        pospuesta: 'text-neutral-600 font-medium italic',
        omitida: 'text-neutral-500 font-medium line-through',
    }
    return map[estado]
}
