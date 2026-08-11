# STATES: Carpeta para almacenar informacion localmente en el telefono

Como la aplicacion es local-first (es lo mas logico para una aplicacion de mediciones, etc) tiene que almacenar la informacion offline en el telefono.

**Legend State** es una libreria que guarda la informacion en el SQlite local, pero tambien manda API requests cuando SI se tiene conexion.

El flujo es:
_Con conexion_ Carga informacion local -> Manda FETCH request -> Actualiza informacion local
_Sin conexion_ Carga informacion local -> Cumple requests localmente y los almacena en una cola -> Cuando se tiene internet de nuevo, se sincroniza la nueva informacion del telefono con la base de datos, la info del telefono se guarda en la DB, la nueva info del DB se guarda local en el telefono.

Si se tiene configurado, no se necesita crear API request directamente a la base de datos, ya lo hace la libreria.

En **auth.ts** esta la configuracion general de Legend State

Para cada seccion crucial de la aplicacion, se crea un archivo llamado (seccion).ts

## Sintaxis general

La sintaxis local es:

export type (Tabla) = {
id: string,
...
}

_Donde se almacena COMO se guarda / se mira la respuesta de la base de datos, basicamente la forma de la tabla de la DB._

    export const (seccion)$ = observable<(Tabla)>(syncedTable( {
    collection: '(seccion)', -> Nombre de la tabla de la base de datos / supabase. **Tiene que coincidir con el nombre de la tabla, si no da error**

    actions: ['read', 'update'],   -> Guarda las acciones (REST API) que puede realizar Legend State sobre la tabla. **Nunca se usa delete, si no que se actualiza el campo deleted a TRUE**

    initial: {},   -> Forma inicial que va a retornar mientras hace el request / da error. Es opcional al configurar, pero se recomienda ponerlo siempre, porque si se tarda un poco en cargar la informacion mandaria error directamente en vez de esperarla

    realtime: true,   -> Mientras tenga conexion, se va a actualizar en tiempo real cualquier cambio que se haga

    persist: {name: 'perfil'}     -> Nombre de la tabla en SQLite en el telefono / recomendado no dejarlo igual que la tabla de la db

    }))

as: 'value', -> Esta configuracion retorna los resultados como un objeto. Solo se utiliza para UN caso especifico, **usuario.ts** porque solo debe haber un usuario. Si se pone en cualquier
otra tabla, va a retornar solo un valor, lo cual no se desea.
