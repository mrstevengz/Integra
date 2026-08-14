//Helpers genéricos para los retornos de legend state

//Busca por id, se manda la lista de legend state
export function porId<T>(
    todos: Record<string, T> | undefined,
    id: string,
): T | undefined {
    return todos?.[id]
}

//Convierte la coleccion en un arreglo
export function comoLista<T>(
    todos: Record<string, T> | undefined,
): T[] {
    return Object.values(todos ?? {})
}