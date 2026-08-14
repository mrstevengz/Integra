# 8. Carpeta `db/` — Drizzle y Supabase

> El esquema de la base de datos, las migraciones y las políticas de seguridad.

| Librería | Versión | Documentación |
|---|---|---|
| `drizzle-orm` | `^0.45.2` | https://orm.drizzle.team/docs/overview |
| `drizzle-kit` | `^0.31.10` | https://orm.drizzle.team/docs/kit-overview |
| `drizzle-orm/supabase` | (incluido) | https://orm.drizzle.team/docs/rls |
| `pg` | `^8.22.0` | https://node-postgres.com/ |
| `dotenv` | `^17.4.2` | https://github.com/motdotla/dotenv |
| Supabase (servicio) | PostgREST + Postgres | https://supabase.com/docs/guides/database/postgres/row-level-security |

---

## 8.1 Qué papel cumple Drizzle (y cuál no)

Drizzle es un **ORM**: un intermediario que traduce definiciones de TypeScript a SQL.

En este proyecto es **una herramienta de tiempo de compilación**. Vive en `devDependencies`,
corre en la laptop del desarrollador, genera SQL y ahí termina su trabajo.
**Nunca se incluye en el bundle de la app ni se conecta a Postgres desde el teléfono.**

Esto es intencional y es lo que preserva RLS:

| Forma de usar Drizzle | Rol de conexión | Estado de RLS |
|---|---|---|
| Como cliente directo (`postgres://`) | `postgres` (dueño de las tablas) | ❌ **RLS ignorado** — los dueños lo saltan |
| Solo como esquema y migraciones | La app va por PostgREST como `authenticated` | ✅ **RLS aplicado siempre** |

Usamos la segunda. El camino en tiempo de ejecución es siempre:

```
app → supabase-js → PostgREST → Postgres (con RLS)
```

La ventaja de declarar las políticas en Drizzle con `pgPolicy` en lugar de escribirlas a mano en
el dashboard es que quedan **versionadas en Git y revisables en el PR**, y no pueden desviarse
entre ambientes.

### Por qué `db/` está fuera de `src/`

Metro empaqueta todo lo que está en `src/`. Manteniendo el esquema afuera, la frontera entre
"código de base de datos" y "código de app" es **física** y no depende de que alguien la
recuerde.

---

## 8.2 Archivos y comandos

```
db/schema.ts        ← definición de tablas y políticas (todo en un solo archivo)
drizzle.config.ts   ← configuración de drizzle-kit
drizzle/            ← migraciones SQL generadas (se versionan en Git)
drizzle/meta/       ← instantáneas del esquema (no se editan a mano)
```

```bash
npx drizzle-kit generate           # genera el .sql a partir de db/schema.ts
npx drizzle-kit generate --custom  # genera un .sql vacío para SQL a mano (triggers, funciones)
npx drizzle-kit migrate            # aplica las migraciones pendientes
```

> ⛔ **Usá siempre `generate` + `migrate`, nunca `push`.** `push` compara el esquema contra la
> base de datos y aplica cambios sin dejar un archivo revisable. Es aceptable en un prototipo
> desechable y un riesgo serio en cuanto existen datos reales.

> ⚠️ **Leé el `.sql` generado antes de aplicarlo.** Es tu última oportunidad de detectar una
> migración destructiva. Un `DROP COLUMN` que no pediste significa que Drizzle interpretó un
> renombramiento como borrar y crear.

**Todo el esquema vive en un solo archivo.** Es una limitación aceptada de la configuración
actual: `db/schema.ts` contiene todas las tablas, enums y políticas.

---

## 8.3 Configuración crítica

`drizzle.config.ts` incluye tres opciones que evitan desastres:

```ts
export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },

  schemaFilter: ['public'],
  entities: { roles: { provider: 'supabase' } },
  casing: 'snake_case',
})
```

- **`schemaFilter: ['public']`** — Supabase es dueño de los esquemas `auth`, `storage`,
  `realtime` y `graphql`. Sin esta línea, drizzle-kit ve tablas que no creó e intenta
  **borrarlas**. Es la forma más común de destruir un proyecto de Supabase.
- **`entities.roles.provider: 'supabase'`** — sin esto, la primera migración intenta
  `DROP ROLE anon`.
- **`casing: 'snake_case'`** — traduce automáticamente entre la convención de TypeScript
  (`createdAt`) y la de Postgres (`created_at`).

**Cadenas de conexión.** El botón *Connect* del dashboard ofrece tres opciones. Para migraciones
usá la **Session pooler** en el puerto **5432**.

