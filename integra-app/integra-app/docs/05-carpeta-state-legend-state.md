# 5. Carpeta `src/state/` — Legend-State

> El corazón del proyecto. Un observable por tabla, sincronización automática con Supabase y
> persistencia local en SQLite.

| Librería | Versión | Documentación |
|---|---|---|
| `@legendapp/state` | `^3.0.0-beta.48` | https://legendapp.com/open-source/state/v3/ |
| `@legendapp/state/sync` | (incluido) | https://legendapp.com/open-source/state/v3/sync/persist-sync/ |
| `@legendapp/state/sync-plugins/supabase` | (incluido) | https://legendapp.com/open-source/state/v3/sync/supabase/ |
| `expo-sqlite` | `~16.0.10` | https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/ |
| `expo-crypto` | `~15.0.9` | https://docs.expo.dev/versions/v54.0.0/sdk/crypto/ |

> ⚠️ **Esta librería está en beta.** Los nombres de la API han cambiado durante la beta.
> Verificá contra la documentación de **v3**, no contra tutoriales viejos.

---

## 5.1 Modelo mental

Legend-State reemplaza, con una sola herramienta, lo que normalmente serían tres: gestor de
estado, capa de API y caché offline.

**Un observable es un árbol de proxies.** Cualquier nodo se lee, se escribe y se observa:

```ts
import { observable } from '@legendapp/state'

const state$ = observable({ user: { nombre: 'Ana', peso: 62 } })

state$.user.nombre.get()    // 'Ana'   — leer y suscribirse
state$.user.peso.set(63)    //         — escribir
state$.user.peso.peek()     //         — leer SIN suscribirse
```

El sufijo `$` es solo convención de nombres: *"esto es un observable, no un valor"*.

**Reactividad granular.** Si un componente lee `state$.user.peso` y cambia `state$.user.nombre`,
ese componente **no** se vuelve a renderizar. Esa es la diferencia principal frente a Redux o
Zustand, y la razón por la que una lista de 60 tomas no parpadea entera al marcar una sola.

### `get()` contra `peek()`

| Método | Lee el valor | Se suscribe |
|---|---|---|
| `.get()` | ✅ | ✅ |
| `.peek()` | ✅ | ⛔ |

Usá `peek()` dentro de manejadores de eventos y funciones que no deben provocar re-renders.
Usá `get()` (o mejor, `useValue`) cuando querés que la interfaz reaccione.

---

## 5.2 Un observable puede *ser* una tabla

`syncedTable()` conecta un observable a una tabla de Supabase. **Leerlo dispara la carga**;
escribirlo dispara la escritura optimista, la persistencia local y la cola de reintentos.

La forma canónica, presente en casi todos los archivos de la carpeta:

```ts
import { syncedTable } from "@/lib/sync";
import { observable } from "@legendapp/state";

export type Alergia = {
    id: string;
    perfil_id: string;
    nombre: string
    severidad: string;
    detalles: string
}

export const alergia$ = observable(syncedTable({
    collection: 'alergias',
    actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Alergia>,
    realtime: true,
    persist: {name: 'alergias'}
}))
```

### Cada opción, explicada

| Opción | Qué hace | Trampa |
|---|---|---|
| `collection` | Nombre de la tabla en Supabase | **Tiene que coincidir exactamente.** Un typo da error 404 en tiempo de ejecución, no de compilación |
| `actions` | Operaciones REST permitidas | Debe reflejar las políticas RLS. **Nunca `delete`** — se usa borrado lógico |
| `initial` | Valor mientras carga | Sin esto el observable es `undefined` y `Object.values(undefined)` revienta |
| `realtime` | Escucha cambios por WebSocket | Solo donde importa ver cambios al instante |
| `persist.name` | Nombre en el SQLite local | Se recomienda **no** dejarlo igual al de la tabla |

**Sobre `actions`:** es defensa en profundidad. La política de Postgres es la que realmente
protege; esta línea hace que un `.set()` accidental falle de inmediato en desarrollo en vez de
dar un 403 silencioso en producción.

**No se pasa un filtro por `perfil_id`.** RLS ya limita las filas del lado del servidor. El
cliente literalmente no puede pedir datos de otra persona, así que filtrar aquí sería redundante
y daría una falsa sensación de que la seguridad está en el cliente.

