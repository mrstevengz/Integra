# 9. Zod y React Hook Form

> Cómo se construye, valida y envía un formulario en este proyecto.

| Librería | Versión | Documentación |
|---|---|---|
| `zod` | `^4.4.3` | https://zod.dev/ |
| `react-hook-form` | `^7.84.0` | https://react-hook-form.com/docs |
| `@hookform/resolvers` | `^5.7.1` | https://github.com/react-hook-form/resolvers |

---

## 9.1 Reparto de responsabilidades

Las dos librerías hacen cosas distintas y se conectan por un puente:

```
   Zod                    @hookform/resolvers            React Hook Form
   ───                    ───────────────────            ───────────────
   Define QUÉ es válido   Traduce entre las dos          Maneja el formulario:
   y el mensaje de error                                 valores, errores, envío
```

En código:

```tsx
const { control, handleSubmit, formState: { errors } } = useForm<MedicamentoForm>({
    resolver: zodResolver(medicamentoSchema),   // ← el puente
    defaultValues: { /* ... */ },
})
```

**Zod nunca toca la interfaz. React Hook Form nunca decide qué es válido.**

> **Importante:** Zod aquí es **validación de cliente, a nivel de interfaz**. No reemplaza las
> restricciones de Postgres ni las políticas RLS. Un atacante puede saltarse Zod trivialmente
> (la llave `anon` es pública); no puede saltarse RLS. Zod existe para dar buenos mensajes de
> error, no para proteger datos.

---

## 9.2 Zod: definir un esquema

```ts
import { z } from 'zod'

export const medicionSchema = z.object({
    valor: z.number({error: 'Ingresa un valor'})
        .positive({error: 'Debe ser mayor que cero'})
        .max(1000, {error: 'Valor  fuera de rango'}),

    medidoEn: z.date({ error: 'Selecciona la fecha' })
        .refine((d) => d <= new Date(), { error: 'No puede ser en el futuro' }),

    contexto: z.string(),

    nota: z.string().trim().max(200, {error: 'Maximo 200 caracteres'})
})
```

### Validadores usados en el proyecto

```ts
z.string()                 z.number()               z.date()
  .trim()                    .positive()              .refine(...)
  .min(2, {error: '...'})    .max(1000, {...})
  .max(80, {error: '...'})   .optional()
  .regex(/.../, {...})
  .refine(fn, {...})

z.email({error: '...'})                 // validación de correo
z.array(otroSchema).min(1).max(6)       // arreglos
z.object({...})                          // objeto
```

> ⚠️ **Sintaxis de Zod 4.** El mensaje va en `{error: '...'}`.
> En **Zod 3** era `{message: '...'}` o un string suelto como segundo argumento.
> Este proyecto usa **Zod 4** (`^4.4.3`): si copiás un ejemplo de internet con `message:`, el
> mensaje se ignora en silencio y el usuario ve el texto genérico de la librería.
> `z.email()` también es de Zod 4 — en Zod 3 era `z.string().email()`.

### `.refine()` — reglas personalizadas

Sobre un campo:

```ts
dosis: z.string().trim().min(1, {error: 'Ingresa la dosis'})
    .refine((v) => /^\d+([.,]\d{1,3})?$/.test(v), {error: 'Solo numeros, ej: 50 o 2.5'}),
```

Campo opcional pero validado si se llena:

```ts
cedula: z.string().trim().max(20, {error: 'Maximo 20 caracteres'})
    .refine((v) => v === '' || v.length >= 5, { error: 'Cédula demasiado corta' }),
```

Sobre el objeto completo, para comparar dos campos:

```ts
}).refine((v) => v.password === v.confirmar, {
    error: "Las contraseñas no coinciden",
    path: ['confirmar'],       // ← bajo qué campo aparece el mensaje
})
```

**`path` es obligatorio en la práctica.** Sin él, el error queda a nivel de formulario y ningún
campo lo muestra: el usuario ve que el botón no funciona y no sabe por qué.

### `.extend()` — variantes sin repetir