- ⛔ **Transaction pooler (6543)** — no maneja bien DDL ni *prepared statements*. Las migraciones
  fallan con errores confusos.
- ⚠️ Reemplazá `[YOUR-PASSWORD]` por la contraseña real y **codificala en URL** si tiene
  caracteres especiales (`@` → `%40`).

---

## 8.4 Sintaxis de Drizzle

### Tipos de columna usados en el proyecto

```ts
uuid('id')                                       // UUID
text('nombre')                                   // texto sin límite
boolean('activo')                                // true / false
integer('cantidad')                              // entero
numeric('dosis', {precision: 8, scale: 3})       // decimal exacto
timestamp('created_at', {withTimezone: true})    // fecha y hora CON zona
date('fecha_nacimiento', {mode: 'string'})       // solo fecha
time('hora')                                     // solo hora
jsonb('horarios').$type<HorarioMed[]>()          // JSON binario, tipado en TS
pgEnum('tipo_sangre', ['A+', 'A-', ...])         // enum de Postgres
```

**`numeric` y no `float`** para dosis y mediciones: los flotantes acumulan error de redondeo, y
en datos clínicos eso no es aceptable. `precision: 8, scale: 3` significa 8 dígitos en total, 3
después del punto.

**`withTimezone: true` en todos los timestamps.** Sin zona horaria, un dato registrado en Costa
Rica y leído en otro huso sale desplazado.

**`jsonb().$type<HorarioMed[]>()`** le da tipo de TypeScript a una columna JSON. Postgres solo ve
JSON; el `$type` es una anotación para el compilador.

### Restricciones

```ts
.notNull()
.default('valor')
.defaultNow()                                    // para timestamps
.primaryKey()
.defaultRandom()                                 // UUID aleatorio, solo para uuid
.references(() => otraTabla.id, {onDelete: 'cascade'})
```

**`onDelete`:**

| Valor | Qué pasa al borrar el padre | Dónde se usa |
|---|---|---|
| `'cascade'` | Se borran los hijos | `perfil_id` en todas las tablas del usuario |
| `'restrict'` | Se impide borrar el padre | `tipo_medicion_id` en `mediciones` |

`restrict` en `tipo_medicion_id` protege el catálogo: nadie puede borrar el tipo "Glucosa" si hay
mediciones que lo referencian.

### Índices y restricciones de tabla

Van en el segundo argumento de `pgTable`, que devuelve un arreglo:

```ts
}, (table) => [
    unique('tomas_medicamento_programada_unq').on(table.medicamento_id, table.programada_para),
    index('tomas_perfil_programada_idx').on(table.perfil_id, table.programada_para),
    pgPolicy(/* ... */),
]).enableRLS()
```

---

## 8.5 El modelo de seguridad

> **La llave anónima (`anon`) es pública.** Expo la incrusta dentro del bundle de JavaScript.
> Cualquiera que descargue el APK puede extraerla en menos de un minuto.
> **Row Level Security es lo único que protege los datos.**

1. **Toda tabla en `public` debe tener RLS activado.** Sin RLS, PostgREST expone la tabla y el
   rol `anon` tiene permisos completos por defecto.
2. **RLS deniega por defecto.** Una política es un *permiso*, no una *restricción*.
   Tabla con RLS y cero políticas = nadie puede hacer nada (seguro, pero inútil).
   Tabla sin RLS = todos pueden hacer todo (peligroso).
3. **La llave `service_role` nunca sale del servidor.** Ignora todas las políticas.

### Roles de Postgres

| Rol | Quién es | Uso |
|---|---|---|
| `anon` | Visitante sin sesión | Lectura de contenido público (`articulos`, `tipomedicion`) |
| `authenticated` | Usuario con sesión | Sus propios datos médicos |
| `service_role` | Administración | Dashboard y scripts. **Ignora RLS** |

Dentro de una política, `auth.uid()` (en Drizzle: `authUid`) devuelve el UUID del usuario del JWT
actual. Es la base de casi todas las reglas: *"puedes ver esta fila si es tuya"*.

### `using` contra `withCheck`

Dos cláusulas que se confunden constantemente:

- **`using`** → qué filas **existentes** puedes ver (`SELECT`, `UPDATE`, `DELETE`).
- **`withCheck`** → cómo puede quedar la fila **después** de escribir (`INSERT`, `UPDATE`).

> ⚠️ **`UPDATE` necesita las dos.** Si omitís `withCheck` en un `UPDATE`, un usuario puede tomar
> una fila suya y reasignarle el `perfil_id` a otra persona.

### Los imports de `drizzle-orm/supabase`

