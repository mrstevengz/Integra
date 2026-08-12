# FEATURES

Features es un directorio para cualquier componente / schema de la aplicacion.
Realmente se deberia almacenar los schemas en una carpeta y los componentes en otra, probablemente lo haga despues.

Esta dividido basado en la pantalla / parte de la aplicacion.

## Componentes

Los componentes son bloques de codigo reutilizables, que se les pasa props (en typescript) para cambiar los valores

La sintaxis general es un componente de React normal:

    export default function ... () {
        return (
            <>
            </>
        )
    }

y en TypeScript se les pasan "props" que son valores que se guardan dentro de un tipo o type, generalmente es:

    type TablaProps = {
        valores: tipo
        ...
        }

y adentro de la funcion:

    export default function ... ({valores}: TablaProps) {
    ...

}

## ZOD schema

Zod es basicamente una libreria que sirve para validar campos de tu base de datos que vas a pedir en un form.
Tiene un monton de herramientas, pero en general pasas el campo, el tipo y las opciones (minimo, maximo, etc) y luego esto genera un "schema" que se lo pasas a una herramienta
de forms, en este caso react-hook-forms, donde detecta automaticamente los errores cuando los escribis, y manda el error que queres dependiendo de como configuraste el schema.

Para cada form, se hace un schema (se le agrega -schema al nombre del archivo) y se tiene que exportar el tipo de schema zod (referir a cualquier archivo -schema en /features)

_Es importante dejar claro que solo se agregan los campos que se pondran en el form. Se omiten campos que un usuario no podria cambiar, es 100% una libreria para cliente a nivel de UI_