### El caso especial: `as: 'value'`

```ts
// src/state/usuario.ts
export const perfil$ = observable<PerfilRow>(syncedTable({
    collection: 'perfiles',
    actions: ['read', 'update'],
    as: 'value',            // ← devuelve UN objeto, no un Record
    initial: {},
    realtime: true,
    persist: {name: 'perfil'}
}))
```

Por defecto, un observable sincronizado es un `Record<id, Fila>`. Con `as: 'value'` devuelve un
solo objeto.

> ⚠️ **`as: 'value'` solo se usa en `usuario.ts`**, porque RLS garantiza que el usuario solo ve
> su propio perfil: hay exactamente una fila. En cualquier otra tabla haría que solo se vea un
> registro y el resto desaparezca sin dar error.

---

## 5.3 Leer un observable en un componente

```tsx
import { useValue } from '@legendapp/state/react'
import { perfil$ } from '@/state/usuario'
import { medicamento$ } from '@/state/medicacion'

const perfil = useValue(perfil$)
const medicamentos = useValue(medicamento$)
```

> ⚠️ **El hook se llama `useValue`.** Los tutoriales que encuentres —incluido el artículo oficial
> de Supabase— usan `use$()` o `useSelector()`. Son nombres anteriores de **la misma función**.
> Si copiás un ejemplo y obtenés *"use$ is not exported"*, es esto.

Sin `useEffect`, sin `fetch`, sin estado de carga, sin invalidación de caché. Leer el observable
es lo que **dispara** la petición, y el resultado ya está en disco para la próxima vez.

---

## 5.4 Escribir

```ts
// Crear: el dispositivo genera el UUID
const id = Crypto.randomUUID()
medicamento$[id].set({ id, perfil_id: perfil.id, nombre: 'Losartan', /* ... */ })

// Actualizar un campo
medicamento$[id].activo.set(false)

// Actualizar varios campos a la vez
toma$[tomaId].assign({ estado: 'tomada', registrada_en: new Date().toISOString() })
```

### `set()` contra `assign()`

- **`.set(obj)`** reemplaza el valor completo.
- **`.assign(obj)`** hace merge: solo toca los campos que le pasás.

En [`src/features/medicacion/acciones.ts`](../src/features/medicacion/acciones.ts) se usa
`assign` porque solo cambian tres campos y el resto de la fila debe quedar intacto:

```ts
export function marcarTomada(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'tomada',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null
    })
}
```

### `batch()` — agrupar escrituras

```ts
import { batch } from "@legendapp/state";

export function marcarTodasTomadas(tomaIds: string[]) {
    batch(() => {
        for (const id of tomaIds) marcarTomada(id)
    })
}
```

Sin `batch`, marcar 5 tomas produce 5 re-renders y 5 peticiones. Con `batch`, se agrupan en un
solo ciclo. **Usalo siempre que escribas en un bucle.**

### Quién genera los IDs

| Tipo de tabla | Quién genera el ID |
|---|---|
| Solo lectura (`articulos`, `tipomedicion`) | **Postgres**, con `defaultRandom()` |
| El usuario escribe (`mediciones`, `medicamentos`, `tomas`) | **El dispositivo**, con `Crypto.randomUUID()` |

La razón es local-first: sin conexión no hay base de datos disponible para asignar un `serial`.
Por eso las llaves primarias son UUID y no enteros autoincrementales.

---

## 5.5 `syncState` — el estado de la sincronización

```ts
import { syncState } from '@legendapp/state'

const estado = syncState(toma$)
estado.isPersistLoaded.get()   // el SQLite local ya cargó
estado.isLoaded.get()          // la descarga del servidor DE ESTA SESIÓN ya terminó
estado.lastSync.get()          // timestamp de la última sincronización (PERSISTIDO)
estado.isGetting.get()         // hay una descarga en curso
estado.reset()                 // borra memoria y caché de esta tabla
```

**La distinción entre estas tres banderas es crítica** y es la causa del bug abierto:

| Bandera | ¿Se persiste? | Qué significa realmente |
|---|---|---|
| `isPersistLoaded` | no | El SQLite local terminó de cargar. **No dice nada de la red** |
| `isLoaded` | **no** | La descarga del servidor **de esta sesión** terminó. Arranca en `false` en cada apertura |
| `lastSync` | **sí** | Marca de tiempo guardada en disco. **Es verdadera apenas carga el caché**, antes de tocar la red |

