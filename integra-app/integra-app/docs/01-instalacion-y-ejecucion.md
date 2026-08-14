# 1. Instalación y ejecución

> Guía completa para dejar el proyecto corriendo desde cero: requisitos, instalación,
> variables de entorno, comandos, versiones exactas de cada librería y flujo de trabajo con Git.

---

## 1.1 Requisitos previos

| Herramienta | Versión mínima | Cómo verificar | Notas |
|---|---|---|---|
| **Node.js** | 20 LTS o superior | `node --version` | Probado en v24.16.0 |
| **npm** | 10 o superior | `npm --version` | Viene con Node |
| **Git** | 2.40+ | `git --version` | |
| **Expo Go** | SDK 54 | App Store / Play Store | En el teléfono físico |
| **Android Studio** | *opcional* | | Solo si querés emulador Android |
| **Xcode** | *opcional*, solo macOS | | Solo si querés simulador iOS |

**No se necesita Docker.** Tampoco hace falta un *development build*: todo el stack corre
dentro de **Expo Go**.

> ⚠️ **La versión de Expo Go debe coincidir con el SDK del proyecto.** Este proyecto usa
> **SDK 54**. Si tu Expo Go es de otro SDK, la app carga y se cierra sola sin mensaje claro.
> Actualizá Expo Go desde la tienda antes de reportar un bug.

---

## 1.2 Clonar e instalar

```bash
git clone https://github.com/mrstevengz/Integra.git
```

Ahora la parte que confunde a todo el mundo: **la app está anidada dos niveles**. Los comandos
de `npm` y `expo` se corren desde `Integra/integra-app/integra-app`, no desde la raíz del
repositorio.

```bash
cd Integra/integra-app/integra-app
```

Verificá que estás en el lugar correcto — tiene que existir `package.json`:

```bash
ls package.json app.json src
```

Instalá las dependencias:

```bash
npm install
```

> **Por qué `npm install` y no `npm ci`:** el `package.json` define un bloque `overrides`
> (§1.7) que fuerza a `@legendapp/state` a usar la misma versión de `expo-sqlite` que la app.
> `npm ci` respeta el `package-lock.json`, así que también funciona, pero si el lock se
> desincroniza vas a ver errores raros de módulos nativos duplicados.

---

## 1.3 Variables de entorno

Creá el archivo **`.env.local`** en la raíz de la app (junto a `package.json`):

```bash
# ─── Cliente: se incrusta en el bundle de JavaScript — PÚBLICO ──────────
EXPO_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<ANON_KEY>

# ─── Solo herramientas locales: NUNCA se incrusta en el bundle ──────────
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres
```

> 🔴 **El nombre exacto es `EXPO_PUBLIC_SUPABASE_KEY`**, no `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
> Así lo lee [`src/lib/supabase.ts`](../src/lib/supabase.ts). Si usás el otro nombre, el cliente
> arranca con `undefined` y todas las peticiones fallan con un error de token inválido.
> (El archivo `DOCUMENTACION.md` de la raíz tiene el nombre viejo — está equivocado.)

### De dónde sale cada valor

| Variable | Ubicación en el dashboard de Supabase |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Project Settings → API → **Project URL** |
| `EXPO_PUBLIC_SUPABASE_KEY` | Project Settings → API → **`anon` / publishable key** |
| `DATABASE_URL` | Botón **Connect** → **Session pooler** (puerto **5432**) |

En `DATABASE_URL`, reemplazá el marcador `[YOUR-PASSWORD]` por la contraseña real y
**codificala en URL** si tiene caracteres especiales (`@` → `%40`, `#` → `%23`, `/` → `%2F`).

### Qué va al bundle y qué no

| Variable | ¿Se incrusta en el APK? | Motivo |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Sí | La app necesita saber a dónde conectarse |
| `EXPO_PUBLIC_SUPABASE_KEY` | ✅ Sí | Está diseñada para ser pública. **RLS es la protección real** |
| `DATABASE_URL` | ❌ No | Contiene la contraseña de Postgres. Solo la lee `drizzle-kit` en tu laptop |

`EXPO_PUBLIC_` es un prefijo con significado literal: Expo **copia esos valores dentro del
JavaScript** de la app. Cualquiera que descargue el APK puede leerlos en un minuto.

