# 3. Fundamentos de React y componentes

> Desde cero: qué es un componente, qué son props, hooks, JSX y cómo se aplican estilos con
> NativeWind. Todos los ejemplos salen del código real del proyecto.

| Librería | Versión | Documentación |
|---|---|---|
| `react` | `19.1.0` | https://react.dev/reference/react |
| `react-native` | `0.81.5` | https://reactnative.dev/docs/components-and-apis |
| `nativewind` | `^4.2.6` | https://www.nativewind.dev/ |
| `tailwindcss` | `^3.4.17` | https://v3.tailwindcss.com/docs |
| `typescript` | `~5.9.2` | https://www.typescriptlang.org/docs/ |

---

## 3.1 Qué es un componente

Un componente es **una función que devuelve la descripción de un pedazo de pantalla**.
Nada más. Se escribe en mayúscula inicial (`CampoTexto`, no `campoTexto`) — así React distingue
tus componentes de las etiquetas nativas.

```tsx
import { View, Text } from 'react-native'

export default function Saludo() {
    return (
        <View>
            <Text>Hola</Text>
        </View>
    )
}
```

Ese `<View>` dentro de un `return` es **JSX**: una sintaxis que parece HTML pero es JavaScript.
Babel lo convierte en llamadas a funciones antes de ejecutarse.

### `export default` contra `export`

```tsx
export default function MedicacionScreen() { ... }   // se importa sin llaves
export function CampoTexto() { ... }                 // se importa con llaves
```

```tsx
import MedicacionScreen from '...'       // default
import { CampoTexto } from '...'         // nombrado
```

En este proyecto la convención es:

- **Pantallas** (`src/app/`): `export default` — **es obligatorio**, expo-router lo exige.
- **Componentes** (`src/features/`): `export` nombrado, salvo algunos como `TopBar` y
  `MedicinasLista` que usan `default`. Ambos estilos conviven; seguí el del archivo que estés tocando.

---

## 3.2 JSX: las reglas que hay que saber

**Un solo elemento raíz.** Si necesitás varios hermanos, envolvelos en un `<View>` o en un
fragmento `<>...</>`.

**Las llaves `{}` insertan JavaScript.**

```tsx
<Text>{`Hoy, ${new Date().getDate()} de ${new Date().toLocaleString('es-Es', {month: 'long'})}`}</Text>
```

**Renderizado condicional.** Dos patrones, ambos presentes en el código:

```tsx
{/* && — muestra algo o nada */}
{error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}

{/* ternario — elige entre dos cosas */}
{hoy.length === 0 ? (
    <Text>No hay dosis programadas para hoy.</Text>
) : (
    <View>{grupos.map((g) => <TomasDelDia key={g.hora} grupo={g} />)}</View>
)}
```

> ⚠️ **Trampa de React Native con `&&`.** En web, `{0 && <Algo/>}` no muestra nada.
> En React Native, **el `0` se intenta renderizar como texto suelto y la app revienta** con
> *"Text strings must be rendered within a <Text> component"*.
> Si la condición es un número, convertila: `{lista.length > 0 && <Algo/>}`, nunca
> `{lista.length && <Algo/>}`.

**Listas con `.map()` y la prop `key`.**

```tsx
{lista.map((item) => (
    <MedicinasLista key={item.id} {...item}/>
))}
```

`key` tiene que ser **estable y única**. Usá el `id` de la fila. Usar el índice del array
(`key={i}`) provoca bugs visuales cuando la lista se reordena o se filtra: React reutiliza el
componente equivocado y ves datos de otra fila.

`{...item}` es *spread*: pasa todas las propiedades del objeto como props individuales.

---

## 3.3 Props y tipado con TypeScript

Las props son los valores que un componente recibe de su padre. Son **de solo lectura**: el hijo
nunca las modifica.

El patrón del proyecto es declarar un `type` con las props y desestructurarlo en la firma:

```tsx
// src/features/perfil/CampoSelect.tsx
type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string,
    opciones: OpcionPicker[]
}

export function CampoSelect<T extends FieldValues>({
    name, control, title, opciones
}: Props<T>) {
    ...
}
```

### Sintaxis de tipos que aparece en el código

```ts
title: string          // obligatorio
placeholder?: string   // opcional (puede ser undefined)
nota: string | null    // unión: string O null
opciones: OpcionPicker[]                       // arreglo
estado: 'pendiente' | 'tomada' | 'omitida'     // unión literal: solo esos valores
```

Las uniones literales son la herramienta más útil aquí. `EstadoToma` está definido así:

```ts
// src/state/medicacion.ts
export type EstadoToma = 'pendiente' | 'tomada' | 'pospuesta' | 'omitida'
```

Escribir `'tomado'` (con o final) es un error de compilación, no un bug que descubrís en
producción.

### Valores por defecto

