# Integra — guía del proyecto

App móvil de expediente médico personal. Expo + React Native, local-first,
sincronizada contra Supabase mediante Legend-State.

Documentación complementaria dentro del repo:
- `src/state/STATES.md` — cómo funciona la capa de estado
- `src/lib/LIB.md` — configuración de Supabase y Legend-State
- `db/SCHEMA.md` — notas del esquema

---

## 1. Reglas de trabajo (leer primero)

1. **No edites archivos fuente.** Entregá el código en el chat para que el
   desarrollador lo pegue. Excepción: archivos de documentación o configuración
   que el desarrollador pida explícitamente (como este `CLAUDE.md`).
2. **Nunca borres comentarios existentes.** Si reescribís un archivo, los
   comentarios que ya estaban viajan con el código. Son del desarrollador y
   documentan decisiones. Si un comentario queda obsoleto por el cambio,
   señalalo en el chat en vez de borrarlo por tu cuenta.
3. **No escribas comentarios nuevos.** Los escribe el desarrollador. Tu trabajo
   es que el código no los necesite: nombres claros y funciones chicas.
4. **Releé el archivo antes de proponer un cambio.** El código cambia entre
   mensajes; nunca asumas que lo que leíste hace tres turnos sigue igual.
5. **Parches mínimos y con anclaje.** Indicá archivo y línea. Reescribí el
   archivo completo solo si el cambio es estructural o si te lo piden.
6. **Explicá paso a paso, con el porqué.** Numerá los pasos, poné los tropiezos
   en línea donde ocurren, y cerrá con una lista de verificación concreta.
7. **Si borrás código muerto, decilo explícitamente** en la respuesta, con qué
   borraste y por qué. Nunca en silencio.

---

## 2. Idioma: todo en español

El proyecto es en español **por completo**: variables, funciones, tipos,
archivos, carpetas, comentarios y texto de interfaz. La jerga médica del dominio
es española y mezclar idiomas rompe la coherencia.

Excepciones, y son solo las que impone el entorno:

| Qué | Por qué queda en inglés |
|---|---|
| APIs de React y las librerías (`useState`, `observable`, `syncedTable`) | son de terceros |
| Carpetas de primer nivel (`src/app`, `src/components`, `src/lib`) | `src/app` lo exige expo-router; el resto se mantiene parejo |
| Columnas de la base de datos y campos de los tipos de fila | ya están en español (`perfil_id`, `programada_para`); no se tocan |
| Mensajes de `console.error` / `console.warn` | son para depurar, no para la persona usuaria |

Los tipos de fila son el formato de transporte: sus campos coinciden carácter
por carácter con las columnas de Postgres, porque el plugin de Supabase lee y
escribe filas crudas y `changesSince: 'last-sync'` referencia `created_at` y
`updated_at` por nombre.

---

## 3. Stack y versiones

Verificá siempre contra `package.json`.

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

Alias: `@/*` → `./src/*`. `strict: true` activo.

---

## 4. Cómo escribir el código

**Funciones puras y chicas.** Una función hace una cosa. Si necesita un "y" para
describirse, son dos funciones.

**Componer, no repetir.** Si un filtro o un orden aparece dos veces, se extrae a
`src/state/consultas.ts` y se compone.

**Una fábrica por patrón repetido.** Ocho tablas que se declaran igual son una
fábrica y ocho llamadas, no ocho bloques copiados.

**Un archivo, un dominio.** `medicamentos.ts` no contiene utilidades de fechas.
Lo genérico vive en `src/lib/`.

**Nombres que digan qué devuelven**, no cómo lo hacen: `citasNoResueltas`, no
`filtrarYOrdenarCitas`. Sin sufijos de ruido: `formatearFecha`, no
`formatearFechaAString` — que devuelve texto ya lo dice el tipo.

**Sin abreviaturas.** `medicamento`, no `med`. `perfilId`, no `pid`.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas y archivos que no son componentes | `kebab-case` | `contactos-emergencia.ts` |
| Archivos que exportan un componente React | `PascalCase`, igual al componente | `ProximaCita.tsx` |
| Tipos y componentes | `PascalCase` singular | `ContactoEmergencia` |
| Funciones y variables | `camelCase` | `medicamentosActivos` |
| Observables de Legend-State | `camelCase` plural + `$` | `alergias$` |
| Constantes de módulo | `SCREAMING_SNAKE_CASE` | `LARGO_MAXIMO_QR` |
| Predicados | prefijo `es` / `tiene` / `esta` | `esDoble`, `estaVencida` |

Los observables van en **plural** porque contienen un `Record` de muchas filas;
el tipo de la fila va en singular.

---

## 5. Estructura

```
src/
  app/         Rutas de expo-router. Solo composición y navegación.
  components/  Componentes genéricos, sin lógica de dominio.
  features/    Componentes y esquemas de Zod por dominio.
  lib/         Infraestructura: Supabase, sync, fechas, ids.
  state/       Observables de Legend-State y consultas derivadas.
  theme/       Paleta espejo de tailwind.config.js.
```

Las pantallas leen observables y componen; no contienen reglas de negocio. Toda
derivación de datos vive en `src/state/`.

`features/` se agrupa **por dominio**, no por tipo de archivo: el esquema de Zod
y los componentes de un dominio viven juntos. Una carpeta por dominio, en plural
cuando el dominio son varias filas (`alergias/`, `condiciones/`).

**Si un archivo de `features/` no importa React, no pertenece ahí.** Las
mutaciones y la generación de datos son estado: van en `src/state/`.

---

## 6. Legend-State v3

Documentación: https://legendapp.com/open-source/state/v3/