```ts
export const medicionDobleSchema = medicionSchema.extend({
    valorSecundario: numeroMedicion.optional()
})
```

### Reutilizar un validador

```ts
const numeroMedicion = z.number({error: 'Ingresa un valor'})
    .positive({error: 'Debe ser mayor que cero'})
    .max(1000, {error: 'Valor  fuera de rango'})

export const medicionSchema = z.object({ valor: numeroMedicion, /* ... */ })
export const medicionDobleSchema = medicionSchema.extend({ valorSecundario: numeroMedicion.optional() })
```

### `z.infer` — el tipo sale del esquema

```ts
export type MedicamentoForm = z.infer<typeof medicamentoSchema>
export type RegistroForm = z.infer<typeof registroSchema>
```

**Esto es lo más valioso de Zod en un proyecto TypeScript.** El tipo se **deriva** del esquema:
no puede desincronizarse, porque no se escribe a mano. Agregás un campo al esquema y el tipo lo
tiene al instante.

> **Excepción en el proyecto:** `medicion-schema.ts` declara `MedicionForm` a mano en vez de
> usar `z.infer`, porque combina dos esquemas (simple y doble) en un solo tipo de formulario.
> Es una decisión consciente, no un descuido — pero si tocás ese esquema, acordate de actualizar
> el tipo también, porque el compilador no te va a avisar.

### `string` cuando el dato es un número

```ts
dosis: z.string().trim().min(1, {error: 'Ingresa la dosis'})
    .refine((v) => /^\d+([.,]\d{1,3})?$/.test(v), {error: 'Solo numeros, ej: 50 o 2.5'}),
```

Un `TextInput` de React Native **siempre** devuelve texto. Si declararas `z.number()`, el usuario
vería *"Expected number, received string"* — un mensaje del validador, no del dominio.

La conversión se hace explícitamente al guardar:

```ts
export function dosisANumero(dosis: string): number {
    return Number(dosis.replace(',', '.'))
}
```

El `.replace(',', '.')` acepta que en español se escriba `2,5`.

---

## 9.3 React Hook Form: `useForm`

```tsx
const { control, handleSubmit, formState: { errors } } = useForm<MedicamentoForm>({
    resolver: zodResolver(medicamentoSchema),
    defaultValues: {
        nombre: '',
        dosis: '',
        unidad: 'mg',
        forma: 'tableta',
        con_alimentos: '',
        indicaciones: '',
        horarios: [{ hora: '08:00', dias: TODOS_LOS_DIAS }],
    },
})
```

### Lo que devuelve `useForm`

| Propiedad | Para qué |
|---|---|
| `control` | El objeto que se pasa a cada campo. **Es lo que conecta todo** |
| `handleSubmit` | Envuelve tu función de envío: valida primero, y solo llama si todo pasó |
| `formState.errors` | Los errores actuales, por campo |
| `formState.isLoading` | Si el formulario está en un estado asíncrono |
| `trigger` | Valida campos específicos bajo demanda |
| `watch` | Observa el valor de un campo en vivo |
| `setValue` | Cambia un valor por código |

### `defaultValues` no es opcional

> ⚠️ **Siempre declará `defaultValues` con cadenas vacías**, no las omitas.
> Sin ellos, los campos arrancan en `undefined`, el `TextInput` empieza *no controlado* y pasa a
> *controlado* al escribir la primera letra. React lanza una advertencia y, en algunos casos, el
> cursor salta al inicio.

Además permite precargar valores sensatos: `unidad: 'mg'`, `forma: 'tableta'`, y un primer
horario ya listo.

---

## 9.4 Conectar un campo: `useController`

Cada componente de campo se conecta con `useController`:

```tsx
const { field, fieldState } = useController({ name, control })
```

| Objeto | Contiene |
|---|---|
| `field.value` | El valor actual |
| `field.onChange` | Función para cambiarlo |
| `field.onBlur` | Marcar el campo como "tocado" |
| `fieldState.error` | El error de Zod, si lo hay |

