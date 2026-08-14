# 4. Carpeta `src/app/` — Expo Router

> Navegación basada en archivos: la estructura de carpetas **es** el mapa de rutas.

| Librería | Versión | Documentación |
|---|---|---|
| `expo-router` | `~6.0.24` | https://docs.expo.dev/router/introduction/ |
| `expo-router/unstable-native-tabs` | (incluido) | https://docs.expo.dev/router/advanced/native-tabs/ |
| `react-native-screens` | `~4.16.0` | https://docs.swmansion.com/react-native-screens/ |
| `react-native-safe-area-context` | `~5.6.0` | https://appandflow.github.io/react-native-safe-area-context/ |

---

## 4.1 La idea central

No hay un archivo de rutas. **Cada archivo dentro de `src/app/` es una pantalla**, y su ruta
sale de su ubicación.

```
src/app/(tabs)/medicacion/historial.tsx   →   /medicacion/historial
```

En `app.json` está la única línea que hace que funcione dentro de `src/`:

```json
["expo-router", { "root": "src/app" }]
```

Sin ella, expo-router buscaría en `app/` en la raíz del proyecto.

---

## 4.2 Convenciones de nombres de archivo

| Patrón | Qué significa | Ejemplo |
|---|---|---|
| `nombre.tsx` | Una pantalla en `/nombre` | `cita.tsx` → `/cita` |
| `index.tsx` | La pantalla de esa carpeta | `medicacion/index.tsx` → `/medicacion` |
| `_layout.tsx` | Envoltorio compartido. **No es una ruta** | `(tabs)/_layout.tsx` |
| `(carpeta)` | **Grupo**: organiza sin aparecer en la URL | `(tabs)/index.tsx` → `/`, no `/tabs` |
| `[archivo].tsx` | **Ruta dinámica**: el nombre es un parámetro | `[articuloId].tsx` → `/abc-123` |

Los **grupos con paréntesis** son la pieza que más confunde. `(tabs)`, `(auth)` y `(articulos)`
existen para poder darles layouts distintos y para protegerlos por separado, pero
**no aparecen en la URL**.

---

## 4.3 El mapa completo de rutas

```
src/app/
├── _layout.tsx                    ← RAÍZ: sesión y protección de rutas
│
├── (auth)/                        ← sin sesión
│   ├── _layout.tsx
│   ├── login.tsx                  → /login
│   └── registro.tsx               → /registro
│
├── (tabs)/                        ← con sesión: las 5 pestañas
│   ├── _layout.tsx                ← NativeTabs
│   ├── index.tsx                  → /            Inicio
│   ├── cita.tsx                   → /cita        Citas
│   │
│   ├── medicacion/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              → /medicacion
│   │   ├── agregar-medicamento.tsx → /medicacion/agregar-medicamento
│   │   └── historial.tsx          → /medicacion/historial
│   │
│   ├── medicion/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              → /medicion
│   │   ├── historial.tsx          → /medicion/historial
│   │   └── [medicionTipo]/
│   │       ├── _layout.tsx
│   │       ├── index.tsx          → /medicion/glucosa
│   │       └── [resultadoMedicion].tsx → /medicion/glucosa/<id>
│   │
│   └── expediente/
│       ├── _layout.tsx
│       ├── index.tsx              → /expediente
│       ├── perfil.tsx             → /expediente/perfil
│       ├── contactos-emergencia/
│       │   ├── _layout.tsx
│       │   ├── index.tsx          → /expediente/contactos-emergencia
│       │   ├── agregar-contacto.tsx
│       │   └── [contactoId].tsx   → /expediente/contactos-emergencia/<id>
│       └── diagnosticos/
│           ├── _layout.tsx
│           ├── index.tsx          → /expediente/diagnosticos
│           ├── agregar-alergia.tsx
│           ├── agregar-condicion.tsx
│           └── [condicionId].tsx  → /expediente/diagnosticos/<id>
│
└── (articulos)/                   ← wiki, con sesión pero fuera de las pestañas
    ├── _layout.tsx
    ├── articulos.tsx              → /articulos
    └── [categoriaArt]/
        ├── index.tsx              → /<categoria>
        └── [articuloId].tsx       → /<categoria>/<id>
```

