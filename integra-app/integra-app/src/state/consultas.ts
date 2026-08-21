//Helpers genéricos para los retornos de legend state

export type ConUsuario = {
    perfil_id: string
}

export type ConFechaCreacion = {
    created_at?: string | null
}

export type ConNombre = {
    nombre: string
}

//Se le pasa una lista completa de X objeto, y retorna el objeto que matchea con el UUID pasado (String). La lista debe ser un retorno de Legend State, que tiene <llave, objeto> como tipo.
export function buscarPorId<T>(
    todos: Record<string, T> | undefined,
    id: string,
): T | undefined {
    return todos?.[id]
}

//Convierte una coleccion de Legend State <llave, objeto> a un arreglo de los objetos. Util para renderizar informacion y mapearla en las pantallas
export function convertirALista<T>(
    todos: Record<string, T> | undefined,
): T[] {
    return Object.values(todos ?? {})
}

export function delPerfil<T extends ConUsuario>(
    todos: Record<string, T> | undefined,
    perfilId: string | undefined,
): T[] {
    if (!perfilId) return []
    return convertirALista(todos).filter((fila) => fila && fila.perfil_id === perfilId)
}

export function porCreacion<T extends ConFechaCreacion>(a: T, b: T): number {
    return (a.created_at ?? '9999').localeCompare(b.created_at ?? '9999')
}

export function porNombre<T extends ConNombre>(a: T, b: T): number {
    return a.nombre.localeCompare(b.nombre)
}

export function masAntiguoPrimero<T>(obtenerFecha: (fila: T) => Date | string) {
    return (a: T, b: T) =>
        new Date(obtenerFecha(a)).getTime() - new Date(obtenerFecha(b)).getTime()
}

export function masRecientePrimero<T>(obtenerFecha: (fila: T) => Date | string) {
    return (a: T, b: T) =>
        new Date(obtenerFecha(b)).getTime() - new Date(obtenerFecha(a)).getTime()
}