import type { RangoHistorial, SeccionExpediente, Vigencia } from "@/state/exportaciones"

export const SECCIONES: {
    valor: SeccionExpediente
    etiqueta: string
    detalle: string
}[] = [
    { valor: 'datosPersonales',      etiqueta: 'Datos personales',        detalle: 'Nombre, cedula, fecha de nac., tipo de sangre...' },
    { valor: 'condicionesYAlergias', etiqueta: 'Condiciones y alergias',  detalle: 'Diagnosticos, discapacidades, alergias' },
    { valor: 'medicacionActiva',     etiqueta: 'Medicacion activa',       detalle: 'Medicamentos y dosis actuales' },
    { valor: 'historialMedicacion',  etiqueta: 'Historial de medicacion', detalle: 'Medicamentos anteriores' },
    { valor: 'mediciones',           etiqueta: 'Mediciones de salud',     detalle: 'Glucosa, presion, peso...' },
    { valor: 'citas',                etiqueta: 'Citas medicas',           detalle: 'Pasadas y futuras' },
    { valor: 'contactosEmergencia',  etiqueta: 'Contactos de emergencia', detalle: 'Nombre y telefono' },
]

export const RANGOS: { valor: RangoHistorial; etiqueta: string }[] = [
    { valor: '1m',   etiqueta: '1 mes' },
    { valor: '3m',   etiqueta: '3 meses' },
    { valor: '6m',   etiqueta: '6 meses' },
    { valor: 'todo', etiqueta: 'Todo' },
]

export const VIGENCIAS: { valor: Vigencia; etiqueta: string; detalle: string }[] = [
    { valor: '1h',  etiqueta: '1 hora',   detalle: 'Ideal para uso inmediato' },
    { valor: '24h', etiqueta: '24 horas', detalle: 'Para consultas del dia' },
    { valor: '7d',  etiqueta: '7 dias',   detalle: 'Para atencion de seguimiento' },
    { valor: '30d', etiqueta: '30 dias',  detalle: 'Para cuidados continuos' },
]

export const SECCIONES_POR_DEFECTO: Record<SeccionExpediente, boolean> = {
    datosPersonales: true,
    condicionesYAlergias: true,
    medicacionActiva: true,
    historialMedicacion: false,
    mediciones: true,
    citas: false,
    contactosEmergencia: true,
}