> 🔴 **Nunca pongas la llave `service_role` / `sb_secret_...` en una variable `EXPO_PUBLIC_`.**
> Esa llave ignora todas las políticas de RLS. Filtrarla equivale a publicar la base de datos entera.

### `.gitignore`

El `.gitignore` actual ignora `.env*.local` pero **no** un archivo `.env` a secas. Por eso el
archivo se llama `.env.local`: queda protegido sin tocar nada más. Si algún día creás un `.env`,
**agregalo al `.gitignore` antes de escribir nada adentro** — los secretos en Git son
permanentes en el historial aunque después borres el archivo.

`drizzle.config.ts` lee `.env.local` explícitamente, porque `drizzle-kit` solo busca `.env`
por defecto:

```ts
import { config } from 'dotenv'
config({ path: '.env.local' })
```

---

## 1.4 Arrancar la app

```bash
npx expo start
```

Se abre el *dev server* con un código QR y un menú de atajos:

| Tecla | Acción |
|---|---|
| `a` | Abrir en emulador **A**ndroid |
| `i` | Abrir en simulador **i**OS (solo macOS) |
| `w` | Abrir en navegador **w**eb |
| `r` | **R**ecargar la app |
| `j` | Abrir el depurador (**J**avaScript debugger) |
| `m` | Alternar el menú de desarrollo |
| `?` | Ver todos los comandos |
| `Ctrl+C` | Detener el servidor |

En un **teléfono físico**: escaneá el QR con la cámara (iOS) o desde la app **Expo Go** (Android).
El teléfono y la laptop tienen que estar en la **misma red Wi-Fi**.

Si la red del lugar bloquea las conexiones entre dispositivos (redes de universidad, hoteles,
oficinas), usá modo túnel:

```bash
npx expo start --tunnel
```

Es más lento pero funciona a través de internet.

### Scripts disponibles

Los definidos en `package.json`:

```bash
npm start        # equivale a: expo start
npm run android  # equivale a: expo start --android
npm run ios      # equivale a: expo start --ios
npm run web      # equivale a: expo start --web
```

### Limpiar la caché cuando algo no cuadra

Es el primer remedio para el 80 % de los errores raros de Metro y NativeWind:

```bash
npx expo start --clear
```

Si eso no basta, la versión nuclear:

```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```

En PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, .expo; npm install; npx expo start --clear
```

### Verificar que las dependencias son compatibles con el SDK

```bash
npx expo install --check
```

Compara cada dependencia contra las versiones que Expo SDK 54 espera y te dice cuáles están
fuera de rango. Para instalar una librería nueva usá **siempre**:

```bash
npx expo install <paquete>
```

en vez de `npm install <paquete>`. `expo install` elige la versión compatible con el SDK;
`npm install` toma la última publicada, que muy probablemente no lo sea.

---

## 1.5 Comandos de base de datos (Drizzle)

Estos comandos corren contra Supabase usando `DATABASE_URL`. Solo se usan cuando cambiás
`db/schema.ts`.

```bash
npx drizzle-kit generate           # genera el .sql a partir de db/schema.ts
npx drizzle-kit generate --custom  # genera un .sql vacío para escribir SQL a mano (triggers, funciones)
npx drizzle-kit migrate            # aplica las migraciones pendientes a la base de datos
```

**Usá siempre `generate` + `migrate`, nunca `push`.** `push` compara el esquema contra la base
de datos y aplica los cambios sin dejar un archivo revisable. Es aceptable en un prototipo
desechable y un riesgo serio en cuanto existen datos reales.

**Leé el `.sql` generado antes de aplicarlo.** Es tu última oportunidad de detectar un `DROP`
que no pediste.

Ver [08-carpeta-db-drizzle.md](08-carpeta-db-drizzle.md) para el detalle completo.

---

## 1.6 Versiones de todas las librerías

Extraído de [`package.json`](../package.json). Los rangos son literales: `~` permite parches,
`^` permite versiones menores.

### Framework y runtime

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `expo` | `~54.0.35` | Framework y herramientas | https://docs.expo.dev/versions/v54.0.0/ |
| `react` | `19.1.0` | Librería de componentes | https://react.dev/reference/react |
| `react-dom` | `^19.1.0` | Render en web | https://react.dev/reference/react-dom |
| `react-native` | `0.81.5` | Runtime nativo (New Architecture activada) | https://reactnative.dev/docs/getting-started |
| `babel-preset-expo` | `~54.0.10` | Preset de Babel de Expo | https://docs.expo.dev/versions/v54.0.0/config/babel/ |
| `typescript` | `~5.9.2` | Tipado estático | https://www.typescriptlang.org/docs/ |
| `@types/react` | `~19.1.0` | Tipos de React | — |

### Navegación

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `expo-router` | `~6.0.24` | Navegación basada en archivos | https://docs.expo.dev/router/introduction/ |
| `react-native-screens` | `~4.16.0` | Pantallas nativas (requerido por router) | https://docs.swmansion.com/react-native-screens/ |
| `react-native-safe-area-context` | `~5.6.0` | Márgenes de notch y barra de estado | https://appandflow.github.io/react-native-safe-area-context/ |
| `expo-linking` | `~8.0.12` | Deep links | https://docs.expo.dev/versions/v54.0.0/sdk/linking/ |

### Estado, datos y sincronización

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `@legendapp/state` | `^3.0.0-beta.48` | Estado reactivo + sincronización offline | https://legendapp.com/open-source/state/v3/ |
| `@supabase/supabase-js` | `^2.112.2` | Cliente de Supabase (auth + REST + realtime) | https://supabase.com/docs/reference/javascript/introduction |
| `expo-sqlite` | `~16.0.10` | SQLite local (persistencia de Legend-State) | https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/ |
| `expo-crypto` | `~15.0.9` | `randomUUID()` para generar IDs en el dispositivo | https://docs.expo.dev/versions/v54.0.0/sdk/crypto/ |

### Base de datos (solo desarrollo)

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `drizzle-orm` | `^0.45.2` | Definición del esquema en TypeScript | https://orm.drizzle.team/docs/overview |
| `drizzle-kit` | `^0.31.10` | Generador y ejecutor de migraciones | https://orm.drizzle.team/docs/kit-overview |
| `pg` | `^8.22.0` | Driver de Postgres que usa drizzle-kit | https://node-postgres.com/ |
| `dotenv` | `^17.4.2` | Carga `.env.local` en `drizzle.config.ts` | https://github.com/motdotla/dotenv |

### Formularios y validación

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `zod` | `^4.4.3` | Esquemas de validación | https://zod.dev/ |
| `react-hook-form` | `^7.84.0` | Manejo de formularios | https://react-hook-form.com/docs |
| `@hookform/resolvers` | `^5.7.1` | Puente entre Zod y React Hook Form | https://github.com/react-hook-form/resolvers |

### Estilos e íconos

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `nativewind` | `^4.2.6` | Tailwind para React Native (`className`) | https://www.nativewind.dev/ |
| `tailwindcss` | `^3.4.17` | Motor de utilidades CSS | https://v3.tailwindcss.com/docs |
| `@expo/vector-icons` | `^15.0.3` | Set de íconos (Ionicons, etc.) | https://docs.expo.dev/guides/icons/ |
| `lucide-react-native` | `^1.31.0` | Íconos de Lucide | https://lucide.dev/guide/packages/lucide-react-native |
| `expo-status-bar` | `~3.0.9` | Control de la barra de estado | https://docs.expo.dev/versions/v54.0.0/sdk/status-bar/ |

### Componentes de interfaz

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `@react-native-community/datetimepicker` | `8.4.4` | Selector nativo de fecha y hora | https://github.com/react-native-datetimepicker/datetimepicker |
| `react-native-modal-datetime-picker` | `^18.0.0` | Envoltorio modal del anterior | https://github.com/mmazzarolo/react-native-modal-datetime-picker |
| `react-native-modal` | `^14.0.0-rc.1` | Modales mejorados | https://github.com/react-native-modal/react-native-modal |
| `@react-native-picker/picker` | `2.11.1` | Selector nativo | https://github.com/react-native-picker/picker |
| `rn-modal-picker` | `^0.4.9` | Dropdown con buscador (usado en `CampoSelect`) | https://www.npmjs.com/package/rn-modal-picker |
| `react-native-gesture-handler` | `~2.28.0` | Gestos táctiles | https://docs.swmansion.com/react-native-gesture-handler/ |
| `react-native-reanimated` | `~4.1.1` | Animaciones | https://docs.swmansion.com/react-native-reanimated/ |
| `react-native-worklets` | `^0.5.1` | Motor de worklets que usa Reanimated 4 | https://docs.swmansion.com/react-native-worklets/ |

### Otros

| Paquete | Versión | Qué hace | Documentación |
|---|---|---|---|
| `expo-constants` | `~18.0.13` | Acceso a la configuración de `app.json` | https://docs.expo.dev/versions/v54.0.0/sdk/constants/ |

---

## 1.7 Notas sobre versiones que hay que conocer

### Legend-State está en beta

`@legendapp/state` está en `3.0.0-beta.48`. La última versión **estable** es la 2.1.15, pero
**el plugin de Supabase solo existe en v3**, así que no hay alternativa.

> ⚠️ **El rango está declarado como `^3.0.0-beta.48`, no fijo.**
> Durante la beta, esta librería ya renombró hooks públicos (`use$` → `useSelector` → `useValue`).
> Un `npm install` futuro podría traer una beta más nueva y romper la app en silencio.
> **Recomendación pendiente de aplicar:** quitar el `^` y dejar la versión exacta:
> ```json
> "@legendapp/state": "3.0.0-beta.48"
> ```
> (El archivo `DOCUMENTACION.md` de la raíz afirma que ya está fija. No lo está.)

Mitigación que **sí** está aplicada: toda la configuración de sincronización vive en
`src/lib/sync.ts` y `src/state/*`, así que una migración futura queda acotada a esos archivos.

### El bloque `overrides`

```json
"overrides": {
  "@legendapp/state": {
    "expo-sqlite": "$expo-sqlite"
  }
}
```

Obliga a `@legendapp/state` a usar **la misma copia de `expo-sqlite`** que la app. Sin esto,
npm puede instalar dos versiones distintas del módulo nativo y la persistencia falla en tiempo
de ejecución con errores que no apuntan a la causa real.

### Versiones con `~` contra `^`

Las librerías de Expo llevan `~` (solo parches) porque tienen que coincidir con el SDK.
Las demás llevan `^` (permiten menores). Al actualizar, corré `npx expo install --check`
antes de dar por bueno el cambio.

---

## 1.8 Configuración del proyecto, archivo por archivo

### `app.json` — configuración de Expo

```json
{
  "expo": {
    "newArchEnabled": true,
    "scheme": "integra-app",
    "plugins": [
      ["expo-router", { "root": "src/app" }],
      "expo-sqlite",
      "@react-native-community/datetimepicker"
    ]
  }
}
```

- **`newArchEnabled: true`** — New Architecture de React Native. Una librería sin soporte
  simplemente no funciona; es lo primero que hay que revisar al agregar dependencias nativas.
- **`plugins → expo-router → root: "src/app"`** — por defecto expo-router busca las rutas en
  `app/` en la raíz. Esta línea es lo único que hace que funcionen dentro de `src/`.
- **`scheme`** — necesario para deep links y para el flujo de OAuth de Supabase.

### `tsconfig.json` — alias de importación

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`strict: true` obliga a manejar `null` y `undefined` explícitamente. Por eso vas a ver mucho
`perfil?.id` y `?? ''` en el código: no es paranoia, es el compilador.

### `babel.config.js` — JSX de NativeWind

```js
presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]]
```

`jsxImportSource: "nativewind"` es lo que hace que la prop `className` exista en los
componentes de React Native. Sin esta línea, `className` se ignora silenciosamente y **no hay
ningún error** — solo una pantalla sin estilos.

### `metro.config.js` — bundler

```js
module.exports = withNativeWind(config, { input: "./global.css" });
```

Le dice a Metro que procese `global.css` (donde están las directivas `@tailwind`) y genere las
clases.

### `tailwind.config.js` — qué archivos se escanean

```js
content: [
  "./src/app/**/*.{js,jsx,ts,tsx}",
  "./src/components/**/*.{js,jsx,ts,tsx}",
  "./src/features/**/*.{js,jsx,ts,tsx}",
]
```

> ⚠️ **Trampa clásica:** si creás un componente fuera de estas rutas, Tailwind no ve sus clases
> y no las genera. El componente se renderiza sin estilos y no hay mensaje de error.
> (`./src/components/` está listado pero esa carpeta todavía no existe — no molesta.)

### `drizzle.config.ts` — tres líneas que evitan desastres

```ts
schemaFilter: ['public'],                       // no tocar auth/storage/realtime
entities: { roles: { provider: 'supabase' } },  // no gestionar los roles de Supabase
casing: 'snake_case',                           // createdAt en TS → created_at en Postgres
```

Ver [08-carpeta-db-drizzle.md](08-carpeta-db-drizzle.md#83-configuración-crítica) para el porqué de cada una.

---

## 1.9 Flujo de trabajo con Git

### Ramas existentes

```
main                        ← código estable
develop                     ← integración
feature/supabase_setup      ← histórica (mergeada)
feature/zod-implementation  ← histórica (mergeada)
feature/perfil-revamp       ← histórica (mergeada)
feature/medicamento-mvp     ← histórica (mergeada)
hotfix/sync-error           ← histórica (mergeada)
feature/medicion-cita-mvp   ← rama de trabajo actual
```

### Convención de nombres

| Prefijo | Para qué | Ejemplo |
|---|---|---|
| `feature/` | Funcionalidad nueva | `feature/medicion-cita-mvp` |
| `hotfix/` | Corrección urgente | `hotfix/sync-error` |
| `fix/` | Corrección normal | `fix/validacion-cedula` |
| `chore/` | Configuración o dependencias | `chore/actualizar-expo` |
| `docs/` | Documentación | `docs/carpeta-docs` |

El repositorio tiene los dos estilos de separador (`feature/supabase_setup` con guion bajo,
`feature/medicamento-mvp` con guion). **Para ramas nuevas usá guion medio** (`kebab-case`),
que es lo más reciente y lo más común.

### Ciclo completo

**1. Partir de una base actualizada**

```bash
git checkout develop
git pull origin develop
```

Saltarse este paso es la causa más frecuente de conflictos de merge.

**2. Crear la rama**

```bash
git checkout -b feature/notificaciones-tomas
```

**3. Trabajar y hacer commits**

```bash
git add .
git commit -m "feat: agregar recordatorios locales para las tomas del dia"
```

Commits pequeños y frecuentes. Un commit debe hacer **una** cosa.

**4. Subir la rama**

```bash
git push -u origin feature/notificaciones-tomas
```

El `-u` solo se necesita la primera vez; después basta `git push`.

**5. Sincronizar antes de abrir el PR**

```bash
git fetch origin
git merge origin/develop
```

Si hay conflictos, resolvelos **aquí, en tu rama** — no en el PR. Luego `git push`.

**6. Abrir el Pull Request en GitHub**

`feature/notificaciones-tomas` → **`develop`**.

**7. Limpiar después del merge**

```bash
git checkout develop
git pull origin develop
git branch -d feature/notificaciones-tomas
```

### Convención de mensajes de commit

```
feat:     nueva funcionalidad
fix:      corrección de bug
chore:    configuración, dependencias, mantenimiento
docs:     documentación
refactor: cambio interno sin alterar el comportamiento
style:    formato, sin cambios de lógica
```

Ejemplos reales del repositorio:

```
feat: Se agrego la funcionalidad de medicion y se empezo a trabajar en la funcionalidad de cita
fix: Se arreglo un error de sincronizacion entre el usuario cuando usa dos dispositivos a la vez
chore: Se eliminaron archivos restantes de setup pasado
docs: Se agrego un archivo de documentacion guia para IA y dev
```

### Checklist antes de abrir un PR

- [ ] La rama sale de `develop` actualizado y el PR apunta a `develop`
- [ ] **No hay archivos `.env*` en el diff** — verificalo con `git status` y `git diff --stat`
- [ ] Si tocaste `db/schema.ts`, la migración generada está incluida en el commit
- [ ] **Leíste el `.sql` generado** y no contiene `DROP` inesperados
- [ ] Toda tabla nueva tiene `.enableRLS()` y sus políticas
- [ ] Probaste que las **denegaciones** funcionan, no solo las lecturas
- [ ] La app arranca sin errores con `npx expo start --clear`
- [ ] Si tocaste sincronización, probaste en **modo avión** y con **dos dispositivos**

---

## 1.10 Verificar que la instalación quedó bien

Corré esta secuencia. Si los cinco pasos pasan, el entorno está listo.

**1. La app abre**

```bash
npx expo start --clear
```

Abrí en Expo Go. Deberías ver la pantalla de login.

**2. El registro y el login funcionan**

Creá una cuenta. Si ves un error de token o de red, revisá `EXPO_PUBLIC_SUPABASE_KEY` (§1.3).

**3. Los datos cargan**

Entrá a **Expediente** y a **Medicación**. Deberían aparecer los artículos de la wiki.
Si las listas están vacías **sin error visible**, probablemente RLS esté bloqueando: revisá las
políticas de la tabla.

**4. Funciona sin conexión** — la prueba real de local-first

1. Abrí la app con conexión y confirmá que se ven los datos.
2. **Cerrá la app por completo. Activá modo avión. Volvé a abrirla.**
3. Los datos deben seguir ahí.

Si la pantalla queda vacía, `persist` no está configurado (revisá `src/lib/sync.ts`).

**5. Las migraciones corren**

```bash
npx drizzle-kit generate
```

Debe responder que no hay cambios (`No schema changes, nothing to migrate`). Si intenta generar
una migración sin que hayas tocado `db/schema.ts`, tu esquema local y la base de datos no
coinciden — no apliques nada y preguntá antes.

---

## 1.11 Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `use$ is not exported` | El hook se renombró en la beta | Usá `useValue` |
| La app se cierra sola al abrir en Expo Go | Expo Go de otro SDK | Actualizá Expo Go a SDK 54 |
| Pantalla en blanco, sin estilos | Falta `jsxImportSource: "nativewind"` o la ruta no está en `tailwind.config.js` | Revisá `babel.config.js` y `content` |
| Los estilos de un componente nuevo no aplican | La carpeta no está en `content` de Tailwind | Agregá la ruta y reiniciá con `--clear` |
| Error de token inválido en todas las peticiones | Nombre de variable equivocado | Debe ser `EXPO_PUBLIC_SUPABASE_KEY` |
| Las variables de entorno no se leen | Se editó `.env.local` con el server corriendo | Reiniciá `npx expo start --clear` |
| Las consultas devuelven `[]` sin error | RLS bloquea: falta política de `SELECT` | Revisá las políticas de la tabla |
| Cualquiera puede borrar filas | RLS desactivado | `.enableRLS()` + migrar |
| La app queda en blanco sin conexión | `persist` mal configurado | Revisá `observablePersistSqlite` en `src/lib/sync.ts` |
| `Object.values(undefined)` | Falta el valor inicial | Agregá `initial: {}` al `syncedTable` |
| La migración falla con errores raros de DDL | Estás usando el Transaction pooler (6543) | Usá **Session pooler**, puerto **5432** |
| `drizzle-kit migrate` no encuentra driver | Falta el driver de Postgres | `npm i -D pg` |
| La primera migración intenta `DROP ROLE anon` | Falta configuración | Agregá `entities: { roles: { provider: 'supabase' } }` |
| drizzle-kit quiere borrar tablas que no creaste | Falta `schemaFilter` | Agregá `schemaFilter: ['public']` |
| Errores de módulo nativo duplicado | `expo-sqlite` duplicado | Verificá el bloque `overrides` y reinstalá |
| `duplicate key ... tomas_medicamento_programada_unq` | **Bug conocido y abierto** | Ver [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única) |

---

## 1.12 Consideraciones sobre datos de salud

Integra maneja medicamentos, mediciones clínicas y expedientes. Al ser local-first, **esos
datos quedan sin cifrar en un archivo SQLite dentro del teléfono**.

Lo que ya está resuelto: [`src/state/auth.ts`](../src/state/auth.ts) borra toda la caché local
al cerrar sesión (`syncState$.reset()` sobre cada tabla + `Storage.clear()`). Sin eso, la
siguiente persona que iniciara sesión en ese dispositivo cargaría los datos del usuario anterior.

Lo que queda pendiente si la app llega a manejar pacientes distintos al propio usuario:

- Supabase solo es apto para HIPAA en planes de pago con un BAA firmado.
- Convendría cifrar el almacenamiento local (SQLCipher mediante un config plugin), lo cual
  **sí requiere un development build** — ya no bastaría Expo Go.

No bloquea el desarrollo, pero es mucho más barato decidirlo ahora que cuando el esquema esté
lleno de datos reales.
