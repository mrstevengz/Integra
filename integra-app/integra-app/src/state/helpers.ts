//Helpers genéricos para los retornos de legend state

//Se le pasa una lista completa de X objeto, y retorna el objeto que matchea con el UUID pasado (String). La lista debe ser un retorno de Legend State, que tiene <llave, objeto> como tipo.
export function retornarObjetoPorId<T>(
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