import { EstadoToma } from "@/state/tomas";


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
        pendiente: 'text-content font-semibold',
        tomada: 'text-success-on-subtle font-medium',
        pospuesta: 'text-warning-on-subtle font-semibold',
        omitida: 'text-danger font-medium',
    }
    return map[estado]
}