`(articulos)` está fuera de `(tabs)` a propósito: la wiki se abre **encima** de las pestañas, en
pantalla completa, en vez de vivir dentro de una.

---

## 4.4 El layout raíz: protección de rutas

[`src/app/_layout.tsx`](../src/app/_layout.tsx) es el archivo más importante de la carpeta.
Hace tres cosas.

### 1. Importa los estilos globales

```tsx
import "../../global.css";
```

Tiene que ser la **primera línea** de la app. Es lo que carga las directivas de Tailwind.

### 2. Decide qué puede ver el usuario

```tsx
export default function RootLayout() {
  const cargando = useValue(auth$.cargando)
  const cerrandoSesion = useValue(auth$.cerrandoSesion)
  const sesion = useValue(auth$.session)

  if (cargando || cerrandoSesion) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Protected guard={!!sesion}>
          <Stack.Screen name="(tabs)"/>
          <Stack.Screen name="(articulos)"/>
        </Stack.Protected>

        <Stack.Protected guard={!sesion}>
          <Stack.Screen name="(auth)"/>
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
```

**`Stack.Protected`** es una API de expo-router 6: si `guard` es `false`, esas rutas
**no existen** para el navegador. No es una redirección — es que la ruta no está registrada.
Ventaja sobre redirigir a mano: no hay parpadeo ni ventana en la que un usuario sin sesión
alcance a ver una pantalla privada.

Los dobles signos: `!!sesion` convierte el objeto (o `null`) a booleano; `!sesion` es su negación.

**El estado `cargando` importa.** Al abrir la app, Supabase tarda unos milisegundos en recuperar
la sesión del almacenamiento. Sin ese `if`, la app renderizaría el login por un instante antes
de saltar al contenido.

**`cerrandoSesion`** bloquea la navegación mientras se borra la caché local, para que ninguna
pantalla renderice con datos a medio limpiar.

**`headerShown: false`** desactiva el encabezado nativo en todas las pantallas — el proyecto usa
su propio componente `TopBar`.

### 3. Captura errores

```tsx
export function ErrorBoundary({error, retry}: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-lg font-semibold mb-2">Algo salio mal</Text>
      <Text className="text-slate-500 text-center mb-6">{error.message}</Text>
      <Pressable onPress={retry} className="bg-black py-3 px-6 rounded-lg">
        <Text className="text-white">Reintentar</Text>
      </Pressable>
    </View>
  )
}
```

Exportar una función llamada `ErrorBoundary` desde un `_layout.tsx` es una convención de
expo-router: si una pantalla hija lanza una excepción durante el render, se muestra esto en vez
de una pantalla en blanco. Se puede poner en cualquier layout, y aplica a su subárbol.

---

## 4.5 Las pestañas nativas

[`src/app/(tabs)/_layout.tsx`](../src/app/(tabs)/_layout.tsx) usa `NativeTabs`, que renderiza
la barra de pestañas **real de cada sistema operativo** en vez de una imitación en JavaScript.

```tsx
import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs'

<NativeTabs labelVisibilityMode="labeled" indicatorColor={...} iconColor={...} labelStyle={...}>
  <NativeTabs.Trigger name="index">
    <Label>Inicio</Label>
    <Icon
      src={Platform.OS === 'android' ? require("../../../assets/icons/home_icon.png") : undefined}
      sf={Platform.OS === 'ios' ? "house" : undefined}/>
  </NativeTabs.Trigger>
  ...
</NativeTabs>
```

**`name` tiene que coincidir con el nombre del archivo o carpeta.** `name="medicacion"` apunta a
`(tabs)/medicacion/`. Si no coincide, la pestaña aparece vacía sin dar error.

**Íconos por plataforma:**

