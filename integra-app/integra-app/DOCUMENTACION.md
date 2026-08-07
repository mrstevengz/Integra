# Integra — Documentación técnica

> Guía de onboarding para desarrolladores. Explica el contexto de la app, el stack
> (Supabase + Drizzle + Legend-State), las variables de entorno y el flujo de trabajo con Git.

**Última actualización:** 2026-08-07
**Repositorio:** https://github.com/mrstevengz/Integra (privado)

---

## 1. Contexto de la aplicación

**Integra** es una aplicación móvil de salud personal. Permite al paciente llevar el control de
sus medicamentos, mediciones clínicas, citas médicas y su expediente, además de consultar una
wiki de artículos sobre condiciones médicas.

La app es **local-first**: los datos se guardan primero en el dispositivo y se sincronizan con
el servidor cuando hay conexión. El usuario puede registrar una medición sin internet y esta se
subirá sola más tarde. Esto no es un detalle de implementación — condiciona el diseño de la base
de datos (ver §5.3).

### 1.1 Pantallas

La navegación usa `expo-router` con *native tabs* (pestañas nativas de cada plataforma):

| Ruta | Pestaña | Propósito |
|---|---|---|
| `src/app/(tabs)/index.tsx` | Inicio | Resumen del día |
| `src/app/(tabs)/medicacion.tsx` | Medicación | Tratamientos y recordatorios |
| `src/app/(tabs)/medicion.tsx` | Mediciones | Glucosa, presión, peso |
| `src/app/(tabs)/cita.tsx` | Citas | Agenda médica |
| `src/app/(tabs)/expediente.tsx` | Expediente | Historial y wiki de artículos |

El *root layout* está en `src/app/_layout.tsx` y la configuración de pestañas en
`src/app/(tabs)/_layout.tsx`.

> **Nota histórica:** el proyecto empezó como una PWA en Next.js y fue migrado a Expo.
> Si encuentras referencias a `next.config.ts` o `public/sw.js` en el historial de Git,
> son de esa etapa y ya no aplican.

### 1.2 Estado actual del proyecto

⚠️ **Importante para quien llega nuevo:** a la fecha de esta documentación las pantallas son
*placeholders*. El backend está en fase de configuración inicial en la rama
`feature/supabase_setup`.

| Área | Estado |
|---|---|
| Navegación y tabs | ✅ Funcionando |
| Estilos (NativeWind) | ✅ Funcionando |
| Supabase (proyecto + auth) | 🔧 En configuración |
| Drizzle (esquema + migraciones) | 🔧 En configuración |
| Legend-State (sincronización) | 🔧 En configuración |
| Pantallas con datos reales | ⛔ Pendiente |

Esta documentación describe la **arquitectura acordada**. Si un archivo mencionado aquí todavía
no existe en tu copia local, es porque esa parte aún no se ha implementado.

---

## 2. Stack tecnológico

| Capa | Herramienta | Versión |
|---|---|---|
| Framework | Expo SDK | `~54.0.35` |
| Runtime | React Native | `0.81.5` (New Architecture activada) |
| Navegación | expo-router | `~6.0.24` |
| Estilos | NativeWind + Tailwind | `^4.2.6` / `^3.4.17` |
| Backend y Auth | Supabase | `@supabase/supabase-js@2.112.x` |
| Esquema y migraciones | Drizzle ORM + Kit | `0.45.x` / `0.31.x` |
| Estado y sincronización | Legend-State | `3.0.0-beta.48` (versión **fija**) |
| Persistencia local | expo-sqlite | `~16.0.10` |
| Validación | Zod + drizzle-zod | `4.4.x` / `0.8.x` |
| Formularios | react-hook-form + resolvers | `7.84.x` / `5.7.x` |

**Requisitos de entorno:** Node.js ≥ 20 (probado en v24.16.0). No se necesita Docker.
Todo el stack corre dentro de **Expo Go**; no hace falta un *development build*.

### 2.1 Decisiones deliberadas

Herramientas que **no** usamos, y por qué:

- **TanStack Query** — la capa de sincronización de Legend-State ya cumple esa función.
  Tener las dos significaría dos cachés que se contradicen.
- **Redux / Zustand / Jotai** — `observable()` de Legend-State también cubre el estado local de UI.
- **AsyncStorage** — `expo-sqlite/kv-store` ofrece la misma API y ya es dependencia.
- **Drizzle como cliente en tiempo de ejecución** — rompería RLS. Ver §4.1.

---

## 3. Instalación

```bash
git clone https://github.com/mrstevengz/Integra.git
cd Integra/integra-app/integra-app
npm install
```

Luego crea tu archivo `.env.local` (§7) y arranca:

```bash
npx expo start
```

Escanea el QR con **Expo Go** o presiona `a` / `i` para emulador Android / iOS.

---

## 4. Contexto de Supabase

Supabase provee tres cosas al proyecto: la base de datos **Postgres**, la **autenticación**
(tabla `auth.users` y emisión de JWT) y una **API REST automática** (PostgREST) que expone
cada tabla del esquema `public` por HTTP.

### 4.1 Modelo de seguridad — leer antes de tocar la base de datos

La regla que gobierna todo el proyecto:

> **La llave anónima (`anon`) es pública.** Expo la incrusta dentro del bundle de JavaScript.
> Cualquiera que descargue el APK puede extraerla en menos de un minuto.
> **Row Level Security (RLS) es lo único que protege los datos.**

Consecuencias prácticas:

1. **Toda tabla en `public` debe tener RLS activado.** Sin RLS, PostgREST expone la tabla y el
   rol `anon` tiene permisos completos de lectura y escritura por defecto. Una tabla sin RLS es
   una tabla que cualquiera puede borrar.
2. **RLS deniega por defecto.** Una política es un *permiso*, no una *restricción*.
   Tabla con RLS y cero políticas = nadie puede hacer nada (seguro, pero inútil).
   Tabla sin RLS = todos pueden hacer todo (peligroso).
3. **La llave `service_role` (o `sb_secret_...`) nunca debe salir del servidor.**
   Esa llave *ignora* todas las políticas. Solo se usa desde el dashboard, scripts de
   administración o Edge Functions.

### 4.2 Roles de Postgres

| Rol | Quién es | Uso |
|---|---|---|
| `anon` | Visitante sin sesión iniciada | Lectura de contenido público (ej. `articulos`) |
| `authenticated` | Usuario con sesión iniciada | Sus propios datos médicos |
| `service_role` | Administración | Scripts y dashboard. **Ignora RLS** |

Dentro de una política, `auth.uid()` devuelve el UUID del usuario del JWT actual.
Es la base de casi todas las reglas: *"puedes ver esta fila si es tuya"*.

### 4.3 `using` vs `withCheck`

Dos cláusulas que se confunden constantemente:

- **`using`** → qué filas **existentes** puedes ver (`SELECT`, `UPDATE`, `DELETE`).
- **`withCheck`** → cómo puede quedar la fila **después** de escribir (`INSERT`, `UPDATE`).

`UPDATE` necesita **las dos**. Si omites `withCheck` en un `UPDATE`, un usuario puede tomar una
fila suya y reasignarle el `user_id` a otra persona.

### 4.4 Cadenas de conexión

El botón **Connect** del dashboard ofrece tres opciones. Para migraciones usa la
**Session pooler** en el puerto **5432**.

- ⛔ **Transaction pooler (6543)** — no maneja bien DDL ni *prepared statements*.
  Las migraciones fallan con errores confusos.
- ⚠️ Reemplaza el marcador `[YOUR-PASSWORD]` por la contraseña real y **codifícala en URL**
  si tiene caracteres especiales (`@` → `%40`).

---

## 5. Contexto de Drizzle

### 5.1 Qué papel cumple (y cuál no)

Drizzle es una **herramienta de tiempo de compilación**. Vive en `devDependencies`, corre en la
laptop del desarrollador, genera SQL y ahí termina su trabajo. **Nunca se incluye en el bundle
de la app ni se conecta a Postgres desde el teléfono.**