Ejemplo completo, `CampoTexto.tsx`:

```tsx
const {field, fieldState} = useController({name, control})
const error = fieldState.error?.message

return (
    <View className="mb-4">
      <Text className='mb-2'>{title}</Text>
      <TextInput
        value={(field.value as string) ?? ''}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        className={`border rounded-lg px-4 py-3 ${error ? 'border-red-400' : 'border-slate-300'}`}
      />
      {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
    </View>
)
```

**El `?? ''`** garantiza que el input nunca reciba `undefined`.
**`onChangeText`** es la prop de React Native, no `onChange` como en web.

### Adaptar una librería externa

`CampoSelect` usa `rn-modal-picker`, que espera otro formato:

```tsx
const datos = opciones.map((o) => ({ ...o, name: o.etiqueta }))
const seleccionada = opciones.find((o) => o.valor === field.value)

<ModalPicker
    data={datos}
    value={seleccionada?.etiqueta ?? ''}
    onChange={(item: OpcionPicker) => field.onChange(item.valor)}
/>
```

Al formulario se le pasa **`item.valor`**, no `item.etiqueta`. Eso es lo que garantiza que a
Postgres llegue `'tableta'` y no `'Tableta'` — y que coincida con el `enum` de la tabla.

---

## 9.5 Por qué los campos son genéricos

```tsx
type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    title: string
}

export function CampoTexto<T extends FieldValues>({ control, name, title }: Props<T>) {
```

`Path<T>` significa *"cualquier ruta de campo válida dentro del formulario T"*. Cuando usás el
componente dentro del formulario de medicamento, TypeScript deduce que `T` es `MedicamentoForm` y
**solo acepta nombres que existan ahí**:

```tsx
<CampoTexto name="nombre" control={control} title="Nombre del medicamento"/>   // ✅
<CampoTexto name="nombrre" control={control} title="..."/>                     // ⛔ no compila
```

Sin el genérico, `name` sería `string` y un typo se descubriría en tiempo de ejecución, cuando el
campo aparece siempre vacío y nadie sabe por qué.

`Path<T>` también entiende rutas anidadas: `horarios.0.hora` es válido, `horarios.0.horaa` no.

---

## 9.6 Formularios por pasos

`src/app/(auth)/registro.tsx` reparte 8 campos en 3 pantallas. El truco está en `trigger`:

```tsx
const [paso, setPaso] = useState(0)

const { control, handleSubmit, trigger, formState: {isLoading} } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombre: '', apellidos: '', email: '', password: '', confirmar: '', telefono: '', cedula: '' }
})

const actual = PASOS[paso]
const esUltimo = paso === PASOS.length - 1

async function continuar() {
    const valido = await trigger(actual.campos)    // ← valida SOLO los campos de este paso
    if (!valido) return

    if (esUltimo) await handleSubmit(onSubmit)()
    else setPaso((p) => (p + 1))
}
```

**`trigger(campos)` valida un subconjunto.** Sin esto, avanzar del paso 1 dispararía errores en
los campos del paso 3, que el usuario ni ha visto.

Los campos de cada paso vienen de `src/features/auth/pasos.ts`, tipados como `Path<RegistroForm>[]`
para que renombrar un campo del esquema rompa la compilación aquí (§7.3).

**El indicador de progreso** se deriva del mismo arreglo:

```tsx
<View className="flex-row gap-2 mb-8">
    {PASOS.map((_, i) => (
        <View key={i} className={`h-1 flex-1 rounded-full ${i <= paso ? 'bg-slate-700' : 'bg-slate-200'}`}/>
    ))}
</View>
```

**Todos los campos existen siempre en el formulario**, aunque solo se rendericen los del paso
actual. Por eso `handleSubmit` al final tiene el objeto completo y la validación cruzada de
contraseñas funciona.

---

## 9.7 Enviar el formulario

### A un observable (el caso normal)

