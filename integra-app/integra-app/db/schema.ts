import {sql} from 'drizzle-orm'
import { pgTable, pgPolicy, uuid, text, boolean, timestamp, index} from 'drizzle-orm/pg-core'
//Roles de supabase
import {anonRole, authenticatedRole} from 'drizzle-orm/supabase'

//SINTAXIS BASICA PARA DRIZZLE ORM
/*
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

*/


export const articulo = pgTable('articulo', {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: text('titulo').notNull(),
    categoria: text('categoria').notNull(),

    sintomas: text('sintomas').array().notNull().default(sql`'{}'::text[]`),
    tratamientos: text('tratamientos').array().notNull().default(sql`'{}'::text[]`),
    cuidados: text('cuidados').array().notNull().default(sql`'{}'::text[]`),

    //Requerido para Legend-State (sync offline)
    //Timestamp requiere de configuraciones (se agrega el timezone)
    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false)

    //Configuraciones extra (van las politicas, indices, etc)
}, (table) => [
    index('articulos_updated_at_idx').on(table.updatedAt),

    //Politica para que solo se pueda hacer select (cargar los articulos)
    pgPolicy('articulos_lectura_publica', {
        for: 'select',
        to: [anonRole, authenticatedRole],
        using: sql`true`,
    })
    //Habilitar row level security
]).enableRLS()