import {sql} from 'drizzle-orm'
import { pgTable, pgPolicy, uuid, text, boolean, timestamp, index, date, pgEnum, integer, numeric, time, unique, jsonb} from 'drizzle-orm/pg-core'
//Roles de supabase
import {anonRole, authenticatedRole, authUid, authUsers} from 'drizzle-orm/supabase'



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
    severidad: text('severidad').notNull(),
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

export const contactosemergencia = pgTable('contactosemergencia', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    nombre: text('nombre').notNull(),
    telefono: text('telefono').notNull(),
    relacion: text('relacion').notNull(),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
        pgPolicy('contactosemergencia_select_propio', {
            for: 'select',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
    }),
        pgPolicy('contactosemergencia_create_propio', {
            for: 'insert',
            to: authenticatedRole,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),

        pgPolicy('contactosemergencia_update_propio', {
            for: 'update',
            to: authenticatedRole,
            using: sql`${authUid} = ${table.perfil_id}`,
            withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()

//PANTALLA MEDICACION

export const formaFarmaceuticaEnum = pgEnum('forma_farmaceutica', [
    'tableta', 'capsula', 'jarabe', 'suspension', 'inyeccion',
    'gotas', 'crema', 'inhalador', 'supositorio', 'parche',
])

export const conAlimentosEnum = pgEnum('con_alimentos', [
    'con', 'sin', 'indiferente',
])

export const estadoTomaEnum = pgEnum('estado_toma', [
    'pendiente', 'tomada', 'pospuesta', 'omitida',
])

export type HorarioMed = {
    id: string
    hora: string
    dias: number[]
}

export const medicamentos = pgTable('medicamentos', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),

    nombre: text('nombre').notNull(),
    dosis: numeric('dosis', {precision: 8, scale: 3}).notNull(),
    unidad: text('unidad').notNull(),
    forma: formaFarmaceuticaEnum('forma').notNull(),
    con_alimentos: conAlimentosEnum('con_alimentos'),
    indicaciones: text('indicaciones'),

    //Permite pausar un tratamiento sin borrar su historial
    activo: boolean('activo').notNull().default(true),

    
    horarios: jsonb('horarios').$type<HorarioMed[]>().notNull().default(sql`'[]'::jsonb`),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
    index('medicamentos_perfil_idx').on(table.perfil_id),

    pgPolicy('medicamentos_select_propio', {
        for: 'select', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('medicamentos_create_propio', {
        for: 'insert', to: authenticatedRole,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('medicamentos_update_propio', {
        for: 'update', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()  


export const tomas = pgTable('tomas', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    medicamento_id: uuid('medicamento_id').notNull().references(() => medicamentos.id, {onDelete: 'cascade'}),
    
    horario_id: uuid('horario_id'),

    programada_para: timestamp('programada_para', {withTimezone: true}).notNull(),
    estado: estadoTomaEnum('estado').notNull().default('pendiente'),
    registrada_en: timestamp('registrada_en', {withTimezone: true}),
    pospuesta_hasta: timestamp('pospuesta_hasta', {withTimezone: true}),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),

}, (table) => [
    //Hace imposible duplicar una dosis, sin importar cuantas veces corra el generador
    unique('tomas_medicamento_programada_unq').on(table.medicamento_id, table.programada_para),
    index('tomas_perfil_programada_idx').on(table.perfil_id, table.programada_para),

    pgPolicy('tomas_select_propio', {
        for: 'select',
        to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('tomas_create_propio', {
        for: 'insert',
        to: authenticatedRole,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('tomas_update_propio', {
        for: 'update',
        to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()