# LIB

Carpeta para configuraciones de Supabase y Legend State, se configura la constante de supabase que se reutiliza en el resto de los archivos,
Y se configura Legend State

## Reglas de Legend State

La documentacion de la libreria recomienda en el 100% de los casos utilizar 3 campos en CADA tabla que se haga.
**updated_at** -> datetime
**created_at** -> datetime
**deleted** -> boolean

Esto es para comparar con la base de datos si los archivos locales estan actualizados, etc. Al hacer una nueva tabla en schema.ts, se necesitan agregar los 3 campos para que Legend State funcione.