Usar `lastSync` como "ya sincronicé" es un error: en un arranque en caliente vale `true`
instantáneamente, con datos de la sesión anterior.

---

## 5.6 Archivo por archivo

### `helpers.ts` — utilidades genéricas

```ts
export function porId<T>(todos: Record<string, T> | undefined, id: string): T | undefined {
    return todos?.[id]
}

export function comoLista<T>(todos: Record<string, T> | undefined): T[] {
    return Object.values(todos ?? {})
}
```

`comoLista` convierte el `Record<id, Fila>` en un arreglo para poder usar `.filter()`,
`.map()` y `.sort()`. El `?? {}` es lo que evita el `Object.values(undefined)` durante la
primera carga.

### `auth.ts` — sesión (no es una tabla sincronizada)

Es el único archivo de la carpeta que usa `observable()` "a secas", sin `syncedTable`:

```ts
export const auth$ = observable({
    session: null as Session | null,
    cargando: true,
    cerrandoSesion: false
})

supabase.auth.onAuthStateChange((evento, sesion) => {
    auth$.session.set(sesion)
    auth$.cargando.set(false)

    if (evento === "SIGNED_OUT" && !auth$.cerrandoSesion.get()) {
        limpiarDatosLocales()
    }
})
```

`cerrarSesion()` hace la limpieza completa:

```ts
export async function cerrarSesion() {
    auth$.cerrandoSesion.set(true)   // bloquea la navegación hasta terminar
    try {
        await supabase.auth.signOut()
        await Promise.all(
            getAllSyncStates().map(([syncState$]) => syncState$.reset())
        )
        await Storage.clear()
    } finally {
        auth$.cerrandoSesion.set(false)
    }
}
```

**`getAllSyncStates()`** devuelve todas las tablas sincronizadas registradas. Recorrerlas y
llamar `reset()` borra memoria y caché de cada una. Sin esto, el siguiente usuario que iniciara
sesión en ese teléfono vería los datos del anterior — inaceptable en una app de salud.

La rama `if (evento === "SIGNED_OUT" && !auth$.cerrandoSesion.get())` cubre el cierre de sesión
**involuntario** (token expirado o revocado desde otro dispositivo), donde nadie llamó a
`cerrarSesion()`. La bandera evita limpiar dos veces cuando sí fue voluntario.

### `usuario.ts` — perfil

Única tabla con `as: 'value'` (§5.2) y con `actions: ['read', 'update']`: el perfil se crea por
un trigger de Postgres al registrarse (migración `0001_crear_perfil_al_registrarse.sql`), no
desde la app.

### `articulos.ts` — wiki, solo lectura

```ts
export const articulo$ = observable(syncedTable({
    collection: 'articulos',
    actions: ['read'],   // ← espeja la política RLS: solo SELECT
    initial: {} as Record<string, Articulo>,
    realtime: true,
    persist: {name: 'articulos'}
}))

export function porCategoria(todos: Record<string, Articulo> | undefined, categoria: string): Articulo[] {
    return Object.values(todos ?? {}).filter((a) => a.categoria === categoria)
}
```

### `condicion.ts`, `alergia.ts`, `contactosemergencia.ts` — expediente

Los tres son idénticos en estructura: tipo, observable con
`actions: ['read', 'create', 'update']`, y un helper `porId`. Son el mejor punto de partida para
copiar cuando agregues una tabla nueva.

> **Nota:** los tres definen su propio `porId` local en vez de importar el de `helpers.ts`.
> Es duplicación menor y sin consecuencias, pero si tocás uno de estos archivos, considerá
> migrarlo al helper compartido.

### `medicacion.ts` — la más compleja

Dos observables y un conjunto de helpers puros:

```ts
export const medicamento$ = observable<Record<string,Medicamento>>(syncedTable({
    collection: 'medicamentos', actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Medicamento>, realtime: true, persist: {name: 'medicamentos'}
}))

export const toma$ = observable<Record<string, Toma>>(syncedTable({
    collection: 'tomas', actions: ['read', 'create', 'update'],
    initial: {} as Record<string, Toma>, realtime: true, persist: {name: 'tomas'}
}))
```