```tsx
export function CampoTexto<T extends FieldValues>({
    control, name, title, placeholder,
    keyboardType = 'default', autoComplete = 'off', secureTextEntry = false, opcional = false
}: Props<T>) {
```

### Genéricos: el `<T>`

`CampoTexto<T extends FieldValues>` significa *"este componente sirve para cualquier formulario"*.
Cuando lo usás dentro de un formulario de medicamento, TypeScript deduce que `T` es
`MedicamentoForm` y entonces **solo acepta nombres de campo que existan en ese formulario**:

```tsx
<CampoTexto name="nombre" control={control} title="Nombre del medicamento"/>   // ✅
<CampoTexto name="nombrre" control={control} title="..."/>                     // ⛔ error de compilación
```

Es la razón por la que vale la pena el `<T>`: convierte un error de tipeo en un error del
compilador. Ver [09-zod-react-hook-form.md](09-zod-react-hook-form.md).

---

## 3.4 Componentes de React Native

En React Native **no existen** `<div>`, `<span>` ni `<p>`. Los equivalentes:

| Web | React Native | Para qué |
|---|---|---|
| `<div>` | `<View>` | Contenedor. Es el que usás para todo el layout |
| `<span>` / `<p>` | `<Text>` | **Todo texto va adentro de un `<Text>`, sin excepción** |
| `<input>` | `<TextInput>` | Campo de texto |
| `<button>` | `<Pressable>` | Botón (el más flexible) |
| `<img>` | `<Image>` | Imagen |
| scroll | `<ScrollView>` | Contenido que se desplaza |
| lista larga | `<FlatList>` | Lista virtualizada |

Los que se usan en el proyecto:

```tsx
import {
    View, Text, Pressable, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, Alert
} from 'react-native'
```

**`ActivityIndicator`** — el spinner de carga:

```tsx
<ActivityIndicator size="large" color="#0F7C7C"/>
```

**`KeyboardAvoidingView`** — evita que el teclado tape el campo activo. Necesita `behavior`
distinto por plataforma:

```tsx
<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
```

**`Platform`** — código específico por sistema operativo. Se usa mucho en
`src/app/(tabs)/_layout.tsx` para elegir entre íconos SF Symbols (iOS) y PNG (Android):

```tsx
<Icon
    src={Platform.OS === 'android' ? require("../../../assets/icons/pill.png") : undefined}
    sf={Platform.OS === 'ios' ? "pill" : undefined}
/>
```

**`ScrollView` y `contentContainerStyle`** — una distinción que confunde:

```tsx
<ScrollView
    className="flex-grow bg-white"                 // estilos del contenedor exterior
    contentContainerStyle={{                       // estilos del contenido interior
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 120
    }}
    keyboardShouldPersistTaps="handled"
>
```

El `padding` va en `contentContainerStyle`. Si lo ponés en `className`, se recorta el contenido
en vez de darle espacio. `keyboardShouldPersistTaps="handled"` permite tocar un botón mientras
el teclado está abierto, en vez de que el primer toque solo cierre el teclado.

**`Pressable` contra `TouchableOpacity`.** Ambos se usan en el proyecto. `Pressable` es el
moderno y más configurable; `TouchableOpacity` da el efecto de opacidad al presionar sin
configurar nada. Para código nuevo, preferí `Pressable`.

---

## 3.5 Hooks

Un hook es una función que empieza con `use` y le da "memoria" o efectos a un componente.

> **Las dos reglas de los hooks.** Se llaman siempre en el nivel superior del componente, nunca
> dentro de un `if`, un bucle o una función anidada. Y solo se llaman desde componentes o desde
> otros hooks. React identifica cada hook por su **orden de llamada**; si ese orden cambia entre
> renders, el estado se mezcla entre hooks distintos.