Esto es intencional y es lo que preserva RLS:

| Forma de usar Drizzle | Rol de conexión | Estado de RLS |
|---|---|---|
| Como cliente directo (`postgres://`) | `postgres` (dueño de las tablas) | ❌ **RLS ignorado** — los dueños lo saltan |
| Solo como esquema y migraciones | La app va por PostgREST como `authenticated` | ✅ **RLS aplicado siempre** |

Usamos la segunda. El camino en tiempo de ejecución es siempre:
`app → supabase-js → PostgREST → Postgres (con RLS)`.

La ventaja de declarar las políticas en Drizzle con `pgPolicy` en lugar de escribirlas a mano en
el dashboard es que quedan **versionadas en Git y revisables en el PR**, y no pueden desviarse
entre ambientes.

### 5.2 Archivos y comandos

```
db/schema.ts        ← definición de tablas y políticas (fuera de src/, ver nota)
drizzle.config.ts   ← configuración de drizzle-kit
drizzle/            ← migraciones SQL generadas (se versionan en Git)
```

> **Por qué `db/` está fuera de `src/`:** Metro empaqueta todo lo que está en `src/`.
> Manteniendo el esquema afuera, la frontera entre "código de base de datos" y "código de app"
> es física y no depende de que alguien la recuerde.

```bash
npx drizzle-kit generate   # genera el archivo .sql a partir de db/schema.ts
npx drizzle-kit migrate    # aplica las migraciones pendientes
```

**Usa siempre `generate` + `migrate`, nunca `push`.** `push` compara el esquema contra la base de
datos y aplica cambios sin dejar un archivo revisable. Es aceptable en un prototipo desechable y
un riesgo serio en cuanto existen datos reales.

**Revisa el `.sql` generado antes de aplicarlo.** Es tu última oportunidad de detectar una
migración destructiva.

### 5.3 Configuración crítica

`drizzle.config.ts` incluye tres opciones que evitan desastres:

```ts
schemaFilter: ['public'],                       // no tocar auth/storage/realtime
entities: { roles: { provider: 'supabase' } },  // no gestionar los roles de Supabase
casing: 'snake_case',                           // createdAt en TS → created_at en PG
```

- **`schemaFilter`** — Supabase es dueño de los esquemas `auth`, `storage`, `realtime` y
  `graphql`. Sin esta línea, drizzle-kit ve tablas que no creó e intenta **borrarlas**.
  Es la forma más común de destruir un proyecto de Supabase.
- **`entities.roles.provider`** — sin esto, la primera migración intenta `DROP ROLE anon`.
- **`casing`** — traduce automáticamente entre la convención de TypeScript y la de Postgres.

### 5.4 Columnas obligatorias para sincronización

Toda tabla que se sincronice con el dispositivo necesita tres columnas técnicas:

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `created_at` | `timestamptz` | Auditoría |
| `updated_at` | `timestamptz` | **Sincronización incremental.** El dispositivo pide solo lo que cambió desde su última sincronización |
| `deleted` | `boolean` | **Borrado lógico.** Ver abajo |

**Por qué borrado lógico y no `DELETE`:** si borras una fila físicamente, un teléfono que estaba
sin conexión no tiene forma de enterarse — la fila simplemente deja de aparecer, lo cual es
indistinguible de "no hubo cambios". Marcar `deleted = true` es un **cambio** que el dispositivo
sí puede sincronizar.

Además, `updated_at` necesita un **índice** (las consultas de sincronización filtran por esa
columna) y debe mantenerse con un **trigger**, nunca desde el cliente — jamás confíes en el reloj
de un teléfono para resolver conflictos.

Drizzle no genera triggers; se agregan con `npx drizzle-kit generate --custom`:

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

### 5.5 Quién genera los IDs

Detalle sutil pero central en local-first:

- **Tablas de solo lectura** (ej. `articulos`) → `uuid().primaryKey().defaultRandom()`.
  **Postgres** genera el ID, porque solo los administradores crean filas.