```ts
import { anonRole, authenticatedRole, authUid, authUsers } from 'drizzle-orm/supabase'
```

El módulo exporta: `anonRole`, `authenticatedRole`, `serviceRole`, `postgresRole`,
`supabaseAuthAdminRole`, `authUsers`, `realtimeMessages`, `authUid`, `realtimeTopic`.

**No existe un helper `crudPolicy` para Supabase** (ese es exclusivo de Neon): las políticas se
escriben una por una.

---

## 8.6 Las tablas

| Tabla | Acceso | Notas |
|---|---|---|
| `articulos` | Pública, solo lectura | Wiki de condiciones médicas |
| `tipomedicion` | Pública, solo lectura | Catálogo: glucosa, presión, peso |
| `perfiles` | Propia, `select` + `update` | Se crea por trigger al registrarse |
| `condiciones` | Propia, CRU | Diagnósticos |
| `alergias` | Propia, CRU | |
| `contactosemergencia` | Propia, CRU | |
| `medicamentos` | Propia, CRU | Los horarios van en una columna `jsonb` |
| `tomas` | Propia, CRU | Una fila por dosis programada |
| `mediciones` | Propia, CRU | Registros clínicos |

*(CRU = create, read, update. **Nunca delete** — se usa borrado lógico.)*

### Ejemplo 1: tabla pública de solo lectura

```ts
export const articulos = pgTable('articulos', {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: text('titulo').notNull(),
    categoria: text('categoria').notNull(),
    sintomas: text('sintomas').notNull(),
    tratamientos: text('tratamientos').notNull(),
    cuidados: text('cuidados').notNull(),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false)
}, (table) => [
    index('articulos_updated_at_idx').on(table.updatedAt),

    pgPolicy('articulos_lectura_publica', {
        for: 'select',
        to: [anonRole, authenticatedRole],
        using: sql`true`,
    })
]).enableRLS()
```

Resultado de esa única política:

| Operación | Quién puede | Por qué |
|---|---|---|
| `SELECT` | `anon` + `authenticated` | La política lo permite |
| `INSERT` / `UPDATE` / `DELETE` | **Nadie** (salvo `service_role`) | **No existe política → denegado** |

El contenido se administra desde el dashboard, que usa `service_role`.

### Ejemplo 2: tabla privada del usuario

```ts
export const mediciones = pgTable('mediciones', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    tipo_medicion_id: uuid('tipo_medicion_id').notNull().references(() => tipoMedicion.id, {onDelete: 'restrict'}),

    valor: numeric('valor', {precision: 8, scale: 3}).notNull(),
    valor_secundario: numeric('valor_secundario', {precision: 8, scale: 3}),

    //Cuando se tomo la medicion, no cuando se registro
    medido_en: timestamp('medido_en', {withTimezone: true}).notNull(),

    contexto: text('contexto'),
    nota: text('nota'),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
}, (table) => [
    index('mediciones_perfil_medido_idx').on(table.perfil_id, table.medido_en),

    pgPolicy('mediciones_select_propio', {
        for: 'select', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('mediciones_create_propio', {
        for: 'insert', to: authenticatedRole,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('mediciones_update_propio', {
        for: 'update', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
        withCheck: sql`${authUid} = ${table.perfil_id}`,   // impide reasignar perfil_id
    }),
]).enableRLS()
// Sin política de DELETE: los borrados son UPDATE (deleted = true)
```

**`medido_en` separado de `created_at`** es una decisión de dominio: el usuario puede registrar
hoy una medición que se tomó ayer. `medido_en` es el hecho clínico; `created_at`, la auditoría.

**El índice `(perfil_id, medido_en)`** cubre la consulta más frecuente: "mis mediciones,
ordenadas por fecha".

### Ejemplo 3: `tomas` y su restricción única

```ts
export const tomas = pgTable('tomas', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),
    medicamento_id: uuid('medicamento_id').notNull().references(() => medicamentos.id, {onDelete: 'cascade'}),
    horario_id: uuid('horario_id'),

    programada_para: timestamp('programada_para', {withTimezone: true}).notNull(),
    estado: estadoTomaEnum('estado').notNull().default('pendiente'),
    registrada_en: timestamp('registrada_en', {withTimezone: true}),
    pospuesta_hasta: timestamp('pospuesta_hasta', {withTimezone: true}),
    // ... columnas técnicas
}, (table) => [
    //Hace imposible duplicar una dosis, sin importar cuantas veces corra el generador
    unique('tomas_medicamento_programada_unq').on(table.medicamento_id, table.programada_para),
    index('tomas_perfil_programada_idx').on(table.perfil_id, table.programada_para),
    // ... políticas
]).enableRLS()
```