### `useState` — estado local de UI

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
```

Devuelve el valor actual y una función para cambiarlo. Cambiarlo re-renderiza el componente.

En este proyecto `useState` se reserva para **UI pura**: si un modal está abierto, si el botón
está deshabilitado mientras se guarda. **Los datos del servidor nunca van en `useState`** —
esos viven en observables de Legend-State (documento 5).

### `useEffect` — ejecutar algo después del render

```tsx
// src/app/(tabs)/medicacion/index.tsx
useEffect(() => {
    if (!perfil?.id) return
    generarTomasPendientes(perfil.id)
}, [perfil?.id, sincronizados, tomasSincronizadas])
```

El segundo argumento es el **arreglo de dependencias**: el efecto se vuelve a ejecutar cuando
alguno de esos valores cambia.

| Dependencias | Cuándo corre |
|---|---|
| `[]` | Solo al montar |
| `[a, b]` | Al montar y cuando `a` o `b` cambian |
| *omitido* | Después de **cada** render — casi siempre es un bug |

> ⚠️ **El bucle infinito clásico.** Si el efecto modifica un valor del que depende, se llama a sí
> mismo para siempre. En el ejemplo de arriba, `generarTomasPendientes` escribe tomas, lo que
> puede mover `tomasSincronizadas`, que es una dependencia. Funciona porque el generador es
> idempotente (la segunda vez no crea nada), pero es un equilibrio frágil — es exactamente el
> punto donde vive el bug abierto del proyecto.

### `useCallback` — memorizar una función

```tsx
useFocusEffect(
    useCallback(() => {
        if (!perfil?.id) return
        const n = generarTomasPendientes(perfil.id)
        if (n > 0) console.log(`tomas generadas ${n}`)
    }, [perfil?.id])
)
```

Sin `useCallback`, cada render crearía una función nueva, `useFocusEffect` la vería como
"distinta" y se re-ejecutaría en cada render.

### `useFocusEffect` — de expo-router, no de React

Corre cuando la pantalla **entra en foco**, no solo al montarse. La diferencia importa: si el
usuario va a Medicación → Expediente → Medicación, la pantalla nunca se desmontó, así que
`useEffect` **no** vuelve a correr, pero `useFocusEffect` sí.

### `useValue` — de Legend-State

```tsx
import { useValue } from '@legendapp/state/react'

const perfil = useValue(perfil$)
```

Suscribe el componente a un observable. Ver [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md).

> ⚠️ **El error que más tiempo cuesta: el hook se llama `useValue`.**
> Casi todos los tutoriales —incluido el artículo oficial de Supabase— usan `use$()` o
> `useSelector()`. Son los nombres anteriores de la **misma función**. Si copiás un ejemplo y
> obtenés *"use$ is not exported"*, esta es la razón.

### `useController` — de React Hook Form

```tsx
const {field, fieldState} = useController({name, control})
```

Conecta un campo al formulario. Ver [09-zod-react-hook-form.md](09-zod-react-hook-form.md).

---

## 3.6 Estilos con NativeWind

NativeWind trae Tailwind a React Native. Escribís clases en `className` y se traducen a estilos
nativos en tiempo de compilación.

```tsx
<View className="mx-6 mb-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
    <Text className="text-neutral-500 text-sm text-center">
        No hay dosis programadas para hoy.
    </Text>
</View>
```

### Cómo se activa (tres piezas, todas necesarias)

1. **`babel.config.js`** — `jsxImportSource: "nativewind"` agrega la prop `className`.
2. **`metro.config.js`** — `withNativeWind(config, { input: "./global.css" })`.
3. **`tailwind.config.js`** — la lista `content` con las rutas a escanear.

> ⚠️ Si falta cualquiera de las tres, **`className` se ignora en silencio**. No hay error, no hay
> advertencia: la pantalla simplemente sale sin estilos. Es el primer lugar donde mirar.

### Clases más usadas en el proyecto

**Layout (Flexbox).** En React Native, `flexDirection` por defecto es **`column`**, no `row`
como en web.

```
flex-1              ocupar todo el espacio disponible
flex-row            en fila (horizontal)
flex-col            en columna (por defecto)
items-center        centrar en el eje transversal
justify-between     repartir con espacio entre elementos
justify-center      centrar en el eje principal
```

**Espaciado** (`1` = 4 px): `p-4`, `px-6`, `py-3`, `m-2`, `mb-4`, `mt-1`, `mx-6`

**Texto:** `text-sm`, `text-lg`, `text-2xl`, `font-semibold`, `font-bold`, `text-center`,
`tracking-tight`, `line-through`, `italic`

**Colores:** `bg-white`, `bg-black`, `bg-slate-100`, `bg-neutral-50`, `text-slate-900`,
`text-neutral-500`, `text-red-600`, `text-teal-700`, `border-slate-300`

**Bordes:** `border`, `border-dashed`, `rounded-lg`, `rounded-2xl`, `rounded-3xl`

**Posición:** `absolute`, `bottom-36`, `right-6`, `overflow-hidden`

### Clases condicionales

Se arman con template strings:

```tsx
// src/features/auth/CampoTexto.tsx
className={`border rounded-lg px-4 py-3 text-slate-900 ${error ? 'border-red-400' : 'border-slate-300'}`}
```

Este patrón se abstrae en helpers cuando se repite:

```ts
// src/features/medicacion/estados.ts
export function colorEstado(estado: EstadoToma): string {
    const map: Record<EstadoToma, string> = {
        pendiente: 'text-neutral-600 font-medium',
        tomada: 'text-neutral-900 font-semibold',
        pospuesta: 'text-neutral-600 font-medium italic',
        omitida: 'text-neutral-500 font-medium line-through',
    }
    return map[estado]
}
```

`Record<EstadoToma, string>` obliga a que el mapa cubra **los cuatro** estados. Si mañana se
agrega `'cancelada'` a `EstadoToma`, esta función deja de compilar hasta que la actualices.
Ese es el punto.

> ⚠️ **Las clases se detectan por texto completo, no se construyen.**
> `className={`text-${color}-600`}` **no funciona**: Tailwind escanea los archivos buscando
> cadenas literales y nunca ve `text-red-600`. Hay que escribir la clase completa, como hace
> `colorEstado`.

### Cuándo usar `style` en vez de `className`

Para valores calculados en tiempo de ejecución:

```tsx
<View className="h-full bg-black" style={{ width: `${(tomasResueltas/hoy.length)* 100}%` }}/>
```

Un porcentaje dinámico no puede ser una clase de Tailwind. Se combinan sin problema:
`className` para lo estático, `style` para lo calculado.

---

## 3.7 SafeAreaView: notch y barra de estado

Viene de `react-native-safe-area-context` (`~5.6.0`), no de React Native.

```tsx
<SafeAreaView edges={['top']} className="bg-slate-100">
    <TopBar name='Medicacion' canGoBack={false}/>