```tsx
function onSubmit(v: MedicamentoForm) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
        const medId = Crypto.randomUUID()

        medicamento$[medId].set({
            id: medId,
            perfil_id: perfil.id,
            nombre: v.nombre,
            dosis: dosisANumero(v.dosis),                          // string → number
            unidad: v.unidad,
            forma: v.forma as FormaFarmaceutica,                   // string → enum
            con_alimentos: (v.con_alimentos || null) as ConAlimentos | null,
            indicaciones: v.indicaciones || null,                  // '' → null
            activo: true,
            horarios: v.horarios.map((h) => ({
                id: Crypto.randomUUID(),
                hora: h.hora,
                dias: h.dias,
            })),
        })

        router.back()
    } catch (error) {
        console.error('No se pudo guardar el medicamento', error)
    } finally {
        setIsSubmitting(false)
    }
}

// en el JSX:
<Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-black py-4 rounded-lg">
    <Text className="text-white text-center">{isSubmitting ? "Guardando..." : "Guardar medicamento"}</Text>
</Pressable>
```

**Cuatro cosas que hay que notar:**

1. **`handleSubmit(onSubmit)` — no `onSubmit` a secas.** `handleSubmit` valida primero y solo
   llama a tu función si todo pasó. Pasar `onSubmit` directo se salta la validación entera.

2. **La conversión de tipos ocurre aquí.** El formulario trabaja con lo que la interfaz produce
   (cadenas); la base de datos quiere números y enums. Este es el único punto donde se traduce.

3. **`'' || null`.** Un campo opcional vacío debe guardarse como `NULL`, no como cadena vacía.
   Postgres distingue "no hay dato" de "hay un dato que está vacío", y los filtros `IS NULL` no
   encuentran `''`.

4. **`isSubmitting` bloquea el doble envío.** Sin él, un doble toque crea dos medicamentos con
   UUIDs distintos.

**No hay `await`.** Escribir en el observable es síncrono: guarda en SQLite y encola el envío.
`router.back()` funciona de inmediato aunque no haya internet.

### A Supabase Auth (caso especial)

El registro y el login sí hablan directo con Supabase, porque la autenticación no es una tabla:

```tsx
async function onSubmit(formValues: RegistroForm) {
    setErrorServer(null)
    setAviso(null)

    const { data, error } = await supabase.auth.signUp({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        options: {
            data: {
                nombre: formValues.nombre,
                apellidos: formValues.apellidos,
                fecha_nacimiento: formValues.fechaNacimiento.toISOString().slice(0, 10),
                telefono: formValues.telefono,
                cedula: formValues.cedula
            }
        }
    })

    if (error) setErrorServer(error.message)
    else if (!data.session) setAviso('Cuenta creada, revisa tu correo para confirmarla')
}
```

**`options.data`** guarda metadatos en `auth.users.raw_user_meta_data`. El trigger de la
migración `0001_crear_perfil_al_registrarse.sql` los lee para crear la fila en `perfiles`. Por eso
la app nunca hace `INSERT` en esa tabla y `src/state/usuario.ts` solo declara
`actions: ['read', 'update']`.

**`email.trim().toLowerCase()`** normaliza el correo: sin esto, `Ana@Mail.com` y `ana@mail.com`
serían cuentas distintas.

**`if (!data.session)`** distingue dos casos de éxito. Si Supabase tiene activada la confirmación
por correo, `signUp` devuelve usuario pero **sin sesión** — hay que avisarle al usuario que
revise su correo en vez de dejarlo esperando.

Los errores del servidor van a `useState`, no a React Hook Form: no pertenecen a ningún campo.

---

## 9.8 Arreglos dinámicos: `useFieldArray`

Para los horarios de un medicamento:

```tsx
const { fields, append, remove } = useFieldArray({ control, name: 'horarios' })
```

