# 6. Carpeta `src/lib/`

> Configuración global. Tres archivos, ninguna lógica de negocio.

| Librería | Versión | Documentación |
|---|---|---|
| `@supabase/supabase-js` | `^2.112.2` | https://supabase.com/docs/reference/javascript/introduction |
| `@legendapp/state` | `^3.0.0-beta.48` | https://legendapp.com/open-source/state/v3/sync/persist-sync/ |
| `expo-sqlite` | `~16.0.10` | https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/kv-store/ |
| `react-native` (`AppState`) | `0.81.5` | https://reactnative.dev/docs/appstate |

**Regla de la carpeta:** `lib/` no importa de `state/`, `features/` ni `app/`. Solo configura
librerías. Si alguna vez necesitás lo contrario, es señal de que la abstracción está mal cortada
— y además crea un ciclo de importación que Metro resuelve de forma impredecible.

---

## 6.1 `supabase.ts` — el cliente

```ts
import {createClient} from '@supabase/supabase-js'
import Storage from 'expo-sqlite/kv-store'
import { AppState } from 'react-native'

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: Storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
)

AppState.addEventListener('change', (state) => {
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
})
```

Esta constante es **la única instancia** del cliente en todo el proyecto. Todo lo demás
—`sync.ts`, `auth.ts`, las pantallas de login— la importa desde aquí. Crear un segundo cliente
produce dos sesiones que se pisan.

### Las variables de entorno

> 🔴 El nombre es **`EXPO_PUBLIC_SUPABASE_KEY`**, no `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
> Si usás el otro, el cliente arranca con `undefined` y todas las peticiones fallan con un error
> de token inválido. (El `DOCUMENTACION.md` de la raíz tiene el nombre viejo.)

El `!` al final (`process.env.EXPO_PUBLIC_SUPABASE_URL!`) es el operador *non-null assertion* de
TypeScript: le promete al compilador que el valor no es `undefined`. **Es una promesa, no una
verificación** — si la variable falta, el error aparece en tiempo de ejecución. Es un compromiso
aceptado aquí porque sin esas variables la app no puede arrancar de ninguna forma.

### Cada opción de `auth`

| Opción | Valor | Por qué |
|---|---|---|
| `storage` | `Storage` (kv-store de expo-sqlite) | Dónde se guarda la sesión. En web sería `localStorage`, que no existe en React Native |
| `autoRefreshToken` | `true` | El JWT expira en ~1 hora. Sin esto, el usuario es expulsado a mitad de uso |
| `persistSession` | `true` | La sesión sobrevive al cierre de la app. Sin esto habría que iniciar sesión cada vez |
| `detectSessionInUrl` | `false` | Solo aplica a web (OAuth por query string). En móvil hay que desactivarlo |

### El listener de `AppState`

```ts
AppState.addEventListener('change', (state) => {
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
})
```

`AppState` avisa cuando la app pasa a segundo plano o vuelve al frente.

**Por qué es necesario:** el temporizador de refresco de token no corre de forma confiable en
segundo plano. Sin este listener, la app vuelve del fondo con un token expirado y la siguiente
petición falla con un 401 que parece un bug aleatorio. `startAutoRefresh()` al volver al frente
lo renueva de inmediato; `stopAutoRefresh()` al irse al fondo evita gastar batería en
temporizadores que el sistema va a suspender igual.

Es un patrón recomendado por la documentación de Supabase para React Native, y una de las causas
más comunes de "la sesión expira sola" cuando falta.

---

## 6.2 `sync.ts` — el motor de sincronización

El archivo más corto del proyecto y el que más consecuencias tiene.

```ts
import {configureSynced} from '@legendapp/state/sync'
import {observablePersistSqlite} from '@legendapp/state/persist-plugins/expo-sqlite'
import {configureSyncedSupabase, syncedSupabase} from '@legendapp/state/sync-plugins/supabase'
import { Storage } from 'expo-sqlite/kv-store'
import { supabase } from './supabase'
import { Alert } from 'react-native'

configureSyncedSupabase({
    changesSince: 'last-sync',
    fieldCreatedAt: 'created_at',
    fieldUpdatedAt: 'updated_at',
    fieldDeleted: 'deleted'
})