**La restricción `UNIQUE` es correcta y debe quedarse.** Es la que garantiza que un medicamento no
tenga dos dosis para el mismo instante, sin importar cuántas veces corra el generador ni desde
cuántos dispositivos.

Es también la que está produciendo el error documentado en
[05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).
**La restricción no es el bug: es la que lo está detectando.** El bug está en el cliente, que
genera filas que no debería.

**`horario_id` no tiene `references`** porque los horarios viven dentro de la columna `jsonb` de
`medicamentos`, no en una tabla propia. Postgres no puede validar una llave foránea contra un
campo dentro de un JSON.

---

## 8.7 Las tres columnas técnicas

Toda tabla que se sincronice con el dispositivo necesita:

| Columna | Tipo | Para qué |
|---|---|---|
| `created_at` | `timestamptz` | Auditoría. **Y decide si una escritura es INSERT o UPDATE** |
| `updated_at` | `timestamptz` | **Sincronización incremental.** El dispositivo pide solo lo que cambió |
| `deleted` | `boolean` | **Borrado lógico** |

**Por qué borrado lógico y no `DELETE`:** si borrás una fila físicamente, un teléfono que estaba
sin conexión no tiene forma de enterarse — la fila simplemente deja de aparecer, lo cual es
indistinguible de "no hubo cambios". Marcar `deleted = true` es un **cambio** que el dispositivo
sí puede sincronizar.

Los nombres tienen que coincidir con lo declarado en `src/lib/sync.ts`:

```ts
configureSyncedSupabase({
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})
```

---

## 8.8 Triggers

**`updated_at` debe mantenerse con un trigger, nunca desde el cliente.** Jamás confíes en el
reloj de un teléfono para resolver conflictos: un dispositivo con la hora atrasada podría escribir
un `updated_at` anterior al que ya tiene el servidor, y esa fila se volvería invisible para la
sincronización incremental de los demás.

Drizzle no genera triggers. Se agregan con `npx drizzle-kit generate --custom`.

La función, en [`drizzle/0003_handle_times_function.sql`](../drizzle/0003_handle_times_function.sql):

```sql
create or replace function handle_times() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    new.created_at := now(); new.updated_at := now();
  elsif (TG_OP = 'UPDATE') then
    new.created_at = old.created_at; new.updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;
```

En la rama de `UPDATE`, `new.created_at = old.created_at` **impide que el cliente altere la fecha
de creación** aunque la envíe en el cuerpo de la petición.

Cada tabla nueva necesita su trigger, como en
[`drizzle/0015_triggers_medicacion.sql`](../drizzle/0015_triggers_medicacion.sql):

```sql
drop trigger if exists handle_times on public.tomas;
create trigger handle_times before insert or update on public.tomas
  for each row execute procedure public.handle_times();
```

> ⚠️ **Olvidar el trigger en una tabla nueva es un bug silencioso.** La tabla funciona en el
> primer dispositivo y falla al sincronizar ediciones entre dos. La migración `0015` existe
> justamente porque a cuatro tablas existentes les faltaba
> (`articulos`, `condiciones`, `alergias`, `contactosemergencia`).

Otro trigger relevante:
[`drizzle/0001_crear_perfil_al_registrarse.sql`](../drizzle/0001_crear_perfil_al_registrarse.sql)
crea la fila en `perfiles` automáticamente cuando alguien se registra en `auth.users`. Por eso
`src/state/usuario.ts` declara `actions: ['read', 'update']` y no incluye `create`.

---

## 8.9 Quién genera los IDs

| Tipo de tabla | Quién genera el ID | Cómo |
|---|---|---|
| Solo lectura (`articulos`, `tipomedicion`) | **Postgres** | `uuid().primaryKey().defaultRandom()` |
| El usuario escribe (`medicamentos`, `tomas`, `mediciones`) | **El dispositivo** | `Crypto.randomUUID()` de `expo-crypto` |

La razón: un usuario puede registrar una medición sin conexión. No hay base de datos disponible
para asignar un `serial`. Por eso las llaves primarias son UUID y no enteros autoincrementales.

Las columnas siguen declarando `.defaultRandom()` como red de seguridad para inserciones hechas
desde el dashboard.

---

## 8.10 Verificar que RLS funciona

**Probar que las denegaciones funcionan es tan importante como probar que las lecturas funcionan.**
Después de crear una tabla, intentá romperla con la llave anónima:

```bash
curl -X DELETE "https://TU_PROYECTO.supabase.co/rest/v1/articulos?id=neq.00000000-0000-0000-0000-000000000000" -H "apikey: TU_ANON_KEY" -H "Authorization: Bearer TU_ANON_KEY"
```

