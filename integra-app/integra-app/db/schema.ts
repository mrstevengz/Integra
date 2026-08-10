import {sql} from 'drizzle-orm'
import { pgTable, pgPolicy, uuid, text, boolean, timestamp, index, date, pgEnum} from 'drizzle-orm/pg-core'
//Roles de supabase
import {anonRole, authenticatedRole, authUid, authUsers} from 'drizzle-orm/supabase'

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

//ENUMS

export const tipoSangreEnum = pgEnum('tipo_sangre', [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
])

//Tabla de articulo
export const articulos = pgTable('articulos', {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: text('titulo').notNull(),
    categoria: text('categoria').notNull(),

    sintomas: text('sintomas').notNull(),
    tratamientos: text('tratamientos').notNull(),
    cuidados: text('cuidados').notNull(),

    //Requerido para Legend-State (sync offline)
    //SE PUEDE COPIAR Y PEGAR EN OTRA TABLA SIN PROBLEMA, TODAS TIENEN QUE LLEVARLO
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

//Tabla de perfiles

export const perfiles = pgTable('perfiles', {
    id: uuid('id').primaryKey().references(() => authUsers.id, {onDelete: "cascade"}),
    nombre: text('nombre').notNull(),
    apellidos: text('apellidos').notNull(),
    email: text('email').notNull(),
    fechaNacimiento: date('fecha_nacimiento', {mode: 'string'}),


    //Nulos, se piden en la seccion de perfil despues

    genero: text('genero'),
    cedula: text('cedula'),
    telefono: text('telefono'),
    tipoSangre: tipoSangreEnum('tipo_sangre'),
    medicoTratante: text('medico_tratante'),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
    //Politica para insertar
    pgPolicy('perfiles_select_propio', {
        for: 'select',
        to: authenticatedRole,
        using: sql`${authUid} = ${table.id}`
    }),
    pgPolicy('perfiles_update_propio', {
        for: 'update',
        to: authenticatedRole,
        using: sql`${authUid} = ${table.id}`,
        withCheck: sql`${authUid} = ${table.id}`
    })
]).enableRLS()

export const condiciones = pgTable('condiciones', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    nombre: text('nombre').notNull(),
    tipo: text('tipo').notNull(),
    detalles: text('detalles').notNull(),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
        pgPolicy('condiciones_select_propio', {
            for: 'select',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
    }),
        pgPolicy('condiciones_create_propio', {
            for: 'insert',
            to: authenticatedRole,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),

        pgPolicy('condiciones_update_propio', {
            for: 'update',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()

export const alergias = pgTable('alergias', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    nombre: text('nombre').notNull(),
    severidad: text('tipo').notNull(),
    detalles: text('detalles').notNull(),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
        pgPolicy('alergias_select_propio', {
            for: 'select',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
    }),
        pgPolicy('alergias_create_propio', {
            for: 'insert',
            to: authenticatedRole,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),

        pgPolicy('alergias_update_propio', {
            for: 'update',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()