- **Tablas que el usuario escribe** (ej. `mediciones`) → el **dispositivo** genera el UUID con
  `Crypto.randomUUID()` de `expo-crypto`.

La razón: un usuario puede registrar una medición sin conexión. No hay base de datos disponible
para asignar un `serial`. Por eso las llaves primarias son UUID y no enteros autoincrementales.

### 5.6 Ejemplo de referencia — tabla `articulos`

Wiki de condiciones médicas. Contenido público, solo lectura desde la app:

```ts
import { sql } from 'drizzle-orm'
import { pgTable, pgPolicy, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase'

export const articulos = pgTable('articulos', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  categoria: text('categoria').notNull(),

  sintomas:     text('sintomas').array().notNull().default(sql`'{}'::text[]`),
  tratamientos: text('tratamientos').array().notNull().default(sql`'{}'::text[]`),
  cuidados:     text('cuidados').array().notNull().default(sql`'{}'::text[]`),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted:   boolean('deleted').notNull().default(false),
}, (t) => [
  index('articulos_updated_at_idx').on(t.updatedAt),

  pgPolicy('articulos_lectura_publica', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`true`,
  }),
]).enableRLS()
```

Resultado de esa única política:

| Operación | Quién puede | Por qué |
|---|---|---|
| `SELECT` | `anon` + `authenticated` | La política lo permite |
| `INSERT` / `UPDATE` / `DELETE` | **Nadie** (salvo `service_role`) | **No existe política → denegado** |

El contenido se administra desde el dashboard, que usa `service_role`.

`drizzle-orm/supabase` exporta: `anonRole`, `authenticatedRole`, `serviceRole`, `postgresRole`,
`supabaseAuthAdminRole`, `authUsers`, `realtimeMessages`, `authUid`, `realtimeTopic`.
No existe un helper `crudPolicy` para Supabase (ese es exclusivo de Neon): las cuatro políticas
se escriben una por una.

### 5.6.1 Ejemplo con datos por usuario

Para comparar, así se ve una tabla privada:

```ts
pgPolicy('mediciones_select_own', {
  for: 'select', to: authenticatedRole,
  using: sql`${authUid} = ${t.userId}`,
}),
pgPolicy('mediciones_insert_own', {
  for: 'insert', to: authenticatedRole,
  withCheck: sql`${authUid} = ${t.userId}`,
}),
pgPolicy('mediciones_update_own', {
  for: 'update', to: authenticatedRole,
  using: sql`${authUid} = ${t.userId}`,
  withCheck: sql`${authUid} = ${t.userId}`,   // impide reasignar user_id
}),
// Sin política de DELETE: los borrados son UPDATE (deleted = true)
```

### 5.7 Verificar que RLS funciona

**Probar que las denegaciones funcionan es tan importante como probar que las lecturas funcionan.**
Después de crear una tabla, intenta romperla con la llave anónima:

```bash
curl -X DELETE "https://TU_PROYECTO.supabase.co/rest/v1/articulos?id=neq.00000000-0000-0000-0000-000000000000" \
  -H "apikey: TU_ANON_KEY" -H "Authorization: Bearer TU_ANON_KEY"
```

La fila **debe seguir existiendo**. Si desapareció, RLS no está funcionando: detente y corrígelo.

En el **Table Editor** del dashboard, una tabla correcta **no** muestra la insignia
*"Unrestricted"*. Si aparece, falta activar RLS.

---

## 6. Contexto de Legend-State

### 6.1 Modelo mental

Legend-State reemplaza, en una sola herramienta, lo que normalmente serían tres: gestor de
estado, capa de API y caché offline.

**Un observable es un árbol de proxies.** Cualquier nodo se lee, se escribe y se observa:

```ts
import { observable } from '@legendapp/state'

const state$ = observable({ user: { nombre: 'Ana', peso: 62 } })

state$.user.nombre.get()    // 'Ana'   — leer
state$.user.peso.set(63)    //         — escribir
state$.user.peso.peek()     //         — leer SIN suscribirse (útil dentro de handlers)
```