**Los horarios van dentro del medicamento**, no en tabla aparte:

```ts
export type HorarioMed = {
    id: string
    hora: string      // "08:00"
    dias: number[]    // [1,3,5] = lunes, miércoles, viernes
}
```

En Postgres es una columna `jsonb`. La decisión evita un JOIN y una tabla más para un dato que
siempre se lee junto con su medicamento.

Los helpers son **funciones puras**: reciben los datos y devuelven datos, sin tocar observables.
Eso permite probarlos sin renderizar y evita duplicar filtros en cada pantalla.

```ts
medicamentosActivos(todos, perfilId)   // activos, ordenados por nombre
horariosOrdenados(medicamento)         // horarios ordenados por hora
resumenDias([1,3,5])                   // → "L, M, V"
tomasDelDia(todos, fecha, perfilId)    // tomas de un día concreto
agruparPorHora(tomas)                  // agrupa las del día por hora exacta
fechaLocalISO(fecha)                   // → "2026-08-13" en hora LOCAL
partirHora("08:00")                    // → { horas: 8, minutos: 0 }
formatearHora("08:00")                 // → "8:00 a. m."
```

> ⚠️ **`fechaLocalISO` existe por una razón.** `date.toISOString()` convierte a UTC, así que una
> toma de las 8 p. m. en Costa Rica (UTC−6) aparecería como del día siguiente. `fechaLocalISO`
> construye la cadena con `getFullYear()`, `getMonth()` y `getDate()`, que son locales.
> **Nunca uses `toISOString().split('T')[0]` para agrupar por día.**

### `medicion.ts` — mediciones

Dos observables: `tipoMedicion$` (catálogo de solo lectura: glucosa, presión, peso) y
`medicion$` (los registros del usuario).

```ts
export function esDoble(tipo: TipoMedicion): boolean {
    return tipo.etiqueta_secundaria !== null
}
```

Un tipo "doble" tiene dos valores — la presión arterial es sistólica y diastólica. Esa
distinción es la que decide si la pantalla usa `CampoMedicion` o `CampoMedicionDoble`.

---

## 5.7 Cómo probar que realmente es local-first

1. Abrí la app con conexión y verificá que se ven los datos.
2. **Cerrá la app por completo. Activá modo avión. Volvé a abrirla.**
3. Los datos deben seguir ahí.
4. Registrá algo nuevo (una medición). Debe guardarse.
5. Desactivá el modo avión. El registro debe subir solo.

Si el paso 3 falla, `persist` no está configurado en `src/lib/sync.ts`.

---

## 5.8 Problema abierto: conflicto de clave única

> 🔴 **Bug activo, sin corregir.** Documentado aquí para que nadie pierda tiempo
> re-diagnosticándolo.

### Síntoma

```
[sync:create] duplicate key value violates unique constraint "tomas_medicamento_programada_unq"
```

Aparece de forma **consistente** al usar la cuenta en dos dispositivos. Borrar el caché local lo
soluciona temporalmente, pero vuelve a ocurrir.

### Causa

[`src/features/medicacion/generar-tomas.ts`](../src/features/medicacion/generar-tomas.ts)
protege la generación con la bandera equivocada:

```ts
const estadoTomas = syncState(toma$)
if (!estadoTomas.isPersistLoaded.get()) return 0
if (!estadoTomas.lastSync.get()) return 0        // ← el problema
```

`lastSync` **se restaura desde el caché** (§5.5). En un arranque en caliente vale `true` apenas
carga el SQLite, **antes de que la descarga del servidor haya devuelto una sola fila**. El
generador corre entonces contra datos viejos:

1. El dispositivo A genera las tomas de hoy → filas nuevas en Postgres.
2. El dispositivo B abre la app. El caché carga → `lastSync` ya tiene valor → pasa el guard.
3. El generador arma su conjunto de tomas existentes desde el caché — **las filas de A no están**.
4. Cree que falta un horario y genera un **UUID nuevo** para una toma que el servidor ya tiene.
5. `INSERT` → misma pareja `(medicamento_id, programada_para)`, distinto `id` → viola el `UNIQUE`.

**Por qué borrar el caché "funciona":** con el caché limpio, `lastSync` es `undefined`, así que
el guard sí bloquea la generación hasta que llegue la respuesta del servidor. El guard solo hace
su trabajo en el único estado en el que se prueba la solución alterna.