La fila **debe seguir existiendo**. Si desapareció, RLS no está funcionando: detenete y corregilo.

En el **Table Editor** del dashboard, una tabla correcta **no** muestra la insignia
*"Unrestricted"*. Si aparece, falta activar RLS.

---

## 8.11 Historial de migraciones

| Archivo | Qué hizo |
|---|---|
| `0000_happy_bill_hollister` | Esquema inicial |
| `0001_crear_perfil_al_registrarse` | Trigger que crea el perfil al registrarse |
| `0003_handle_times_function` | Función `handle_times()` + trigger en `perfiles` |
| `0005_cedula_perfiles` | Campo cédula |
| `0007_condiciones_tabla` | Tabla de condiciones |
| `0014_next_shiver_man` | Tabla `tomas` y la restricción `tomas_medicamento_programada_unq` |
| `0015_triggers_medicacion` | Triggers `handle_times` en medicación **y en cuatro tablas que no lo tenían** |
| `0019_mediciones_trigger_y_presion` | Trigger de mediciones y soporte de presión arterial |

Los archivos con nombre generado (`0002_steady_impossible_man`, etc.) son migraciones
automáticas; los de nombre descriptivo son `--custom`, escritos a mano.

`drizzle/meta/` guarda instantáneas del esquema que drizzle-kit usa para calcular diferencias.
**No se editan a mano**, pero **sí se versionan**: sin ellas, la próxima migración se calcula mal.

---

## 8.12 Cómo agregar una tabla

**1. Definila en `db/schema.ts`**, con las tres columnas técnicas y sus políticas:

```ts
export const citas = pgTable('citas', {
    id: uuid('id').primaryKey().defaultRandom(),
    perfil_id: uuid('perfil_id').notNull().references(() => perfiles.id, {onDelete: 'cascade'}),

    motivo: text('motivo').notNull(),
    programada_para: timestamp('programada_para', {withTimezone: true}).notNull(),

    createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
}, (table) => [
    index('citas_perfil_programada_idx').on(table.perfil_id, table.programada_para),

    pgPolicy('citas_select_propio', {
        for: 'select', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('citas_create_propio', {
        for: 'insert', to: authenticatedRole,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
    pgPolicy('citas_update_propio', {
        for: 'update', to: authenticatedRole,
        using: sql`${authUid} = ${table.perfil_id}`,
        withCheck: sql`${authUid} = ${table.perfil_id}`,
    }),
]).enableRLS()
```

**2. Generá y revisá la migración**

```bash
npx drizzle-kit generate
```

Abrí el `.sql` y confirmá que no hay `DROP` inesperados.

**3. Agregá el trigger** (paso que más se olvida)

```bash
npx drizzle-kit generate --custom
```

```sql
drop trigger if exists handle_times on public.citas;
create trigger handle_times before insert or update on public.citas
  for each row execute procedure public.handle_times();
```

**4. Aplicá**

```bash
npx drizzle-kit migrate
```

**5. Verificá en el dashboard** que la tabla no diga *"Unrestricted"*.

**6. Probá una denegación** con `curl` (§8.10).

**7. Creá el observable** en `src/state/citas.ts` — ver
[05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#59-cómo-agregar-una-tabla-nueva).

---

## 8.13 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Las consultas devuelven `[]` sin error | RLS bloquea: falta política de `SELECT` | Revisá las políticas |
| Cualquiera puede borrar filas | RLS desactivado | `.enableRLS()` + migrar |
| Insignia *"Unrestricted"* en el dashboard | RLS desactivado | Igual que arriba |
| Un usuario puede reasignar filas a otro | Falta `withCheck` en el `UPDATE` | Agregalo |
| Las ediciones no se sincronizan entre dispositivos | Falta el trigger `handle_times` | Agregalo con `--custom` |
| La migración falla con errores raros de DDL | Transaction pooler (6543) | Usá Session pooler (5432) |
| `drizzle-kit migrate` no encuentra driver | Falta el driver | `npm i -D pg` |
| La primera migración intenta `DROP ROLE anon` | Falta configuración | `entities: { roles: { provider: 'supabase' } }` |
| Quiere borrar tablas que no creaste | Falta `schemaFilter` | `schemaFilter: ['public']` |
| Se generó un `DROP COLUMN` inesperado | Drizzle vio un renombramiento como borrar+crear | Editá el `.sql` a mano antes de aplicar |
| Los timestamps salen desplazados | Falta `withTimezone: true` | Agregalo |