El sufijo `$` es solo una convención de nomenclatura: *"esto es un observable, no un valor"*.

**Reactividad granular.** Si un componente lee `state$.user.peso` y cambia `state$.user.nombre`,
ese componente **no** se vuelve a renderizar. Esa es la diferencia principal frente a Redux o
Zustand.

```tsx
import { useValue } from '@legendapp/state/react'

function Peso() {
  const peso = useValue(state$.user.peso)   // se suscribe solo a esta hoja
  return <Text>{peso} kg</Text>
}
```

### 6.2 ⚠️ El error que más tiempo cuesta

**El hook se llama `useValue`.**

Prácticamente todos los tutoriales que encontrarás —incluido el artículo oficial de Supabase—
usan `use$()` o `useSelector()`. Son los nombres anteriores de la **misma función** en v2 y en
betas previas de v3. Si copias código de ejemplo y obtienes *"use$ is not exported"*, esta es la
razón.

### 6.3 Un observable puede *ser* una tabla

`synced()` conecta un observable a una fuente de datos. Leerlo dispara la carga; escribirlo
dispara la escritura optimista, la persistencia local y la cola de reintentos offline.

Configuración compartida en `src/lib/sync.ts`:

```ts
import { configureSynced } from '@legendapp/state/sync'
import { observablePersistSqlite } from '@legendapp/state/persist-plugins/expo-sqlite'
import { configureSyncedSupabase, syncedSupabase } from '@legendapp/state/sync-plugins/supabase'
import Storage from 'expo-sqlite/kv-store'
import { supabase } from './supabase'

configureSyncedSupabase({
  changesSince: 'last-sync',
  fieldCreatedAt: 'created_at',
  fieldUpdatedAt: 'updated_at',
  fieldDeleted: 'deleted',
})

export const syncedTable = configureSynced(syncedSupabase, {
  supabase,
  persist: { plugin: observablePersistSqlite(Storage), retrySync: true },
  retry: { infinite: true },
})
```

- `changesSince: 'last-sync'` — sincronización incremental: solo pide filas con
  `updated_at` posterior a la última sincronización.
- `persist` — **esta es la línea que hace que la app funcione sin conexión.** Guarda el
  observable en SQLite en cada cambio y lo recarga al abrir la app.
- `retry: { infinite: true }` — las sincronizaciones fallidas se encolan y reintentan.

Una tabla concreta, en `src/state/articulos.ts`:

```ts
import { observable } from '@legendapp/state'
import { syncedTable } from '@/lib/sync'

export const articulos$ = observable(syncedTable({
  collection: 'articulos',
  actions: ['read'],       // solo lectura: el dispositivo nunca escribe artículos
  initial: {},
  persist: { name: 'articulos' },
}))
```

- **`actions: ['read']`** refleja exactamente la política RLS. La base de datos dice "solo
  select" y el cliente dice "solo lectura". Defensa en profundidad: un `.set()` accidental falla
  de inmediato en desarrollo en vez de dar un 403 silencioso en producción.
- **`initial: {}`** — sin esto, el observable es `undefined` antes de la primera carga y
  `Object.values(undefined)` lanza una excepción.

**No se pasa un filtro `user_id`**: RLS ya limita las filas del lado del servidor. El cliente
literalmente no puede pedir datos de otra persona.

### 6.4 Uso en componentes

La forma por defecto es un `Record<id, Fila>` indexado por `id`:

```tsx
import { useValue } from '@legendapp/state/react'
import { articulos$ } from '@/state/articulos'

export default function WikiScreen() {
  const articulos = useValue(articulos$)

  return (
    <FlatList
      data={Object.values(articulos)}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => (
        <View className="p-4 border-b border-slate-200">
          <Text className="text-lg font-bold text-slate-900">{item.titulo}</Text>
          <Text className="text-sm text-teal-700">{item.categoria}</Text>
        </View>
      )}
    />
  )
}
```

Sin `useEffect`, sin `fetch`, sin estado de carga, sin invalidación de caché. Leer el observable
es lo que **dispara** la petición, y el resultado ya está en disco para la próxima vez.