- **iOS** → `sf="house"`, un [SF Symbol](https://developer.apple.com/sf-symbols/) del sistema.
  No hay que incluir ningún archivo.
- **Android** → `src={require('...png')}`, un PNG desde `assets/icons/`.

Los `undefined` cruzados son deliberados: cada plataforma recibe solo la prop que entiende.

> ⚠️ El módulo se llama `unstable-native-tabs`. La API puede cambiar entre versiones de
> expo-router. Es el archivo a revisar primero después de actualizar el SDK.

---

## 4.6 Layouts anidados

Cada sección tiene su propio `_layout.tsx`, casi todos idénticos:

```tsx
// src/app/(tabs)/medicacion/_layout.tsx
import { Stack } from "expo-router";

export default function MedicacionLayout() {
    return <Stack screenOptions={{headerShown: false, animation: 'none'}}/>
}
```

Un `<Stack>` apila pantallas: al navegar, la nueva entra encima y el botón atrás la quita.

**`animation: 'none'`** desactiva la transición. Es una decisión de diseño: dentro de una
pestaña, los cambios se sienten instantáneos.

El `<Stack>` sin hijos declarados registra automáticamente todos los archivos hermanos. Solo
hace falta declarar `<Stack.Screen>` explícitamente si querés opciones distintas para una
pantalla concreta.

---

## 4.7 Navegar entre pantallas

### Imperativamente: el objeto `router`

```tsx
import { router } from 'expo-router'

router.navigate('/medicacion/agregar-medicamento')   // ir a una pantalla
router.push('/medicacion/historial')                 // apilar (permite volver)
router.back()                                        // volver
router.replace('/login')                             // reemplazar (sin poder volver)
```

Ejemplo real, el botón flotante de Medicación:

```tsx
<TouchableOpacity
    onPress={() => router.navigate('/medicacion/agregar-medicamento')}
    accessibilityRole="button"
    className="bg-black absolute bottom-36 right-6 h-16 w-16 rounded-full justify-center align-middle">
        <Text className="text-white text-center font-semibold text-2xl">+</Text>
</TouchableOpacity>
```

`navigate` contra `push`: `navigate` reutiliza la pantalla si ya está en la pila; `push` siempre
agrega una nueva. Para un formulario que se abre y se cierra, `navigate` evita acumular copias.

### Declarativamente: `<Link>`

```tsx
import { Link } from 'expo-router'

<Link href="/expediente/perfil">Ver perfil</Link>
```

### Volver atrás: `TopBar`

El componente [`src/features/topbar/TopBar.tsx`](../src/features/topbar/TopBar.tsx) encapsula
el patrón:

```tsx
type TopBarProps = {
    name: string
    canGoBack: boolean
}

export default function TopBar({ name, canGoBack }: TopBarProps) {
    return (
        <View className="relative flex-row items-center justify-center py-4 px-4 bg-slate-100 border-b border-black/10">
            {canGoBack && (
                <TouchableOpacity onPress={() => router.back()} hitSlop={8} className="absolute left-4 ...">
                    <Text className="text-2xl leading-none">‹</Text>
                </TouchableOpacity>
            )}
            <Text className="text-xl font-bold px-12" numberOfLines={1}>{name}</Text>
        </View>
    )
}
```

Se usa `canGoBack={false}` en las pantallas raíz de cada pestaña y `true` en todo lo demás.
`hitSlop={8}` amplía el área táctil 8 px en cada dirección sin cambiar el aspecto visual — la
flecha se ve pequeña pero se toca fácil.

---

## 4.8 Rutas dinámicas

Un archivo entre corchetes convierte esa parte de la URL en un parámetro.

```
src/app/(articulos)/[categoriaArt]/[articuloId].tsx
```

Se lee con `useLocalSearchParams`:

```tsx
// src/app/(articulos)/[categoriaArt]/[articuloId].tsx
import { useLocalSearchParams } from "expo-router"

export default function ArticuloScreen() {
    const { articuloId } = useLocalSearchParams()
    const todos = useValue(articulo$)

    const articulo = porId(todos, articuloId as string)

    if (!articulo) {
        return (
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-gray-400">Articulo no encontrado.</Text>
            </View>
        )
    }

    return ( /* ... */ )
}
```

**El nombre de la variable desestructurada tiene que ser igual al del archivo**: el archivo es
`[articuloId].tsx`, así que el parámetro es `articuloId`.

**El `as string` es necesario** porque `useLocalSearchParams` devuelve `string | string[]`
(una ruta podría repetir el parámetro).

**El guard `if (!articulo)` no es opcional.** El ID viene de la URL y podría no existir en el
caché local — por ejemplo, si el artículo se borró o si aún no sincronizó. Sin ese guard, la
línea siguiente lanza `Cannot read property 'titulo' of undefined`.

Este patrón —leer el parámetro, buscar en el observable, guard, renderizar— se repite en
`[condicionId].tsx`, `[contactoId].tsx` y `[resultadoMedicion].tsx`.

---

## 4.9 Anatomía de una pantalla

`src/app/(tabs)/medicacion/index.tsx` sigue el orden que usan todas:

```tsx
export default function MedicacionScreen() {
    // 1. Leer observables
    const perfil = useValue(perfil$)
    const medicamentos = useValue(medicamento$)
    const tomas = useValue(toma$)

    // 2. Derivar datos con helpers puros de src/state/
    const lista = medicamentosActivos(medicamentos, perfil?.id)
    const hoy = tomasDelDia(tomas, new Date(), perfil?.id)
    const sinResolver = hoy.filter((t) => t.estado === 'pendiente' || t.estado === 'pospuesta')
    const grupos = agruparPorHora(hoy)

    // 3. Efectos
    useFocusEffect(useCallback(() => {
        if (!perfil?.id) return
        generarTomasPendientes(perfil.id)
    }, [perfil?.id]))

    // 4. Renderizar
    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Medicacion' canGoBack={false}/>
            </SafeAreaView>
            <ScrollView className="flex-grow bg-neutral-50" contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}>
                {/* ... */}
            </ScrollView>
        </View>
    )
}
```

**Lo que hay que notar:** no hay `useState` para los datos, no hay `useEffect` para cargarlos,
no hay estado de carga ni manejo de errores de red. Leer el observable es lo que dispara todo.

El paso 2 usa funciones puras que viven en `src/state/`. Mantener el filtrado y el ordenamiento
fuera del componente permite probarlos sin renderizar nada y evita duplicarlos en cada pantalla.

**El patrón `SafeAreaView` + `ScrollView`** se repite en toda la app:
el `SafeAreaView` con `edges={['top']}` cubre solo el notch y contiene la `TopBar`;
el `ScrollView` va afuera para poder llegar hasta el borde inferior de la pantalla.

---

## 4.10 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| *"Route ... is missing the required default export"* | La pantalla no usa `export default` | Toda pantalla debe exportar por defecto |
| La pestaña aparece vacía | `name` no coincide con el archivo | Igualá `NativeTabs.Trigger name` al nombre del archivo o carpeta |
| La ruta incluye `/tabs` | Falta el paréntesis | Renombrá la carpeta a `(tabs)` |
| El parámetro llega `undefined` | El nombre desestructurado no coincide con el archivo | `[articuloId].tsx` → `const { articuloId } = ...` |
| `Cannot read property 'x' of undefined` en una ruta dinámica | Falta el guard | Agregá `if (!dato) return <NoEncontrado/>` |
| La app arranca en el login aunque haya sesión | Se renderizó antes de cargar la sesión | Respetá el guard de `cargando` |
| Doble encabezado | El nativo y la `TopBar` | `screenOptions={{headerShown: false}}` |
| El contenido queda bajo el notch | Falta `SafeAreaView` | Envolvé con `edges={['top']}` |
| El contenido no llega al fondo | `SafeAreaView` envuelve todo | Dejá el `ScrollView` fuera del `SafeAreaView` |
| Se apilan copias de la misma pantalla | Se usó `push` donde iba `navigate` | Usá `router.navigate` |
