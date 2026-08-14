# SCHEMA.ts

Para el proyecto, se escogio utilizar Drizzle como un ORM (Object Relational Mapper). Basicamente un intermediario para pasar codigo TS o lo que sea a lenguaje SQL (no preste atencion en base de datos).

La ventaja que tiene es que se van guardando "migraciones", que son archivos que tienen los cambios que se hacen a la base de datos en SQL. Esto deja mirar el historial de la base de datos,
y al final poder obtener la ultima version en codigo SQL para pegarlo en otra base de datos / etc.

Lo unico es que se tiene que guardar todo en un archivo schema.ts, entonces TODAS las tablas y las reglas / campos que tengan van a estar en el mismo archivo

SINTAXIS BASICA PARA DRIZZLE ORM

Tipos (dentro van los nombres):
.integer('id')
.text()
.uuid()
.boolean()
.timestamp()
.date()
.enum()

Constraints (van dsp del tipo):
.notNull()
.default('valor')
.defaultNow() --- tiempo
.primaryKey()
.defaultRandom() ----genera un id random para los UUIDS SOLAMENTE
.generatedAlwaysAsIdentity({startWith: 'numero'}) --- id autoincremento (startWith es donde empieza)

Para Postgre, se agregan policies a cada tabla. Son las reglas de la tabla, y lo que se le permite a cada usuario hacer. Para una tabla publica de lectura, solo se permite hacer SELECT, para una tabla solo para el usuario, se permite hacer select solo si el ID usuario matchea el ID de la tabla, igual en UPDATE e INSERTs.

_Al final de cada configuracion que se haga, se agrega enableRLS(), para habilitar la Row Level Security de Supabase. (Permitir solo a un usuario mirar las tablas a las que esta asociada su ID)_
