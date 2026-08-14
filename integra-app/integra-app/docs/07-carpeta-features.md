# 7. Carpeta `src/features/`

> Todo lo reutilizable, organizado por área de la app: componentes, esquemas de validación y
> lógica de negocio.

| Librería | Versión | Documentación |
|---|---|---|
| `react` / `react-native` | `19.1.0` / `0.81.5` | https://reactnative.dev/docs/components-and-apis |
| `react-hook-form` | `^7.84.0` | https://react-hook-form.com/docs |
| `zod` | `^4.4.3` | https://zod.dev/ |
| `@legendapp/state` | `^3.0.0-beta.48` | https://legendapp.com/open-source/state/v3/ |
| `expo-crypto` | `~15.0.9` | https://docs.expo.dev/versions/v54.0.0/sdk/crypto/ |
| `react-native-modal-datetime-picker` | `^18.0.0` | https://github.com/mmazzarolo/react-native-modal-datetime-picker |
| `@react-native-community/datetimepicker` | `8.4.4` | https://github.com/react-native-datetimepicker/datetimepicker |
| `rn-modal-picker` | `^0.4.9` | https://www.npmjs.com/package/rn-modal-picker |

---

## 7.1 Organización

La carpeta se divide **por área de la aplicación**, no por tipo de archivo:

```
src/features/
├── auth/          registro y login
├── articulos/     wiki
├── condicion/     diagnósticos
├── medicacion/    medicamentos y tomas
├── medicion/      mediciones clínicas
├── perfil/        perfil y contactos
└── topbar/        encabezado compartido
```

Dentro de cada área conviven tres tipos de archivo:

| Tipo | Nombre | Qué contiene |
|---|---|---|
| **Componente** | `PascalCase.tsx` | Interfaz reutilizable |
| **Esquema** | `*-schema.ts` | Validación con Zod + constantes de opciones |
| **Lógica** | `kebab-case.ts` | Reglas de negocio puras |

> **Nota:** el `FEATURES.md` original planteaba separar esquemas y componentes en carpetas
> distintas. No se hizo, y agrupar por área funciona bien: cuando trabajás en medicación, todo
> lo de medicación está junto. La regla real es simple — si algo se usa en más de una pantalla,
> va en `features/`.

---

## 7.2 `topbar/` — encabezado compartido

**`TopBar.tsx`** es el componente más reutilizado del proyecto. Aparece en casi todas las pantallas.

```tsx
type TopBarProps = {
    name: string
    canGoBack: boolean
}

export default function TopBar({ name, canGoBack }: TopBarProps) {
    return (
        <View className="relative flex-row items-center justify-center py-4 px-4 bg-slate-100 border-b border-black/10">
            {canGoBack && (
                <TouchableOpacity onPress={() => router.back()} hitSlop={8}
                    className="absolute left-4 h-9 w-9 items-center justify-center rounded-full active:bg-black/5">
                    <Text className="text-2xl leading-none">‹</Text>
                </TouchableOpacity>
            )}
            <Text className="text-xl font-bold px-12" numberOfLines={1}>{name}</Text>
        </View>
    )
}
```

**Detalles que vale la pena copiar:**

- **`canGoBack`** es `false` en las pantallas raíz de cada pestaña, `true` en todo lo demás.
- **`hitSlop={8}`** amplía el área táctil 8 px sin cambiar el aspecto. La flecha se ve pequeña
  pero se toca fácil — es accesibilidad real, no adorno.
- **`numberOfLines={1}` + `px-12`** evitan que un título largo se desborde o quede debajo de la
  flecha.
- **`absolute left-4`** posiciona la flecha sin sacar el título de su centro. Si la flecha
  estuviera en el flujo normal, el título quedaría descentrado.

---

## 7.3 `auth/` — registro y login

### `registro-schema.ts`

Un esquema Zod para un formulario de tres pasos. Lo interesante es el `.refine()` final:

