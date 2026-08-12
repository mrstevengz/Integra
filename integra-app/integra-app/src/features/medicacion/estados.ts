import { EstadoToma } from "@/state/medicacion";

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
        pendiente: 'text-slate-500',
        tomada: 'text-teal-700',
        pospuesta: 'text-amber-600',
        omitida: 'text-red-600',
    }
    return map[estado]
}