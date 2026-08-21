# Integra — guía del proyecto

App móvil de expediente médico personal. Expo + React Native, offline-first,
sincronizada contra Supabase mediante Legend-State.

---

## 1. Reglas de trabajo (leer primero)

1. **No edites archivos fuente.** Entregá el código en el chat para que el
   desarrollador lo pegue. Excepción: archivos de documentación o configuración
   que el desarrollador pida explícitamente (como este `CLAUDE.md`).
2. **No escribas comentarios en el código.** El desarrollador los escribe. El
   código debe explicarse solo mediante nombres claros y funciones pequeñas.
   Si algo necesita un comentario para entenderse, primero intentá reescribirlo.
3. **Releé el archivo antes de proponer un cambio.** El código cambia entre
   mensajes; nunca asumas que lo que leíste hace tres turnos sigue igual.
4. **Parches mínimos y con anclaje.** Indicá archivo y línea. Reescribí el
   archivo completo solo si el cambio es estructural o si te lo piden.
5. **Explicá paso a paso, con el porqué.** Numerá los pasos, poné los tropiezos
   en línea donde ocurren, y cerrá con una lista de verificación concreta.
6. **Escribí código claro, escalable y expandible.** Nada de nudos. Ver §4.

---

## 2. Idioma

| Qué | Idioma |
|---|---|
| Nombres de variables, funciones, tipos, archivos, carpetas | **Inglés** |
| Texto visible para la persona usuaria (labels, botones, placeholders) | **Español** |
| Mensajes de error mostrados en pantalla | **Español** |
| Mensajes de `console.error` / `console.warn` | **Inglés** |
| Comentarios | **Español** (los escribe el desarrollador) |
| Columnas de la base de datos | **Español** (ver abajo) |

**Las columnas de Postgres se quedan en español.** `perfil_id`,
`programada_para`, `tipo_citas`, `medido_en`. Los tipos de fila de TypeScript
son el formato de transporte: sus campos deben coincidir carácter por carácter
con las columnas, porque el plugin de Supabase lee y escribe filas crudas.
Renombrarlos exigiría migrar la base entera y romper `db/schema.ts`.

Todo lo demás —nombres de tipos, funciones, variables locales, archivos— va en
inglés.

---

## 3. Stack y versiones

Verificá siempre contra `package.json`; estas son las versiones vigentes.

| Paquete | Versión |
|---|---|
| expo | ~54.0.35 (SDK 54) |
| react-native | 0.81.5 |
| react | 19.1.0 |
| expo-router | ~6.0.24 |
| @legendapp/state | ^3.0.0-beta.48 |
| @supabase/supabase-js | ^2.112.2 |
| expo-sqlite | ~16.0.10 |
| nativewind | ^4.2.6 |
| zod | ^4.4.3 |
| react-hook-form | ^7.84.0 |
| drizzle-orm / drizzle-kit | ^0.45.2 / ^0.31.10 |

Alias de importación: `@/*` → `./src/*` (definido en `tsconfig.json`).
`strict: true` está activo.

---

## 4. Cómo escribir el código

**Funciones puras y chicas.** Una función hace una cosa. Si necesita un "y" para
describirse, son dos funciones.

**Componer, no repetir.** Si un filtro o un orden aparece en dos lugares, se
extrae a un helper y se compone. Ver `src/state/query.ts`.

**Una fábrica por patrón repetido.** Ocho tablas que se declaran igual son una
fábrica y ocho llamadas, no ocho bloques copiados.

**Un archivo, un dominio.** `medications.ts` no contiene utilidades de fechas.
Lo genérico vive en `src/lib/`.

**Nombres que digan qué devuelven**, no cómo lo hacen: `pendingAppointments`,
no `filterAndSortAppointments`.

**Sin abreviaturas.** `measurement`, no `meas`. `profileId`, no `pid`.

**Convenciones de nombres:**

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos y carpetas | `kebab-case` | `emergency-contacts.ts` |
| Tipos y componentes | `PascalCase` singular | `EmergencyContact` |
| Funciones y variables | `camelCase` | `activeMedications` |
| Observables de Legend-State | `camelCase` + `$` | `appointments$` |
| Constantes de módulo | `SCREAMING_SNAKE_CASE` | `MAX_QR_LENGTH` |
| Predicados | prefijo `is` / `has` | `isResolved`, `hasSecondaryValue` |

---

## 5. Estructura

```
src/
  app/         Rutas de expo-router. Solo composición y navegación.
  components/  Componentes genéricos, sin lógica de dominio.
  features/    Componentes y esquemas por dominio.
  lib/         Infraestructura: cliente Supabase, sync, fechas, ids.
  state/       Observables de Legend-State y consultas derivadas.
  theme/       Paleta espejo de tailwind.config.js.
```

Las pantallas leen observables y componen; no contienen reglas de negocio. Toda
derivación de datos vive en `src/state/`.

---

## 6. Legend-State v3

Documentación: https://legendapp.com/open-source/state/v3/

### Lo que usamos

```ts
observable(syncedTable({ collection, actions, initial, realtime, persist }))
```

`syncedTable` es nuestro `configureSynced(syncedSupabase, {...})` en
`src/lib/sync.ts`. Aplica a todas las tablas: plugin de persistencia SQLite,
`retrySync`, reintento infinito, `waitFor` sobre la sesión y el manejo de
errores.

