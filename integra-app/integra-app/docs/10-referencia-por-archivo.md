# 10. Referencia por archivo

> Cada archivo del proyecto, qué hace, qué librerías usa, en qué versión y dónde está su
> documentación. Pensado para consulta rápida, no para leer de corrido.

**Leyenda de columnas:** *Librerías principales* lista solo lo relevante para entender el
archivo; se omiten `react` y `react-native`, que están en prácticamente todos los `.tsx`.

---

## 10.1 Índice de versiones

Referencia rápida para las tablas de abajo. Detalle completo en
[01-instalacion-y-ejecucion.md](01-instalacion-y-ejecucion.md#16-versiones-de-todas-las-librerías).

| Librería | Versión | Documentación |
|---|---|---|
| `expo` | `~54.0.35` | https://docs.expo.dev/versions/v54.0.0/ |
| `expo-router` | `~6.0.24` | https://docs.expo.dev/router/introduction/ |
| `react` | `19.1.0` | https://react.dev/reference/react |
| `react-native` | `0.81.5` | https://reactnative.dev/docs/components-and-apis |
| `@legendapp/state` | `^3.0.0-beta.48` | https://legendapp.com/open-source/state/v3/ |
| `@supabase/supabase-js` | `^2.112.2` | https://supabase.com/docs/reference/javascript/introduction |
| `drizzle-orm` | `^0.45.2` | https://orm.drizzle.team/docs/overview |
| `drizzle-kit` | `^0.31.10` | https://orm.drizzle.team/docs/kit-overview |
| `zod` | `^4.4.3` | https://zod.dev/ |
| `react-hook-form` | `^7.84.0` | https://react-hook-form.com/docs |
| `@hookform/resolvers` | `^5.7.1` | https://github.com/react-hook-form/resolvers |
| `nativewind` | `^4.2.6` | https://www.nativewind.dev/ |
| `tailwindcss` | `^3.4.17` | https://v3.tailwindcss.com/docs |
| `expo-sqlite` | `~16.0.10` | https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/ |
| `expo-crypto` | `~15.0.9` | https://docs.expo.dev/versions/v54.0.0/sdk/crypto/ |
| `react-native-safe-area-context` | `~5.6.0` | https://appandflow.github.io/react-native-safe-area-context/ |
| `react-native-modal-datetime-picker` | `^18.0.0` | https://github.com/mmazzarolo/react-native-modal-datetime-picker |
| `@react-native-community/datetimepicker` | `8.4.4` | https://github.com/react-native-datetimepicker/datetimepicker |
| `rn-modal-picker` | `^0.4.9` | https://www.npmjs.com/package/rn-modal-picker |
| `@expo/vector-icons` | `^15.0.3` | https://docs.expo.dev/guides/icons/ |
| `typescript` | `~5.9.2` | https://www.typescriptlang.org/docs/ |

---

## 10.2 Configuración (raíz)

| Archivo | Qué hace | Librerías principales | Doc del proyecto |
|---|---|---|---|
| `package.json` | Dependencias, scripts y el bloque `overrides` | npm | [§1.6](01-instalacion-y-ejecucion.md#16-versiones-de-todas-las-librerías) |
| `app.json` | Config de Expo: plugins, New Architecture, `scheme` | `expo ~54.0.35`, `expo-router ~6.0.24` | [§1.8](01-instalacion-y-ejecucion.md#18-configuración-del-proyecto-archivo-por-archivo) |
| `tsconfig.json` | `strict: true` y el alias `@/*` → `./src/*` | `typescript ~5.9.2` | [§1.8](01-instalacion-y-ejecucion.md#18-configuración-del-proyecto-archivo-por-archivo) |
| `babel.config.js` | `jsxImportSource: "nativewind"` — habilita `className` | `babel-preset-expo ~54.0.10`, `nativewind ^4.2.6` | [§1.8](01-instalacion-y-ejecucion.md#18-configuración-del-proyecto-archivo-por-archivo) |
| `metro.config.js` | Conecta NativeWind con el bundler | `nativewind ^4.2.6` | [§1.8](01-instalacion-y-ejecucion.md#18-configuración-del-proyecto-archivo-por-archivo) |
| `tailwind.config.js` | Rutas que Tailwind escanea (`content`) | `tailwindcss ^3.4.17` | [§1.8](01-instalacion-y-ejecucion.md#18-configuración-del-proyecto-archivo-por-archivo) |
| `global.css` | Directivas `@tailwind`. Se importa en `src/app/_layout.tsx` | `tailwindcss ^3.4.17` | — |
| `drizzle.config.ts` | Config de drizzle-kit: `schemaFilter`, `casing`, roles | `drizzle-kit ^0.31.10`, `dotenv ^17.4.2` | [§8.3](08-carpeta-db-drizzle.md#83-configuración-crítica) |
| `nativewind-env.d.ts` | Declara el tipo de `className` para TypeScript | `nativewind ^4.2.6` | — |
| `.env.local` | Secretos. **No se versiona** | — | [§1.3](01-instalacion-y-ejecucion.md#13-variables-de-entorno) |
| `AGENTS.md` / `CLAUDE.md` | Instrucciones para asistentes de IA | — | — |

---

## 10.3 `db/` — esquema de la base de datos

| Archivo | Qué hace | Librerías principales | Doc del proyecto |
|---|---|---|---|
| `db/schema.ts` | **Todas** las tablas, enums, índices y políticas RLS | `drizzle-orm ^0.45.2`, `drizzle-orm/supabase` | [08](08-carpeta-db-drizzle.md) |
| `db/SCHEMA.md` | Notas originales sobre Drizzle | — | *reemplazado por [08](08-carpeta-db-drizzle.md)* |

### Tablas definidas en `db/schema.ts`

| Tabla | Acceso | Detalle |
|---|---|---|
| `articulos` | Pública, `select` | Wiki. `anonRole` + `authenticatedRole` |
| `tipomedicion` | Pública, `select` | Catálogo de tipos de medición |
| `perfiles` | Propia, `select` + `update` | Referencia a `auth.users`. Se crea por trigger |
| `condiciones` | Propia, CRU | |
| `alergias` | Propia, CRU | |
| `contactosemergencia` | Propia, CRU | |
| `medicamentos` | Propia, CRU | Horarios en columna `jsonb` |
| `tomas` | Propia, CRU | `UNIQUE (medicamento_id, programada_para)` |
| `mediciones` | Propia, CRU | `medido_en` separado de `created_at` |

---

## 10.4 `drizzle/` — migraciones

| Archivo | Qué hizo |
|---|---|
| `0000_happy_bill_hollister.sql` | Esquema inicial |
| `0001_crear_perfil_al_registrarse.sql` | Trigger: crea `perfiles` al registrarse en `auth.users` |
| `0002_steady_impossible_man.sql` | Cambios automáticos |
| `0003_handle_times_function.sql` | Función `handle_times()` + trigger en `perfiles` |
| `0004_furry_gabe_jones.sql` | Cambios automáticos |
| `0005_cedula_perfiles.sql` | Campo cédula |
| `0006_perfil_contacto.sql` | Datos de contacto del perfil |
| `0007_condiciones_tabla.sql` | Tabla de condiciones |
| `0008`–`0013` | Cambios automáticos |
| `0014_next_shiver_man.sql` | Tabla `tomas` + `tomas_medicamento_programada_unq` |
| `0015_triggers_medicacion.sql` | Triggers en medicación **y en 4 tablas que no lo tenían** |
| `0016`–`0018` | Cambios automáticos |
| `0019_mediciones_trigger_y_presion.sql` | Trigger de mediciones y soporte de presión arterial |
| `drizzle/meta/*.json` | Instantáneas del esquema. **No editar. Sí versionar** |

Detalle en [§8.11](08-carpeta-db-drizzle.md#811-historial-de-migraciones).

---

## 10.5 `src/lib/` — configuración global

| Archivo | Qué hace | Librerías principales | Doc del proyecto |
|---|---|---|---|
| `supabase.ts` | Cliente único de Supabase + listener de `AppState` | `@supabase/supabase-js ^2.112.2`, `expo-sqlite ~16.0.10`, `react-native` (`AppState`) | [§6.1](06-carpeta-lib.md#61-supabasets--el-cliente) |
| `sync.ts` | `syncedTable`: motor de sincronización compartido | `@legendapp/state ^3.0.0-beta.48` (`/sync`, `/sync-plugins/supabase`, `/persist-plugins/expo-sqlite`) | [§6.2](06-carpeta-lib.md#62-syncts--el-motor-de-sincronización) |
| `limpiar-cache.ts` | ⚠️ Temporal: borra el caché al arrancar | `expo-sqlite ~16.0.10` | [§6.3](06-carpeta-lib.md#63-limpiar-cachets--utilidad-temporal) |
| `LIB.md` | Notas originales | — | *reemplazado por [06](06-carpeta-lib.md)* |

---

## 10.6 `src/state/` — datos sincronizados

| Archivo | Observable(s) | Tabla | `actions` | Notas |
|---|---|---|---|---|
| `auth.ts` | `auth$` | *(ninguna)* | — | Sesión. `observable()` puro + `getAllSyncStates()` |
| `usuario.ts` | `perfil$` | `perfiles` | `read`, `update` | **Único con `as: 'value'`** |
| `articulos.ts` | `articulo$` | `articulos` | `read` | Helpers: `porCategoria`, `porId` |
| `condicion.ts` | `condicion$` | `condiciones` | `read`, `create`, `update` | Helper: `porId` |
| `alergia.ts` | `alergia$` | `alergias` | `read`, `create`, `update` | Helper: `porId` |
| `contactosemergencia.ts` | `contactoEmergencia$` | `contactosemergencia` | `read`, `create`, `update` | Helper: `porId` |
| `medicacion.ts` | `medicamento$`, `toma$` | `medicamentos`, `tomas` | `read`, `create`, `update` | Helpers de fecha y agrupación |
| `medicion.ts` | `tipoMedicion$`, `medicion$` | `tipomedicion`, `mediciones` | `read` / `read,create,update` | `esDoble()` decide el componente |
| `helpers.ts` | — | — | — | `porId<T>`, `comoLista<T>` |
| `STATES.md` | — | — | — | *reemplazado por [05](05-carpeta-state-legend-state.md)* |

**Librerías en toda la carpeta:** `@legendapp/state ^3.0.0-beta.48`
(https://legendapp.com/open-source/state/v3/sync/supabase/).
`auth.ts` además usa `@supabase/supabase-js ^2.112.2` y `expo-sqlite ~16.0.10`.

Detalle en [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#56-archivo-por-archivo).

---

## 10.7 `src/app/` — pantallas y navegación

**Librerías en toda la carpeta:** `expo-router ~6.0.24`, `@legendapp/state/react`,
`nativewind ^4.2.6`, `react-native-safe-area-context ~5.6.0`.

### Raíz y autenticación

| Archivo | Ruta | Qué hace | Librerías adicionales |
|---|---|---|---|
| `_layout.tsx` | — | Sesión, `Stack.Protected`, `ErrorBoundary`, `SafeAreaProvider`, `global.css` | — |
| `(auth)/_layout.tsx` | — | Stack de autenticación | — |
| `(auth)/login.tsx` | `/login` | Inicio de sesión | `@supabase/supabase-js`, `react-hook-form`, `zod` |
| `(auth)/registro.tsx` | `/registro` | Registro en 3 pasos | `@supabase/supabase-js`, `react-hook-form ^7.84.0`, `@hookform/resolvers ^5.7.1`, `zod ^4.4.3` |

### Pestañas

| Archivo | Ruta | Qué hace | Librerías adicionales |
|---|---|---|---|
| `(tabs)/_layout.tsx` | — | `NativeTabs` con íconos por plataforma | `expo-router/unstable-native-tabs`, `@expo/vector-icons ^15.0.3` |
| `(tabs)/index.tsx` | `/` | Inicio | — |
| `(tabs)/cita.tsx` | `/cita` | Citas (en desarrollo) | — |

### Medicación

| Archivo | Ruta | Qué hace | Librerías adicionales |
|---|---|---|---|
| `(tabs)/medicacion/_layout.tsx` | — | Stack sin animación | — |
| `(tabs)/medicacion/index.tsx` | `/medicacion` | Tomas del día, progreso, lista de medicamentos | — |
| `(tabs)/medicacion/agregar-medicamento.tsx` | `/medicacion/agregar-medicamento` | Formulario con `useFieldArray` | `react-hook-form`, `@hookform/resolvers`, `zod`, `expo-crypto ~15.0.9` |
| `(tabs)/medicacion/historial.tsx` | `/medicacion/historial` | Historial de tomas | — |

### Mediciones

| Archivo | Ruta | Qué hace |
|---|---|---|
| `(tabs)/medicion/_layout.tsx` | — | Stack |
| `(tabs)/medicion/index.tsx` | `/medicion` | Lista de tipos de medición |
| `(tabs)/medicion/historial.tsx` | `/medicion/historial` | Historial general |
| `(tabs)/medicion/[medicionTipo]/_layout.tsx` | — | Stack del tipo |
| `(tabs)/medicion/[medicionTipo]/index.tsx` | `/medicion/<tipo>` | Registro de una medición |
| `(tabs)/medicion/[medicionTipo]/[resultadoMedicion].tsx` | `/medicion/<tipo>/<id>` | Detalle de un registro |

Rutas dinámicas: usan `useLocalSearchParams`. Ver [§4.8](04-carpeta-app-expo-router.md#48-rutas-dinámicas).

### Expediente

| Archivo | Ruta | Qué hace |
|---|---|---|
| `(tabs)/expediente/_layout.tsx` | — | Stack |
| `(tabs)/expediente/index.tsx` | `/expediente` | Resumen del expediente |
| `(tabs)/expediente/perfil.tsx` | `/expediente/perfil` | Editar perfil |
| `(tabs)/expediente/diagnosticos/index.tsx` | `/expediente/diagnosticos` | Condiciones y alergias |
| `(tabs)/expediente/diagnosticos/agregar-condicion.tsx` | — | Formulario de condición |
| `(tabs)/expediente/diagnosticos/agregar-alergia.tsx` | — | Formulario de alergia |
| `(tabs)/expediente/diagnosticos/[condicionId].tsx` | `/expediente/diagnosticos/<id>` | Detalle y edición |
| `(tabs)/expediente/contactos-emergencia/index.tsx` | `/expediente/contactos-emergencia` | Lista de contactos |
| `(tabs)/expediente/contactos-emergencia/agregar-contacto.tsx` | — | Formulario de contacto |
| `(tabs)/expediente/contactos-emergencia/[contactoId].tsx` | — | Detalle y edición |

Los formularios usan `react-hook-form ^7.84.0` + `zod ^4.4.3` + `expo-crypto ~15.0.9`.

### Artículos

| Archivo | Ruta | Qué hace |
|---|---|---|
| `(articulos)/_layout.tsx` | — | Stack fuera de las pestañas |
| `(articulos)/articulos.tsx` | `/articulos` | Índice de la wiki |
| `(articulos)/[categoriaArt]/index.tsx` | `/<categoria>` | Artículos de una categoría |
| `(articulos)/[categoriaArt]/[articuloId].tsx` | `/<categoria>/<id>` | Artículo completo |

---

## 10.8 `src/features/` — componentes, esquemas y lógica

### `topbar/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `TopBar.tsx` | Componente | Encabezado con título y flecha opcional | `expo-router` (`router.back()`), `nativewind` |

### `auth/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `registro-schema.ts` | Esquema | Validación del registro, con `.refine()` cruzado | `zod ^4.4.3` |
| `pasos.ts` | Lógica | Define los 3 pasos con `Path<RegistroForm>[]` | `react-hook-form ^7.84.0` (tipos) |
| `CampoTexto.tsx` | Componente | Campo de texto genérico. **Usado en toda la app** | `react-hook-form ^7.84.0` (`useController`) |
| `CampoFecha.tsx` | Componente | Selector de fecha | `react-native-modal-datetime-picker ^18.0.0`, `@react-native-community/datetimepicker 8.4.4`, `react-hook-form` |

### `medicacion/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `medicacion-schema.ts` | Esquema | `medicamentoSchema`, `horarioFormSchema`, catálogos, `dosisANumero` | `zod ^4.4.3` |
| `CampoHorario.tsx` | Componente | Hora + días de la semana, con conversiones y manejo por plataforma | `react-hook-form`, `react-native-modal-datetime-picker ^18.0.0` |
| `generar-tomas.ts` | Lógica | 🔴 Genera las tomas faltantes. **Contiene el bug abierto** | `@legendapp/state ^3.0.0-beta.48`, `expo-crypto ~15.0.9` |
| `acciones.ts` | Lógica | `marcarTomada`, `marcarOmitida`, `posponer`, `revertir`, `marcarTodasTomadas` | `@legendapp/state` (`assign`, `batch`) |
| `estados.ts` | Lógica | `etiquetaEstado`, `colorEstado` con `Record<EstadoToma, string>` | — |
| `TomasDelDia.tsx` | Componente | Tarjeta de un grupo de tomas y sus acciones | `nativewind`, `react-native-modal ^14.0.0-rc.1` |
| `MedicinasLista.tsx` | Componente | Fila de un medicamento | `nativewind` |

### `medicion/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `medicion-schema.ts` | Esquema | `medicionSchema`, `medicionDobleSchema`, `valorInicial`, `pasoDe`, `redondear` | `zod ^4.4.3` |
| `CampoMedicion.tsx` | Componente | Captura de un valor | `react-hook-form` |
| `CampoMedicionDoble.tsx` | Componente | Captura de dos valores (presión arterial) | `react-hook-form` |
| `TopBarSecondary.tsx` | Componente | Encabezado alterno | `expo-router`, `nativewind` |

### `perfil/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `perfil-schema.ts` | Esquema | Validación del perfil | `zod ^4.4.3` |
| `emergencia-schema.ts` | Esquema | Validación de contactos | `zod ^4.4.3` |
| `CampoSelect.tsx` | Componente | Dropdown genérico. Adapta `{valor,etiqueta}` a `{name}` | `rn-modal-picker ^0.4.9`, `react-hook-form` |
| `PerfilBox.tsx` | Componente | Tarjeta de datos del perfil | `nativewind` |
| `PerfilSummary.tsx` | Componente | Resumen del perfil | `nativewind` |
| `ContactoEmergenciaBox.tsx` | Componente | Tarjeta de contacto | `nativewind` |

### `articulos/` y `condicion/`

| Archivo | Tipo | Qué hace | Librerías principales |
|---|---|---|---|
| `articulos/CategoriasBox.tsx` | Componente | Tarjeta de categoría | `expo-router`, `nativewind` |
| `articulos/DestacadosBox.tsx` | Componente | Artículos destacados | `expo-router`, `nativewind` |
| `condicion/condiciones-schema.ts` | Esquema | Validación de condiciones | `zod ^4.4.3` |
| `FEATURES.md` | — | Notas originales | *reemplazado por [07](07-carpeta-features.md)* |

---

## 10.9 Búsqueda rápida: "quiero tocar X, ¿qué archivo abro?"

| Quiero... | Archivo |
|---|---|
| Agregar una pestaña | `src/app/(tabs)/_layout.tsx` + carpeta nueva |
| Cambiar quién puede entrar sin sesión | `src/app/_layout.tsx` |
| Agregar una tabla nueva | `db/schema.ts` → migración → `src/state/<tabla>.ts` |
| Cambiar una política RLS | `db/schema.ts` → `npx drizzle-kit generate` |
| Cambiar la validación de un formulario | `src/features/<área>/<área>-schema.ts` |
| Agregar un tipo de campo de formulario | `src/features/<área>/Campo*.tsx` |
| Cambiar cómo se generan las tomas | `src/features/medicacion/generar-tomas.ts` |
| Cambiar qué pasa al marcar una toma | `src/features/medicacion/acciones.ts` |
| Cambiar colores o etiquetas de estado | `src/features/medicacion/estados.ts` |
| Cambiar el comportamiento de la sincronización | `src/lib/sync.ts` |
| Cambiar opciones de sesión | `src/lib/supabase.ts` |
| Cambiar qué se borra al cerrar sesión | `src/state/auth.ts` |
| Cambiar el encabezado de las pantallas | `src/features/topbar/TopBar.tsx` |
| Agregar una carpeta con estilos | `tailwind.config.js` (`content`) |

---

## Anexo: correcciones a la documentación anterior

Los archivos `DOCUMENTACION.md`, `db/SCHEMA.md`, `src/lib/LIB.md`, `src/state/STATES.md` y
`src/features/FEATURES.md` siguen en el repositorio. Estas son sus imprecisiones frente al
código actual:

| Documento | Dice | En realidad |
|---|---|---|
| `DOCUMENTACION.md` §7 | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Es **`EXPO_PUBLIC_SUPABASE_KEY`** (`src/lib/supabase.ts`) |
| `DOCUMENTACION.md` §6.6 | La versión de `@legendapp/state` está fija sin `^` | Está declarada como **`^3.0.0-beta.48`**. La mitigación no está aplicada |
| `DOCUMENTACION.md` §2 | Incluye `drizzle-zod` en el stack | **No está instalado.** No aparece en `package.json` |
| `DOCUMENTACION.md` §1.2 | "Las pantallas son placeholders" | Desactualizado: auth, perfil, expediente, artículos y medicación funcionan |
| `DOCUMENTACION.md` §1.1 | Rutas como `(tabs)/medicacion.tsx` | Ahora son carpetas con `_layout.tsx` e `index.tsx` |
| `DOCUMENTACION.md` §8.1 | Solo `main`, `develop` y `feature/` | También se usa el prefijo **`hotfix/`** |
| `DOCUMENTACION.md` §6.3 | Ejemplo de `sync.ts` sin `onError` | El archivo real tiene `onError`, y **le falta llamar a `revert()`** |
| `STATES.md` | "En `auth.ts` está la configuración general de Legend State" | La configuración está en **`src/lib/sync.ts`**. `auth.ts` maneja la sesión |
| `FEATURES.md` | Propone separar esquemas y componentes en carpetas | No se hizo; se agrupa por área |
| `SCHEMA.md` | Lista `.generatedAlwaysAsIdentity()` entre los tipos usados | El proyecto usa **UUID en todas las tablas**, por local-first |

**Recomendación:** borrar esos cinco archivos y dejar `docs/` como única fuente, o reemplazar su
contenido por un enlace a la sección correspondiente. Mantener dos versiones de la misma
información garantiza que una de las dos esté mal.