Ver `src/state/STATES.md` para el flujo local-first completo.

### Configuración

`src/lib/sync.ts` define `syncedTable` con `configureSynced(syncedSupabase, ...)`:
plugin de persistencia SQLite, `retrySync`, reintento infinito, `waitFor` sobre
la sesión y el manejo de errores. Ahí también viven las fábricas de tabla.

Config global en `configureSyncedSupabase`: `changesSince: 'last-sync'`,
`fieldCreatedAt`, `fieldUpdatedAt`, `fieldDeleted`, `generateId`.

Toda tabla necesita `created_at`, `updated_at` y `deleted`. Al crear una tabla
nueva en `db/schema.ts`, agregá las tres.

Opciones por tabla: `collection`, `actions` (`'read' | 'create' | 'update' |
'delete'`), `as` (`'object'` por defecto, `'value'` solo para el perfil),
`initial`, `realtime`, `persist`, `select`, `filter`.

### Borrado

Con `fieldDeleted` configurado, **`.delete()` ya es el borrado suave**: marca
`deleted = true` en vez de eliminar la fila, y el listado la excluye sola. Es
correcto llamar `tabla$[id].delete()`; no hace falta escribir el campo a mano.

### Hooks

`useValue` es el hook principal. `use$` y `useSelector` están deprecados.
`observer` como HOC reduce la cantidad de hooks cuando un componente lee muchos
observables.

`syncState(obs$)` expone `isLoaded`, `isPersistLoaded`, `error`, `lastSync`,
`sync()`, `clearPersist()`, `getPendingChanges()`.

### ⚠️ Trampas confirmadas

**Nunca envuelvas datos de Legend-State en `useMemo`.** Legend-State muta el
objeto padre en sitio (`parentValue[key] = newValue`). Al hacer
`tabla$[id].set({...})` sobre una llave existente, la referencia del padre no
cambia; `useMemo` compara con `Object.is`, no ve diferencia y devuelve el valor
viejo. La pantalla se re-renderiza pero muestra datos obsoletos hasta que se
desmonta. Calculá directo en el cuerpo del componente: las funciones derivadas
son baratas.

**Todos los hooks van antes de cualquier `return`**, incluidos los `useValue`.
Un hook debajo de un `return` temprano provoca *"Rendered more hooks than during
the previous render"* apenas cambia la condición.

**Filtrá siempre por `perfilId`.** La caché de SQLite sobrevive al cierre de
sesión hasta que `cerrarSesion()` termina de limpiarla. Sin ese filtro, dos
personas en el mismo teléfono pueden ver datos cruzados. RLS protege el
servidor, no la caché local.

---

## 7. Supabase y base de datos

Documentación: https://supabase.com/docs/reference/javascript

Cliente en `src/lib/supabase.ts`, tipado con `Database`. Sesión persistida en
`expo-sqlite/kv-store`. `autoRefreshToken` se pausa y reanuda según `AppState`.

Todas las tablas tienen RLS con políticas `select` / `insert` / `update` que
comparan `auth.uid()` contra `perfil_id`.

**`db/schema.ts` (Drizzle) es la fuente de verdad**, no
`src/lib/database.types.ts`, que está desactualizado y hay que regenerar.

**Trampa de `drizzle-kit`:** cuando renombrás una columna *y* le cambiás el tipo
en la misma edición, el prompt interactivo genera solo el `RENAME` y se come el
cambio de tipo. Pasó con `citas_resultado.asistido` → `tipo_resultado`
(migración 0021) y produjo un `invalid input syntax for type boolean` en
runtime. `drizzle-kit generate` no lo detecta después, porque el snapshot ya
refleja el tipo nuevo. Al renombrar y retipar, revisá el `.sql` a mano.

---

## 8. Expo y expo-router

Documentación: https://docs.expo.dev/versions/v54.0.0/

Rutas basadas en archivos, raíz en `src/app`. `router.navigate` / `replace` /
`back`, y `useLocalSearchParams` para los parámetros.

`Stack.Protected guard={...}` en `src/app/_layout.tsx` controla el acceso: sin
sesión va a `(auth)`, con sesión a `(tabs)`.

**`useFocusEffect` (exportado por `expo-router`) y no `useEffect`** para efectos
que deben limpiarse al salir de la pantalla: en un Stack, empujar otra pantalla
encima **no** desmonta la actual, así que el cleanup de `useEffect` no corre.

**expo-print:** rinde a 72 PPI (Letter = 612×792 px), o sea 1px = 1pt y
1mm = 2.835px. No uses unidades `mm` de CSS: el WebView las mapea a 96 PPI. iOS
no carga archivos locales en el HTML de impresión; las imágenes van embebidas
como `data:` URI.

---

## 9. Estilos

NativeWind v4. La paleta se define con variables CSS en `global.css`, se expone
en `tailwind.config.js` y se espeja en `src/theme/colors.ts`.

**Si cambiás un color, cambialo en los tres lugares.**

Tokens: `surface` / `content` / `line` / `primary` / `success` / `warning` /
`danger` con sus variantes, más tamaños (`text-body`) y radios (`rounded-card`).
Usá los tokens, no valores crudos.

**NativeWind no aplica `className` a componentes de terceros**
(`react-native-calendars`, por ejemplo). Para esos, pasá colores planos desde
`src/theme/colors.ts`.

---

## 10. Formularios

`react-hook-form` + `zodResolver`. El esquema de Zod y las listas de opciones
viven en `src/features/<dominio>/<dominio>-schema.ts`. Los campos son los
componentes `Campo*` de `src/components/`.

Los mensajes de validación van en español, dirigidos a la persona usuaria.