Config global en `configureSyncedSupabase`:
`changesSince: 'last-sync'`, `fieldCreatedAt`, `fieldUpdatedAt`, `fieldDeleted`.

Opciones por tabla: `collection`, `actions` (`'read' | 'create' | 'update' |
'delete'`), `as` (`'object'` por defecto, `'value'` para fila única), `initial`,
`realtime`, `persist`, `select`, `filter`.

**Borrado suave:** con `fieldDeleted` configurado, `.delete()` marca
`deleted = true` en vez de eliminar la fila, y el listado las excluye solo.

### Hooks

`useValue` es el hook principal y el preferido. `use$` y `useSelector` están
deprecados. `observer` como HOC reduce la cantidad de hooks cuando un componente
lee muchos observables.

`syncState(obs$)` expone `isLoaded`, `isPersistLoaded`, `error`, `lastSync`,
`sync()`, `clearPersist()`, `getPendingChanges()`.

### ⚠️ Trampas confirmadas

**Nunca envuelvas datos de Legend-State en `useMemo`.** Legend-State muta el
objeto padre en sitio (`parentValue[key] = newValue`). Al hacer
`table$[id].set({...})` sobre una llave existente, la referencia del padre no
cambia; `useMemo` compara con `Object.is`, no ve diferencia y devuelve el valor
viejo. La pantalla se re-renderiza pero muestra datos obsoletos hasta que se
desmonta. Calculá directo en el cuerpo del componente: las funciones derivadas
son baratas.

**Todos los hooks van antes de cualquier `return`.** Incluidos los `useValue`.
Un hook debajo de un `return` temprano provoca *"Rendered more hooks than during
the previous render"* en cuanto la condición cambia.

**Filtrá siempre por `profileId`.** La caché de SQLite sobrevive al cierre de
sesión hasta que `signOut()` termina de limpiarla. Sin ese filtro, dos personas
en el mismo teléfono pueden ver datos cruzados. RLS protege el servidor, no la
caché local.

---

## 7. Supabase

Documentación: https://supabase.com/docs/reference/javascript

Cliente en `src/lib/supabase.ts`, tipado con `Database` de
`src/lib/database.types.ts`. Sesión persistida en `expo-sqlite/kv-store`.
`autoRefreshToken` se pausa y reanuda según el `AppState`.

Todas las tablas tienen RLS con políticas `select` / `insert` / `update`
comparando `auth.uid()` contra `perfil_id`.

### Base de datos

**`db/schema.ts` (Drizzle) es la fuente de verdad**, no
`src/lib/database.types.ts`, que está desactualizado y hay que regenerar.

Columnas comunes en todas las tablas: `id` (uuid), `perfil_id`, `created_at`,
`updated_at`, `deleted`.

**Trampa de `drizzle-kit`:** cuando renombrás una columna *y* le cambiás el tipo
en la misma edición, el prompt interactivo genera solo el `RENAME` y se come el
cambio de tipo. Pasó con `citas_resultado.asistido` → `tipo_resultado`
(migración 0021), y `drizzle-kit generate` no lo detecta después porque el
snapshot ya refleja el tipo nuevo. Al renombrar y retipar, revisá el `.sql`
generado a mano.

---

## 8. Expo y expo-router

Documentación: https://docs.expo.dev/versions/v54.0.0/

Rutas basadas en archivos, raíz en `src/app` (configurado en `app.json`).
Navegación con `router.navigate` / `router.replace` / `router.back`.
`useLocalSearchParams` para los parámetros de ruta.

`Stack.Protected guard={...}` en `src/app/_layout.tsx` controla el acceso: sin
sesión va a `(auth)`, con sesión a `(tabs)`.

`useFocusEffect` (exportado por `expo-router`) y no `useEffect` para efectos que
deben limpiarse al salir de la pantalla: en un Stack, empujar otra pantalla
encima **no** desmonta la actual.

**expo-print:** rinde a 72 PPI (Letter = 612×792 px), o sea 1px = 1pt y
1mm = 2.835px. No uses unidades `mm` de CSS: el WebView las mapea a 96 PPI.
iOS no carga archivos locales en el HTML de impresión; las imágenes van
embebidas como `data:` URI.

---

## 9. Estilos

NativeWind v4. La paleta se define con variables CSS en `global.css`, se expone
en `tailwind.config.js` y se espeja en `src/theme/colors.ts`.

**Si cambiás un color, cambialo en los tres lugares.**

Tokens: `surface` / `content` / `line` / `primary` / `success` / `warning` /
`danger`, cada uno con sus variantes. Tamaños de texto y radios también son
tokens (`text-body`, `rounded-card`). Usá los tokens, no valores crudos.

**NativeWind no aplica `className` a componentes de terceros**
(`react-native-calendars`, por ejemplo). Para esos, pasá colores planos desde
`src/theme/colors.ts`.

---

## 10. Formularios

`react-hook-form` + `zodResolver`. El esquema de Zod vive en
`src/features/<dominio>/<dominio>-schema.ts` junto a las listas de opciones.
Los campos son los componentes `Campo*` de `src/components/`.

Los mensajes de validación van en español, dirigidos a la persona usuaria.