**Por qué no se recupera solo:** [`src/lib/sync.ts`](../src/lib/sync.ts) muestra una alerta pero
nunca llama a `params.revert()`. La fila fallida se queda en el observable sin `created_at`, y
Legend-State usa justamente la ausencia de `created_at` para decidir que algo es un `INSERT`.
Con `persist.retrySync: true`, esa escritura queda guardada en la cola y se reintenta en **cada
arranque**, repitiendo la alerta.

### Causa secundaria

`changesSince: 'last-sync'` consulta `updated_at > lastSync`, y **cada evento de realtime avanza
`lastSync`**. Supabase Realtime limita los eventos por segundo; al generar 30+ tomas de golpe se
pierden mensajes. Las filas perdidas quedan por debajo del nuevo `lastSync` y **nunca se vuelven
a pedir**: un hueco permanente en el caché que produce el mismo conflicto.

### Corrección propuesta (no aplicada)

Cambiar el guard a `isLoaded`, que **no** se persiste y solo es `true` cuando la descarga de esta
sesión terminó, y agregar el mismo guard para `medicamento$`:

```ts
const estadoTomas = syncState(toma$)
const estadoMeds = syncState(medicamento$)

if (!estadoTomas.isPersistLoaded.get()) return 0
if (!estadoMeds.isPersistLoaded.get()) return 0

//OJO: no usar lastSync. Se restaura desde el cache al abrir la app, asi que es
//verdadero ANTES de bajar nada del servidor.
if (!estadoTomas.isLoaded.get()) return 0
if (!estadoMeds.isLoaded.get()) return 0
```

Y en `onError`, revertir el conflicto en vez de solo alertar, para que la escritura no quede
atascada en la cola.

**Compromiso a considerar:** sin conexión, `isLoaded` permanece en `false`, así que no se
generarían tomas nuevas hasta reconectar. Las ya sincronizadas se siguen mostrando. Es el precio
correcto frente a una restricción `UNIQUE`: no se pueden inventar filas sin saber qué hay en el
servidor.

---

## 5.9 Cómo agregar una tabla nueva

1. **Definila en `db/schema.ts`** con `created_at`, `updated_at`, `deleted`, sus políticas RLS y
   `.enableRLS()`.
2. **Agregá el trigger** `handle_times` en una migración `--custom`.
3. `npx drizzle-kit generate` y **leé el `.sql`**.
4. `npx drizzle-kit migrate`.
5. **Creá `src/state/<tabla>.ts`** copiando `alergia.ts`:
   ```ts
   export type MiTabla = { id: string; perfil_id: string; /* ... */ }

   export const miTabla$ = observable(syncedTable({
       collection: 'mitabla',        // exacto al nombre en Supabase
       actions: ['read', 'create', 'update'],
       initial: {} as Record<string, MiTabla>,
       realtime: true,
       persist: {name: 'mitabla'}
   }))
   ```
6. **Agregá helpers puros** de filtrado y ordenamiento en ese mismo archivo.
7. **Probá en modo avión** y con dos dispositivos.

---

## 5.10 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `use$ is not exported` | Nombre viejo del hook | Usá `useValue` |
| `Object.values(undefined)` | Falta el valor inicial | Agregá `initial: {}` |
| La tabla devuelve `[]` sin error | RLS bloquea, o el nombre de `collection` está mal | Revisá políticas y ortografía |
| Solo aparece un registro | `as: 'value'` en una tabla que no debe llevarlo | Quitá `as: 'value'` |
| La pantalla no reacciona a un cambio | Se usó `.peek()` en vez de `useValue` | Usá `useValue` para leer en el render |
| Muchos re-renders al escribir en bucle | Falta `batch()` | Envolvé el bucle |
| Los datos se pierden al cerrar la app | `persist` mal configurado | Revisá `src/lib/sync.ts` |
| Datos del usuario anterior tras cambiar de cuenta | No se limpió la caché | `getAllSyncStates()` + `reset()` en `auth.ts` |
| Las tomas se agrupan en el día equivocado | Se usó `toISOString()` para la fecha | Usá `fechaLocalISO()` |
| `duplicate key ... programada_unq` | Bug conocido | §5.8 |