```tsx
{fields.map((field, index) => (
    <CampoHorario
        key={field.id}                       // ← el id de RHF, NO el índice
        control={control}
        index={index}
        onEliminar={() => remove(index)}
        puedeEliminar={fields.length > 1}
    />
))}

<Pressable
    onPress={() => append({ hora: '20:00', dias: TODOS_LOS_DIAS })}
    disabled={fields.length >= 6}
    className={`border rounded-lg py-3 items-center mb-6 ${fields.length >= 6 ? 'border-slate-200' : 'border-teal-700'}`}
>
    <Text className={fields.length >= 6 ? 'text-slate-400' : 'text-teal-700'}>
        {fields.length >= 6 ? 'Maximo 6 horarios' : '+ Agregar horario'}
    </Text>
</Pressable>
```

> ⚠️ **`key={field.id}`, nunca `key={index}`.** React Hook Form genera un `id` estable por
> elemento justamente para esto. Con el índice, borrar el horario del medio hace que el siguiente
> herede su estado visual — el usuario ve la hora equivocada en la fila equivocada.

**El límite se aplica en dos lugares:** la interfaz deshabilita el botón (`fields.length >= 6`) y
el esquema lo rechaza (`.max(6)`). La interfaz da la buena experiencia; el esquema es la garantía.

Dentro de `CampoHorario`, los campos se direccionan con plantillas:

```tsx
const hora = useController({ control, name: `horarios.${index}.hora` })
const dias = useController({ control, name: `horarios.${index}.dias` })
```

### Errores a nivel de arreglo

```tsx
{errors.horarios?.root && (
    <Text className="text-red-600 text-sm mb-2">{errors.horarios.root.message}</Text>
)}
```

`.root` es donde React Hook Form pone los errores del **arreglo completo** (como
`.min(1, 'Agrega al menos un horario')`), en contraste con los de un elemento individual, que
viven en `errors.horarios[0].hora`.

---

## 9.9 Checklist para un formulario nuevo

1. **Creá `<area>-schema.ts`** con el esquema Zod y `export type X = z.infer<typeof xSchema>`.
2. **Poné los mensajes en español** dentro de `{error: '...'}` — sintaxis de Zod 4.
3. **Solo incluí campos que el usuario edita.** Los `id`, `perfil_id` y timestamps no van en el
   esquema: no son campos del formulario.
4. **En la pantalla**, `useForm` con `zodResolver` y `defaultValues` completos.
5. **Reutilizá `CampoTexto` / `CampoSelect` / `CampoFecha`** en vez de escribir inputs a mano.
6. **`handleSubmit(onSubmit)`** en el botón, nunca `onSubmit`.
7. **Convertí los tipos en `onSubmit`**: string → number, `''` → `null`, string → enum.
8. **Bloqueá el doble envío** con un `isSubmitting`.
9. **Generá el UUID con `Crypto.randomUUID()`** antes de escribir en el observable.
10. **Envolvé en `KeyboardAvoidingView`** y usá `keyboardShouldPersistTaps="handled"`.

---

## 9.10 Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Los mensajes de Zod no aparecen | Se usó `{message: ...}` de Zod 3 | Usá `{error: ...}` |
| *"Expected number, received string"* | Se declaró `z.number()` para un `TextInput` | Usá `z.string()` + `.refine()` y convertí al guardar |
| El error de "contraseñas no coinciden" no se ve | Falta `path` en el `.refine()` del objeto | Agregá `path: ['confirmar']` |
| El campo se queja aunque esté bien | El `name` no coincide con el esquema | Deben ser idénticos |
| Advertencia de controlado/no controlado | Falta `defaultValues` o el `?? ''` | Agregá ambos |
| Se envía sin validar | Se pasó `onSubmit` directo | Usá `handleSubmit(onSubmit)` |
| Al borrar un horario se descoloca la lista | `key={index}` | Usá `key={field.id}` |
| Avanzar de paso valida campos no vistos | Se llamó `trigger()` sin argumentos | `trigger(PASOS[paso].campos)` |
| Se crean dos registros con un doble toque | Falta bloqueo | `isSubmitting` + `disabled` |
| Llega `''` a Postgres donde debía ir `NULL` | Falta la conversión | `v.campo \|\| null` |
| El teclado tapa el campo | Falta `KeyboardAvoidingView` | Envolvé el formulario |