export const syncedTable = configureSynced(syncedSupabase, {
    supabase,
    persist: {plugin: observablePersistSqlite(Storage), retrySync: true},
    retry: {infinite: true},
    onError: (error, params) => {
        console.error(`[sync:${params.source}]`, error.message)

        const isPermanent = error.message.includes('permission denied')
            || error.message.includes('row-level security')
            || error.message.includes('violates')

        if (isPermanent) {
            Alert.alert('Error de sincronizacion', 'No se pudo guardar en el servidor. Intente mas tarde')
        }
    }
})
```

### `configureSyncedSupabase` — los nombres de las columnas técnicas

Le dice al plugin cómo se llaman las tres columnas que necesita **toda** tabla sincronizada.

| Opción | Valor | Qué hace |
|---|---|---|
| `changesSince` | `'last-sync'` | Sincronización **incremental**: solo pide filas con `updated_at` posterior a la última sincronización |
| `fieldCreatedAt` | `'created_at'` | También sirve para distinguir un `INSERT` de un `UPDATE` |
| `fieldUpdatedAt` | `'updated_at'` | La columna que se compara para el sync incremental |
| `fieldDeleted` | `'deleted'` | Borrado lógico: una fila con `deleted = true` desaparece del observable |

**`changesSince: 'last-sync'` en detalle.** El plugin traduce esto a un filtro
`updated_at > <lastSync>` en la consulta. Ahorra ancho de banda, pero tiene una consecuencia:
**si una fila no llega en su momento, nunca se vuelve a pedir**, porque su `updated_at` queda
por debajo del marcador. Es la causa secundaria del bug descrito en
[05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).

**`fieldCreatedAt` hace más de lo que parece.** Legend-State decide si una escritura es `INSERT`
o `UPDATE` mirando si la fila local **ya tiene `created_at`**. Una fila sin ese campo se
considera nueva. Por eso una creación fallida —que nunca recibe la respuesta del servidor con su
`created_at`— se reintenta como `INSERT` para siempre.

### `configureSynced` — la configuración compartida

Devuelve `syncedTable`, la función que usan todos los archivos de `src/state/`. Configurarlo una
vez aquí evita repetir las mismas opciones en cada tabla.

| Opción | Qué hace |
|---|---|
| `supabase` | El cliente de `supabase.ts` |
| `persist.plugin` | **La línea que hace que la app funcione sin conexión.** Guarda el observable en SQLite en cada cambio y lo recarga al abrir |
| `persist.retrySync` | Las escrituras pendientes se guardan **en disco** y se reintentan tras reiniciar |
| `retry: {infinite: true}` | Las sincronizaciones fallidas se reintentan indefinidamente |

### `onError` — y lo que le falta

El manejador actual registra el error y, si parece permanente, muestra una alerta.

> ⚠️ **Limitación conocida.** `onError` recibe un `params.revert()` que **no se está llamando**.
> Cuando una escritura falla de forma permanente (por ejemplo, una violación de clave única), la
> fila mala se queda en el observable y, gracias a `retrySync: true`, en la cola persistida.
> Resultado: el error se repite en cada arranque y la única salida es borrar el caché.
>
> La corrección propuesta —revertir el cambio y forzar una resincronización cuando el mensaje
> indica conflicto— está descrita en
> [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).

Nota adicional: el filtro `includes('violates')` captura los conflictos de clave única dentro de
la rama genérica de alerta. Por eso cada conflicto se convierte en un popup en vez de en una
recuperación.

### `params.source`

El prefijo del log (`[sync:create]`, `[sync:update]`, `[sync:list]`) indica **qué operación
falló**. Es lo primero que hay que leer al diagnosticar:

| Fuente | Significado |
|---|---|
| `list` | Falló la descarga (lectura) |
| `create` | Falló un `INSERT` |
| `update` | Falló un `UPDATE` |
| `subscribe` | Falló la suscripción de realtime |

---

## 6.3 `limpiar-cache.ts` — utilidad temporal

```ts
import { Storage } from 'expo-sqlite/kv-store'

//TEMPORAL: borra todo el cache local al arrancar.
//Correr una vez y luego BORRAR este archivo y su import.
Storage.clearSync()
console.log('>>> CACHE LOCAL BORRADO <<<')
```

Este archivo **no exporta nada**: el efecto ocurre al importarlo. Se agregó para salir del bug de
clave única durante el desarrollo.

> ⚠️ **Mientras esté importado, borra el caché en cada arranque.** Eso destruye la persistencia
> offline y hace imposible verificar si un arreglo de sincronización funciona. Su propio
> comentario dice que se corra una vez y se borre. **Verificá que no esté importado antes de
> probar cualquier cosa relacionada con sincronización.**

Para encontrar quién lo importa:

```bash
grep -rn "limpiar-cache" src/
```

---

## 6.4 `expo-sqlite/kv-store` — las dos importaciones

Este detalle confunde porque **el mismo módulo se importa de dos formas distintas** en el
proyecto:

```ts
import Storage from 'expo-sqlite/kv-store'        // src/lib/supabase.ts   (default)
import { Storage } from 'expo-sqlite/kv-store'    // src/lib/sync.ts       (nombrado)
```

Ambas funcionan porque el módulo expone las dos. `kv-store` es una API de clave-valor construida
sobre SQLite, con la misma interfaz que AsyncStorage:

```ts
Storage.getItem(clave)
Storage.setItem(clave, valor)
Storage.clear()        // asíncrono
Storage.clearSync()    // síncrono
```

**Por qué no AsyncStorage:** `expo-sqlite` ya es dependencia (Legend-State lo necesita para
persistir), así que agregar AsyncStorage sumaría un módulo nativo más para exactamente la misma
funcionalidad.

---

## 6.5 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Error de token inválido en todo | Nombre de variable equivocado | Debe ser `EXPO_PUBLIC_SUPABASE_KEY` |
| La sesión expira al volver del fondo | Falta el listener de `AppState` | Ver §6.1 |
| Hay que iniciar sesión en cada apertura | `persistSession: false` o `storage` mal configurado | Revisá las opciones de `auth` |
| La app queda vacía sin conexión | `persist` mal configurado | Revisá `observablePersistSqlite(Storage)` |
| Los datos se borran en cada arranque | `limpiar-cache.ts` sigue importado | Quitá el import |
| Un error de sync se repite en cada arranque | La escritura mala quedó en la cola | Falta `params.revert()` en `onError` (§6.2) |
| Dos sesiones que se pisan | Se creó un segundo cliente de Supabase | Importá siempre desde `src/lib/supabase.ts` |