```ts
export const registroSchema = z.object({
    nombre: z.string().trim().min(2, {error: 'Ingresa tu nombre'}).max(60, {error: 'Maximo 60 caracteres'}),
    email: z.email({error: "Correo electronico invalido"}),
    fechaNacimiento: z.date({error: "Selecciona tu fecha de nacimiento"})
        .refine((d) => d <= new Date(), {error: "La fecha no puede ser futura"}),
    password: z.string().min(8, {error: "Minimo 8 caracteres"}),
    confirmar: z.string(),
    telefono: z.string().min(8, ...).regex(/^[\d+()\s-]+$/, { error: 'Solo números, espacios y + ( ) -' }),
    cedula: z.string().trim().max(20, ...).refine((v) => v === '' || v.length >= 5, { error: 'Cédula demasiado corta' }),
}).refine((v) => v.password === v.confirmar, {
    error: "Las contraseñas no coinciden",
    path: ['confirmar'],       // ← el error se muestra en el campo "confirmar"
})

export type RegistroForm = z.infer<typeof registroSchema>
```

**`.refine()` sobre el objeto completo** es la forma de validar una regla que involucra dos
campos. `path: ['confirmar']` decide **debajo de qué campo aparece el mensaje** — sin eso, el
error quedaría a nivel de formulario y ningún campo lo mostraría.

El truco de la cédula —`v === '' || v.length >= 5`— es cómo se hace un campo **opcional pero con
validación si se llena**. Vacío pasa; con contenido, debe tener al menos 5 caracteres.

### `pasos.ts` — el formulario por pasos

```ts
export type Paso = {
    titulo: string,
    subtitulo: string,
    campos: Path<RegistroForm>[]
}

export const PASOS: Paso[] = [
    { titulo: 'Informacion basica', subtitulo: 'Paso 1 de 3', campos: ['nombre', 'apellidos', 'email', 'fechaNacimiento'] },
    { titulo: 'Contraseña',         subtitulo: 'Paso 2 de 3 ——— elige una contraseña segura', campos: ['password', 'confirmar'] },
    { titulo: 'Datos de contacto',  subtitulo: 'Paso 3 de 3', campos: ['telefono', 'cedula'] },
]
```

Un registro de 8 campos en una sola pantalla intimida. Este arreglo lo parte en tres.

**Lo elegante es el tipo `Path<RegistroForm>[]`:** solo acepta nombres de campo que existan en
`RegistroForm`. Si mañana renombrás `telefono` a `celular` en el esquema, **este archivo deja de
compilar** hasta que lo actualices. Un arreglo de `string[]` habría fallado en silencio en
tiempo de ejecución.