Para tablas con escritura, las mutaciones son igual de directas:

```ts
const id = Crypto.randomUUID()
mediciones$[id].set({ id, tipo: 'glucosa', valor: 110 })  // crear
mediciones$[id].valor.set(120)                            // actualizar
mediciones$[id].delete()                                  // borrado lógico
```

Estado de carga, si se necesita:

```ts
import { syncState } from '@legendapp/state'
const cargado = useValue(syncState(articulos$).isPersistLoaded)
```

### 6.5 Cómo probar que realmente es local-first

1. Abre la app con conexión y verifica que se ven los datos.
2. **Cierra la app por completo. Activa modo avión. Vuelve a abrirla.**
3. Los datos deben seguir ahí.

Si la pantalla queda vacía, `persist` no está configurado.

### 6.6 ⚠️ Riesgo conocido: Legend-State está en beta

`@legendapp/state` v3 **sigue en beta** (`3.0.0-beta.48`, publicada en julio de 2026). La última
versión estable es la 2.1.15, y **el plugin de Supabase solo existe en v3**.

Mitigaciones adoptadas:

- **La versión está fijada exactamente**, sin `^`:
  ```json
  "@legendapp/state": "3.0.0-beta.48"
  ```
  Un rango con `^` permitiría que un `npm install` futuro rompa la app en silencio: la librería ya
  ha renombrado hooks públicos durante la beta.
- Toda la configuración de sincronización vive en `src/lib/sync.ts` y `src/state/*`, de modo que
  una eventual migración quede acotada a esos archivos.

### 6.7 RLS + local-first: dos trampas

**1. Las revocaciones son invisibles.** Con `changesSince: 'last-sync'`, el cliente pregunta
"¿qué cambió desde T?". Si una fila deja de cumplir la política —por ejemplo, se le revoca a un
médico el acceso a un expediente— esa fila simplemente deja de aparecer; no llega marcada como
borrada. **La copia ya sincronizada se queda en el SQLite del dispositivo para siempre.**
Si se implementa compartir datos entre usuarios, hay que diseñar una señal explícita de
revocación (una fila lápida que el usuario todavía pueda leer, o una resincronización completa).

**2. RLS controla filas, nunca columnas.** Si `mediciones` algún día tiene un campo
`notas_medico` que el paciente no debe leer, RLS no ayuda: eso requiere una tabla o una vista
aparte.

---

## 7. Variables de entorno

Crea el archivo **`.env.local`** en la raíz de la app
(`integra-app/integra-app/.env.local`, junto a `package.json`).

```bash
# ─── Cliente (se incrusta en el bundle — PÚBLICO) ───────────────────
EXPO_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_O_PUBLISHABLE_KEY>

# ─── Solo herramientas locales (NUNCA se incrusta) ──────────────────
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres
```

> Los valores reales no se incluyen en este documento ni se versionan, aunque el repositorio sea
> privado. Pídelos al responsable del proyecto o cópialos del dashboard de Supabase.
> Un repositorio privado puede volverse público, cambiar de dueño o ser clonado por alguien que
> deja el equipo; los secretos en Git son permanentes en el historial.

### 7.1 Por qué esa separación exacta

| Variable | ¿Va al bundle? | Motivo |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Sí | La app necesita saber a dónde conectarse |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Sí | Diseñada para ser pública. **RLS es la protección real** |
| `DATABASE_URL` | ❌ No | Contiene la contraseña de la base de datos. Solo la lee drizzle-kit |

`EXPO_PUBLIC_` es un prefijo con significado literal: Expo **incrusta esos valores dentro del
JavaScript** de la app. `DATABASE_URL` no lo lleva, así que Expo nunca lo empaqueta.

**Nunca pongas la llave `service_role` / `sb_secret_...` en una variable `EXPO_PUBLIC_`.**
Esa llave ignora todas las políticas RLS.

### 7.2 De dónde sale cada valor