</SafeAreaView>
```

`edges={['top']}` aplica el margen **solo arriba**. Es intencional: si aplicaras los cuatro
bordes, el contenido que debe llegar hasta el fondo (como el `ScrollView`) quedaría cortado.

El `<SafeAreaProvider>` que lo alimenta está en `src/app/_layout.tsx` y envuelve toda la app.

---

## 3.8 Anatomía completa de un componente del proyecto

`src/features/auth/CampoTexto.tsx`, línea por línea:

```tsx
import { View, Text, TextInput } from 'react-native'
import { Control, FieldValues, Path, useController} from 'react-hook-form'

// 1. Las props, tipadas y genéricas sobre el formulario T
type Props<T extends FieldValues> = {
    name: Path<T>          // solo nombres de campo válidos de T
    control: Control<T>    // el objeto de control del formulario
    placeholder?: string
    secureTextEntry?: boolean
    keyboardType?: 'default' | 'email-address' | 'phone-pad'
    autoComplete?: 'name' | 'family-name' | 'email' | 'new-password' | 'tel' | 'off'
    opcional?: boolean,
    title: string
}

export function CampoTexto<T extends FieldValues>({
    control, name, title, placeholder,
    // 2. Valores por defecto
    keyboardType = 'default', autoComplete='off', secureTextEntry=false, opcional=false
}: Props<T>) {

    // 3. Conexión con React Hook Form
    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message   // el mensaje que definió Zod

    return (
        <View className="mb-4 ">
          <Text className='mb-2'>
            {/* 4. Renderizado condicional de la etiqueta "(opcional)" */}
            {title} {opcional && <Text className='text-sm text-slate-500'>(opcional)</Text>}
          </Text>

          <TextInput
            placeholder={placeholder}
            // 5. Componente controlado: el valor viene del formulario
            value={(field.value as string) ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType={keyboardType}
            autoComplete={autoComplete}
            secureTextEntry={secureTextEntry}
            // 6. Borde rojo si hay error
            className={`border rounded-lg px-4 py-3 text-slate-900 ${error ? 'border-red-400' : 'border-slate-300'}`}
          />
            {/* 7. Mensaje de error debajo */}
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}
```

Este único componente resuelve el valor, los cambios, el `blur`, el error visual, el mensaje de
error y la etiqueta de opcional. Por eso los formularios del proyecto son tan cortos: toda esta
complejidad está encapsulada una sola vez.

El `?? ''` de la línea 5 no es adorno: si `field.value` fuera `undefined`, el `TextInput` pasaría
de *no controlado* a *controlado* al escribir la primera letra y React lanza una advertencia.

---

## 3.9 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| *"Text strings must be rendered within a `<Text>`"* | Texto suelto, o un `0` de un `&&` numérico | Envolvé en `<Text>`; usá `lista.length > 0 &&` |
| El `className` no hace nada | Falta config de NativeWind, o la carpeta no está en `content` | Revisá las tres piezas de §3.6 |
| *"Rendered more hooks than during the previous render"* | Un hook dentro de un `if` o después de un `return` temprano | Movelo al nivel superior |
| La lista muestra datos equivocados al filtrar | `key={index}` | Usá `key={item.id}` |
| Bucle infinito de renders | El `useEffect` modifica una de sus dependencias | Revisá el arreglo de dependencias |
| El teclado tapa el campo | Falta `KeyboardAvoidingView` | Envolvé el formulario, con `behavior` por plataforma |
| El primer toque solo cierra el teclado | Falta configuración del ScrollView | `keyboardShouldPersistTaps="handled"` |
| `Cannot read property 'id' of undefined` | El observable todavía no cargó | Usá `perfil?.id` y un guard temprano |