La pantalla usa `campos` para validar solo el paso actual con `trigger(PASOS[i].campos)` antes de
avanzar — ver [09-zod-react-hook-form.md](09-zod-react-hook-form.md#96-formularios-por-pasos).

### `CampoTexto.tsx`

El campo de texto genérico. Analizado línea por línea en
[03-fundamentos-react-componentes.md](03-fundamentos-react-componentes.md#38-anatomía-completa-de-un-componente-del-proyecto).

Se usa en **todos** los formularios de la app, no solo en auth. Que viva en `auth/` es un
resto histórico (fue el primer formulario); si algún día se reorganiza la carpeta, este es el
candidato natural a moverse a un `comunes/`.

### `CampoFecha.tsx`

Selector de fecha conectado a React Hook Form, sobre `react-native-modal-datetime-picker`.

---

## 7.4 `medicacion/` — el área más desarrollada

### `medicacion-schema.ts` — esquema y catálogos

Contiene las constantes de opciones y el esquema del formulario.

```ts
export const OPCIONES_FORMA = [
    {valor: 'tableta', etiqueta: 'Tableta'},
    {valor: 'capsula', etiqueta: 'Capsula'},
    // ...
]
```

**El patrón `{valor, etiqueta}` se repite en todo el proyecto:** `valor` es lo que va a la base
de datos (coincide con el `enum` de Postgres), `etiqueta` es lo que ve el usuario. Separarlos
permite cambiar el texto visible sin migrar datos.

```ts
//Date.getDay() da domingo como 0, pero para leerlo mejor lo dejo de ultimo
export const DIAS_SEMANA = [
    {valor: 1, letra: 'L', nombre: 'Lunes'},
    // ...
    {valor: 0, letra: 'D', nombre: 'Domingo'},
]
```

Los valores coinciden con `Date.getDay()` (0 = domingo), pero el **orden** del arreglo pone el
domingo al final, como se lee un calendario. El valor guardado y el orden visual son cosas
distintas — mezclarlas es un bug clásico de calendarios.

```ts
export const horarioFormSchema = z.object({
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {error: 'Hora invalida'}),
    dias: z.array(z.number()).min(1, {error: 'Selecciona al menos un dia'})
})

export const medicamentoSchema = z.object({
    nombre: z.string().trim().min(2, ...).max(80, ...),
    dosis: z.string().trim().min(1, ...)
        .refine((v) => /^\d+([.,]\d{1,3})?$/.test(v), {error: 'Solo numeros, ej: 50 o 2.5'}),
    // ...
    horarios: z.array(horarioFormSchema)
        .min(1, {error: 'Agrega al menos un horario'})
        .max(6, {error: 'Maximo 6 horarios por medicamento'}),
})
```

**`dosis` es `string`, no `number`.** En React Native un `TextInput` siempre devuelve texto. Se
valida como cadena con una expresión regular que acepta coma o punto decimal, y se convierte al
guardar:

```ts
export function dosisANumero(dosis: string): number {
    return Number(dosis.replace(',', '.'))
}
```

Si se declarara `z.number()`, el usuario vería *"Expected number, received string"* — un mensaje
del validador, no del dominio.

**El `.max(6)` en horarios** no es estético: está pensado por el límite de notificaciones locales
programables por medicamento.

### `CampoHorario.tsx` — el componente más complejo

Maneja una fila de horario: la hora y los días de la semana.

```tsx
export function CampoHorario({ control, index, onEliminar, puedeEliminar }: Props) {
    const hora = useController({ control, name: `horarios.${index}.hora` })
    const dias = useController({ control, name: `horarios.${index}.dias` })
    // ...
}
```

**Los nombres con plantilla** (`horarios.${index}.hora`) son cómo React Hook Form direcciona
campos dentro de un arreglo. El `index` viene del `useFieldArray` de la pantalla.

Incluye tres funciones de conversión entre el formato del formulario (`"08:00"`) y el que exige
el selector nativo (un `Date`):

```ts
function horaADate(hhmm: string): Date { /* "08:00" → Date de hoy a esa hora */ }
function dateAHora(d: Date): string     { /* Date → "08:00" */ }
function mostrarHora(hhmm: string): string { /* "08:00" → "8:00 a. m." */ }
```

**Por qué se guarda `"08:00"` y no un `Date`:** un horario es *una hora del día*, no un instante.
Guardar un `Date` arrastraría una fecha concreta que no significa nada y complicaría comparar
horarios entre sí.

El componente también maneja el comportamiento distinto del selector en Android (diálogo que se
cierra solo) y iOS (rueda dentro de un modal con botón de confirmar), por eso el estado
`temporal`.

### `generar-tomas.ts` — la lógica de negocio central

Crea las filas de `tomas` que faltan a partir de los horarios de cada medicamento activo.

```ts
const DIAS_ATRAS = 7   //cuantos dias atras genera tomas

function generarClave(medicamentoId: string, programada: Date): string {
    return `${medicamentoId}|${programada.getTime()}`
}
```

**La clave espeja exactamente el `UNIQUE` de la tabla** (`medicamento_id`, `programada_para`).
Esa es la idea: verificar localmente lo mismo que la base de datos va a verificar.

Estructura de tres bucles anidados: **días → medicamentos → horarios**. Por cada combinación
aplica cuatro filtros:

1. ¿El horario incluye este día de la semana? (`horario.dias.includes(diaSemana)`)
2. ¿El medicamento ya existía en esa fecha? (`if (programada < creado) continue`) — evita
   generar tomas anteriores a que el tratamiento se registrara.
3. ¿Ya existe esa toma? (`if (existentes.has(k)) continue`)
4. Si pasó todo, se crea con `Crypto.randomUUID()`.

La escritura final va en un `batch()`:

```ts
if (nuevas.length > 0) {
    batch(() => {
        for (const toma of nuevas) toma$[toma.id].set(toma)
    })
}
```

> 🔴 **Este archivo contiene el bug abierto del proyecto.** El guard usa `lastSync` en vez de
> `isLoaded`. Diagnóstico completo y corrección propuesta en
> [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).

> ⚠️ **Segundo riesgo: zonas horarias.** `programada.setHours(...)` usa la zona horaria **del
> dispositivo**. Si dos dispositivos de la misma cuenta tienen zonas distintas (muy común entre
> un emulador en UTC y un teléfono real), cada uno calcula un instante diferente para "las 8:00"
> y se generan **tomas duplicadas** — no da error, simplemente aparecen dos veces.
> Verificá que los dispositivos de prueba tengan la misma zona horaria.

### `acciones.ts` — mutaciones de estado

Cinco funciones cortas que encapsulan cada transición:

```ts
marcarTomada(tomaId)          // estado: 'tomada',    registrada_en: ahora
marcarOmitida(tomaId)         // estado: 'omitida',   registrada_en: ahora
posponer(tomaId, minutos=15)  // estado: 'pospuesta', pospuesta_hasta: ahora + minutos
revertir(tomaId)              // vuelve a 'pendiente' y limpia las fechas
marcarTodasTomadas(tomaIds)   // batch de marcarTomada
```

**Todas usan `.assign()`**, que hace merge, y **todas limpian los campos que dejan de aplicar**:

```ts
export function posponer(tomaId: string, minutos = 15){
    const hasta = new Date(Date.now() + minutos * 60_000)
    toma$[tomaId].assign({
        estado: 'pospuesta',
        registrada_en: null,        // ← se limpia explícitamente
        pospuesta_hasta: hasta.toISOString(),
    })
}
```

Poner `registrada_en: null` en vez de omitirlo es deliberado: si la toma venía de `'tomada'`,
ese campo tenía valor y quedaría inconsistente con el nuevo estado.

**Por qué estas funciones existen en vez de llamar a `toma$` desde el componente:** la regla
"posponer limpia `registrada_en`" se escribe una vez. Si estuviera repartida entre el modal, la
lista y el historial, tarde o temprano una de las tres se olvidaría.

`60_000` usa el separador numérico de JavaScript — es `60000`, solo más legible.

### `estados.ts` — presentación de estados

```ts
export function etiquetaEstado(estado: EstadoToma): string { /* → 'Pendiente', 'Tomada', ... */ }

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

`Record<EstadoToma, string>` obliga a cubrir **los cuatro** estados. Si se agrega `'cancelada'` a
`EstadoToma`, estas funciones dejan de compilar hasta actualizarlas. Es el compilador
recordándote todos los lugares que hay que tocar.

Las clases están escritas completas y no construidas dinámicamente, porque Tailwind escanea
texto literal (ver [03-fundamentos-react-componentes.md](03-fundamentos-react-componentes.md#36-estilos-con-nativewind)).

### `TomasDelDia.tsx` y `MedicinasLista.tsx`

Componentes de presentación. `TomasDelDia` recibe un `GrupoTomas` (las tomas de una misma hora)
y renderiza la tarjeta con sus acciones; `MedicinasLista` renderiza una fila de medicamento.

---

## 7.5 `medicion/` — mediciones clínicas

### `medicion-schema.ts`

```ts
const numeroMedicion = z.number({error: 'Ingresa un valor'})
    .positive({error: 'Debe ser mayor que cero'})
    .max(1000, {error: 'Valor  fuera de rango'})

export const medicionSchema = z.object({
    valor: numeroMedicion,
    medidoEn: z.date({ error: 'Selecciona la fecha' })
        .refine((d) => d <= new Date(), { error: 'No puede ser en el futuro' }),
    contexto: z.string(),
    nota: z.string().trim().max(200, {error: 'Maximo 200 caracteres'})
})

export const medicionDobleSchema = medicionSchema.extend({
    valorSecundario: numeroMedicion.optional()
})
```

Dos técnicas de Zod que conviene conocer:

- **Extraer un validador a una constante** (`numeroMedicion`) y reutilizarlo. Cambiar el rango se
  hace en un solo lugar.
- **`.extend()`** crea una variante sin repetir los campos. `medicionDobleSchema` es el esquema
  normal más un campo, para tipos como la presión arterial.

También incluye helpers de interfaz:

```ts
export function valorInicial(min: number, max: number): number {
    return Math.round(((min + max) / 2) * 10) / 10       // el punto medio del rango normal
}

export function pasoDe(min: number, max: number): number {
    return (max - min) < 10 ? 0.1 : 1                    // temperatura de 0.1; glucosa de 1
}

export function redondear(n: number): number {
    return Math.round(n * 10) / 10                       // evita 36.700000000000003
}
```

`pasoDe` es un buen ejemplo de regla derivada en vez de configurada: en vez de guardar el
incremento en la base de datos por cada tipo, se deduce del ancho del rango. Un rango angosto
(36–38 °C) implica décimas; uno amplio (70–180 mg/dL) implica unidades.

`redondear` existe porque los números de punto flotante acumulan error: sumar `0.1` diez veces no
da exactamente `1`. Sin redondear, el contador mostraría valores como `36.900000000000006`.

### `CampoMedicion.tsx` y `CampoMedicionDoble.tsx`

Dos variantes del control de captura. Cuál se usa lo decide `esDoble(tipo)` de
[`src/state/medicion.ts`](../src/state/medicion.ts), que devuelve `true` si el tipo tiene
`etiqueta_secundaria`.

### `TopBarSecondary.tsx`

Variante del encabezado para las pantallas de medición.

---

## 7.6 `perfil/` — perfil y contactos

- **`CampoSelect.tsx`** — dropdown genérico sobre `rn-modal-picker`, conectado a React Hook Form.
  Detalle práctico: `hideSearchBar={opciones.length < 8}` muestra el buscador solo cuando la lista
  es larga.
- **`perfil-schema.ts`** — validación de los datos del perfil.
- **`emergencia-schema.ts`** — validación de contactos de emergencia.
- **`PerfilBox.tsx`**, **`PerfilSummary.tsx`**, **`ContactoEmergenciaBox.tsx`** — presentación.

### `CampoSelect.tsx` en detalle

```tsx
const {field, fieldState} = useController({name, control})
const error = fieldState.error?.message

const datos = opciones.map((o) => ({ ...o, name: o.etiqueta }))
const seleccionada = opciones.find((o) => o.valor === field.value)
```

La línea de `datos` es un **adaptador**: `rn-modal-picker` exige que cada opción tenga una
propiedad `name`, pero el proyecto usa `{valor, etiqueta}`. En vez de cambiar la convención en
todo el código, se traduce aquí, en el único punto que toca esa librería. Si mañana se cambia de
librería de picker, solo se toca este archivo.

```tsx
onChange={(item: OpcionPicker) => field.onChange(item.valor)}
```

Al formulario se le pasa **`item.valor`**, no `item.etiqueta`. Es lo que garantiza que a la base
de datos llegue `'tableta'` y no `'Tableta'`.

---

## 7.7 `articulos/` y `condicion/`

- **`articulos/CategoriasBox.tsx`** y **`DestacadosBox.tsx`** — tarjetas de la wiki.
- **`condicion/condiciones-schema.ts`** — validación de condiciones médicas.

---

## 7.8 Cómo agregar un componente nuevo

1. **Ubicalo por área.** Si sirve para más de un área, poné el archivo donde más se use y
   considerá moverlo a un `comunes/` cuando aparezca el tercer uso.
2. **Declará el tipo de props primero.** Escribir el `type Props` antes que el cuerpo obliga a
   definir la interfaz antes que la implementación.
3. **Genérico si toca formularios.** `<T extends FieldValues>` con `Path<T>` y `Control<T>`, para
   que TypeScript valide los nombres de campo.
4. **Verificá que la ruta esté en `tailwind.config.js`.** Si no, `className` no genera nada y no
   hay ningún error.
5. **Las clases van completas.** Nunca `text-${color}-600`.

Plantilla mínima:

```tsx
import { View, Text } from 'react-native'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string
}

export function MiCampo<T extends FieldValues>({ name, control, title }: Props<T>) {
    const { field, fieldState } = useController({ name, control })
    const error = fieldState.error?.message

    return (
        <View className="mb-4">
            <Text className="mb-2">{title}</Text>
            {/* control aquí, usando field.value y field.onChange */}
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}
```