| Valor | Ubicación en el dashboard |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` / publishable key |
| `DATABASE_URL` | Botón **Connect** → **Session pooler** (puerto **5432**) |

⚠️ En `DATABASE_URL`, sustituye el marcador `[YOUR-PASSWORD]` por la contraseña real y
codifícala en URL si tiene caracteres especiales (`@` → `%40`, `#` → `%23`).

### 7.3 Nota sobre `.gitignore`

El [.gitignore](.gitignore) actual ignora `.env*.local` pero **no** un archivo `.env` a secas.
Por eso usamos `.env.local`: queda protegido sin modificar nada.

Si en algún momento creas un `.env`, **agrégalo a `.gitignore` antes de escribir nada dentro**.

`drizzle.config.ts` lee `.env.local` explícitamente, porque drizzle-kit solo busca `.env` por
defecto:

```ts
import { config } from 'dotenv'
config({ path: '.env.local' })
```

---

## 8. Flujo de trabajo con Git (Gitflow)

### 8.1 Ramas

| Rama | Propósito | ¿Commit directo? |
|---|---|---|
| `main` | Código en producción | ⛔ Nunca |
| `develop` | Rama de integración. Base de todo trabajo nuevo | ⛔ Solo vía Pull Request |
| `feature/<nombre>` | Una funcionalidad o corrección | ✅ Sí, es tu espacio |

Convención de nombres ya en uso en el repositorio (ej. `feature/supabase_setup`):

```
feature/supabase_setup
feature/auth_login
feature/tabla_mediciones
fix/sync_offline
```

### 8.2 Ciclo completo

**1. Partir siempre de un `develop` actualizado**

```bash
git checkout develop
git pull origin develop
```

Omitir este paso es la causa más frecuente de conflictos de merge.

**2. Crear la rama de trabajo**

```bash
git checkout -b feature/tabla_mediciones
```

**3. Trabajar y hacer commits**

```bash
git add .
git commit -m "feat: agregar tabla mediciones con políticas RLS"
```

Commits pequeños y frecuentes. Un commit debe hacer **una** cosa.

**4. Subir la rama**

```bash
git push -u origin feature/tabla_mediciones
```

El `-u` solo se necesita la primera vez; después basta con `git push`.

**5. Antes de abrir el PR, sincronizar con `develop`**

```bash
git fetch origin
git merge origin/develop
```

Si hay conflictos, resuélvelos **aquí**, en tu rama — no en el PR. Luego:

```bash
git push
```

**6. Abrir el Pull Request en GitHub**

`feature/tabla_mediciones` → **`develop`** (nunca directo a `main`).

**7. Después del merge, limpiar**

```bash
git checkout develop
git pull origin develop
git branch -d feature/tabla_mediciones
```

### 8.3 Convención de mensajes de commit

```
feat:     nueva funcionalidad
fix:      corrección de bug
chore:    configuración, dependencias, tareas de mantenimiento
docs:     documentación
refactor: cambio interno sin alterar el comportamiento
style:    formato, sin cambios de lógica
```

Ejemplos:

```
feat: agregar sincronización offline de mediciones
fix: corregir política RLS de update en expediente
chore: fijar versión de @legendapp/state
docs: documentar variables de entorno
```

### 8.4 Checklist antes de abrir un PR

- [ ] La rama sale de `develop` actualizado y el PR apunta a `develop`
- [ ] **No hay archivos `.env*` en el diff** — verifícalo con `git status`
- [ ] Si tocaste `db/schema.ts`, la migración generada está incluida en el commit
- [ ] **Leíste el `.sql` generado** y no contiene `DROP` inesperados
- [ ] Toda tabla nueva tiene RLS activado y sus políticas
- [ ] Probaste que las **denegaciones** funcionan (§5.7), no solo las lecturas
- [ ] La app arranca sin errores con `npx expo start`
- [ ] Si tocaste sincronización, probaste en **modo avión**

---

## 9. Estructura de carpetas

```
Integra/                              ← raíz del repositorio Git
└── integra-app/
    └── integra-app/                  ← raíz de la app Expo
        ├── src/
        │   ├── app/                  ← rutas de expo-router
        │   │   ├── _layout.tsx
        │   │   └── (tabs)/
        │   │       ├── _layout.tsx
        │   │       ├── index.tsx
        │   │       ├── medicacion.tsx
        │   │       ├── medicion.tsx
        │   │       ├── cita.tsx
        │   │       └── expediente.tsx
        │   ├── lib/
        │   │   ├── supabase.ts       ← cliente de Supabase
        │   │   └── sync.ts           ← configuración de Legend-State
        │   └── state/                ← un archivo por tabla sincronizada
        │       └── articulos.ts
        ├── db/
        │   └── schema.ts             ← esquema Drizzle (FUERA de src/)
        ├── drizzle/                  ← migraciones SQL generadas
        ├── assets/
        ├── .env.local                ← NO se versiona
        ├── drizzle.config.ts
        ├── app.json
        ├── tailwind.config.js
        └── package.json
```

Alias de importación configurado en `tsconfig.json`: `@/*` → `./src/*`.

---

## 10. Consideraciones sobre datos de salud

Integra maneja medicamentos, mediciones clínicas y expedientes médicos. Al ser local-first,
**esos datos quedan sin cifrar en un archivo SQLite dentro del teléfono**, y permanecen ahí
después de cerrar sesión salvo que se borren explícitamente.

Dos decisiones a tomar antes de manejar datos reales de pacientes:

1. **Borrar los datos locales al cerrar sesión.** Legend-State no lo hace solo. Si no se
   implementa, la siguiente persona que inicie sesión en ese dispositivo cargará la caché del
   usuario anterior.
2. **Si la app llega a manejar datos de pacientes distintos al propio usuario**, Supabase solo es
   apto para HIPAA en planes de pago con un BAA firmado, y convendría cifrar el almacenamiento
   local (SQLCipher mediante un config plugin, lo cual **sí requiere un development build** —
   ya no bastaría Expo Go).

No bloquea el desarrollo, pero es mucho más barato decidirlo ahora que cuando el esquema ya esté
lleno de datos.

---

## 11. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `use$ is not exported` | El hook se renombró | Usa `useValue` (§6.2) |
| La migración falla con errores raros de DDL | Estás usando el Transaction pooler | Usa **Session pooler**, puerto 5432 |
| `drizzle-kit migrate` no encuentra driver | Driver de Postgres ausente | `npm i -D pg` |
| La primera migración intenta `DROP ROLE anon` | Falta configuración | Agrega `entities: { roles: { provider: 'supabase' } }` |
| drizzle-kit quiere borrar tablas que no creaste | Falta `schemaFilter` | Agrega `schemaFilter: ['public']` |
| Las consultas devuelven `[]` vacío sin error | RLS bloquea, no hay política de `SELECT` | Revisa las políticas de la tabla |
| Cualquiera puede borrar filas | RLS desactivado | `.enableRLS()` + migrar (§4.1) |
| La app queda en blanco sin conexión | `persist` mal configurado | Revisa `observablePersistSqlite` en `sync.ts` |
| `Object.values(undefined)` | Falta el valor inicial | Agrega `initial: {}` al `synced` |
| La sesión expira al volver a la app | Falta el listener de `AppState` | Ver `src/lib/supabase.ts` |
| Error de `URL` al llamar a Supabase | Falta polyfill | `npx expo install react-native-url-polyfill` e importa `react-native-url-polyfill/auto` |

---

## 12. Referencias

- [Documentación de Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Guía local-first de Expo](https://docs.expo.dev/guides/local-first/)
- [Legend-State v3 — Persist & Sync](https://legendapp.com/open-source/state/v3/sync/persist-sync/)
- [Legend-State v3 — Plugin de Supabase](https://legendapp.com/open-source/state/v3/sync/supabase/)
- [Drizzle ORM — Row-Level Security](https://orm.drizzle.team/docs/rls)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Local-first con Expo y Legend-State](https://supabase.com/blog/local-first-expo-legend-state)
