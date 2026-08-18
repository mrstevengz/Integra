# QR de emergencia y QR de expediente

> Especificación de la feature. Estado: **diseñada, sin implementar.**
> Última actualización: 2026-08-16

---

## 1. Resumen

Dos códigos QR distintos, con propósitos y reglas opuestas:

| | **QR de emergencia** | **QR de expediente** |
|---|---|---|
| Qué contiene | Los datos, en texto plano | Una URL |
| Conexión | **No necesita** (ninguno de los dos lados) | Necesaria para quien escanea |
| Tamaño típico | ~350–550 caracteres | ~60 caracteres |
| Contenido | **Fijo**, el usuario no elige | El usuario elige qué exponer |
| Revocable | ❌ No | ✅ Sí |
| Caduca | ❌ No | ✅ Debería |
| Estado | Diseñado | **Sin diseñar** (falta destino de la URL) |

El de emergencia paga privacidad a cambio de funcionar siempre. El de expediente paga
disponibilidad a cambio de control. Separarlos evita un punto medio que no sirve para ninguno.

**Ambos se muestran dentro de la app.** No hay escáner: el QR lo lee cualquier cámara nativa
de teléfono, sin instalar nada.

---

## 2. QR de emergencia

### 2.1 Contenido (fijo)

El usuario **no puede elegir** qué se incluye. Siempre va:

1. Nombre completo
2. Edad y fecha de nacimiento
3. Tipo de sangre
4. **Alergias** (con severidad)
5. **Contactos de emergencia**
6. Condiciones médicas
7. Medicamentos actuales (solo `activo = true`)

### 2.2 Formato

Texto plano, **no JSON**. El paramédico apunta la cámara y lee directo; JSON se vería como
`{"nombre":"..."}` — legible, pero peor bajo presión.

```
INTEGRA - EMERGENCIA
Steven Sequeira Gonzalez
28a (23/04/1998) - Sangre O+

ALERGIAS
Penicilina (severa)
Mariscos (moderada)

CONTACTO
Maria Perez (esposa) +50688888888
Juan Perez (hermano) +50677777777

CONDICIONES
Hipertension arterial
Diabetes tipo 2

MEDICAMENTOS
Losartan 50mg
Metformina 850mg

Generado 16/08/2026
```

### 2.3 Orden y prioridad

El orden **no es estético, es clínico**. Si el QR sale mal enfocado o quien lee solo alcanza
las primeras líneas, deben ser las que salvan vidas.

| Sección | Tope | Si se pasa del tope |
|---|---|---|
| Identidad + tipo de sangre | — | Nunca se corta |
| **Alergias** | — | **Nunca se cortan** |
| **Contactos** | — | **Nunca se cortan** |
| Condiciones | 4 | `(+2 mas en la app)` |
| Medicamentos | 5 | `(+3 mas en la app)` |

**Alergias y contactos son lo primordial.** Una alergia desconocida mata en minutos; un
contacto permite obtener el resto de la historia clínica por teléfono. Todo lo demás se puede
consultar después.

El marcador `(+N mas en la app)` es obligatorio cuando se trunca. Una lista recortada en
silencio es peor que una lista corta, porque parece completa.

### 2.4 Reglas de contenido

- **Severidad en las alergias**: `Penicilina (severa)`. Cuesta ~10 caracteres por alergia y
  cambia la conducta médica.
- **Sin tildes ni ñ**: en UTF-8 cada `á` ocupa 2 bytes en vez de 1. Quitarlas ahorra 10–15%
  del espacio.
  ```ts
  const sinTildes = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  ```
  Ojo: también convierte `ñ` → `n` ("Muñoz" → "Munoz").
- **Fecha de generación siempre.** Un dato médico sin fecha no se puede evaluar.
- **Teléfonos sin espacios ni guiones**: `+50688888888` es marcable de un toque.
- **Edad calculada, no solo la fecha**: `28a (23/04/1998)`. La edad sirve para dosificar; la
  fecha identifica.
- **Solo medicamentos activos.** Un medicamento pausado puede llevar a evaluar mal una interacción.
- **Sección vacía no se imprime.** `ALERGIAS` seguido de nada confunde: ¿no tiene, o no cargó?
- **No incluir**: cédula, dirección, número de seguro. Alto valor para robo de identidad,
  bajo valor para atender una emergencia.

### 2.5 Capacidad

| Caracteres | Comportamiento |
|---|---|
| < 500 | Escanea al instante, incluso con mala luz |
| 500–1000 | Funciona, requiere pulso |
| > 1000 | Poco fiable en emergencia |

Si aun con los topes el texto pasa de ~700, **mostrar el QR igual** con un aviso en pantalla de
que puede costar escanear. Nunca bloquearlo.

### 2.6 Reglas técnicas

```tsx
<QRCode
  value={texto}
  size={260}
  ecl="M"           // en pantalla; "H" para la version impresa
  quietZone={12}    // margen blanco: sin el, muchos escaneres fallan
  color="#000000"
  backgroundColor="#FFFFFF"
/>
```

- **`ecl`** = corrección de errores: `L`=7%, `M`=15%, `Q`=25%, `H`=30%. Más redundancia = QR
  más denso para los mismos datos. En pantalla limpia `M` sobra; en un carnet impreso que se
  dobla y ensucia, `H`.
- **`quietZone`** es obligatorio en la práctica.
- **Blanco y negro puros.** Nada de la paleta teal: el color reduce la tasa de lectura.
- **Subir el brillo al máximo** con `expo-brightness` mientras la pantalla esté visible, y
  devolverlo al salir. Un QR al 20% de brillo, de noche, no escanea.

### 2.7 Forma del constructor

Función pura sobre datos que **ya están en el dispositivo** (los observables de Legend-State).
Sin `await`, sin red — por eso funciona offline por construcción.

```ts
export function armarQREmergencia(
  perfil, alergias, contactos, condiciones, medicamentos
): string

function seccion(titulo: string, lineas: string[], tope?: number): string {
  if (lineas.length === 0) return ''
  const visibles = tope ? lineas.slice(0, tope) : lineas
  const resto = lineas.length - visibles.length
  const extra = resto > 0 ? `\n(+${resto} mas en la app)` : ''
  return `\n${titulo}\n${visibles.join('\n')}${extra}`
}
```

---

## 3. Exportación

Dos entregables: la imagen del QR y un archivo que el usuario guarde.

```tsx
const refQR = useRef<any>(null)

<QRCode value={texto} getRef={(c) => (refQR.current = c)} ... />

// PNG en base64, sin librerias extra
refQR.current?.toDataURL((base64: string) => { /* ... */ })
```

- **Imagen** → escribir el archivo y pasarlo a `expo-sharing`
- **Carnet en PDF** → `expo-print` con `printToFileAsync({ html })`, incrustando el base64 en
  `<img src="data:image/png;base64,...">`

El PDF es lo importante: imprimible, cabe en la billetera, y funciona cuando el teléfono está
roto o sin batería — un escenario de emergencia bastante real.

⚠️ **`expo-file-system` 19 (SDK 54) cambió de API.** Los tutoriales usan
`FileSystem.writeAsStringAsync(...)`, que ahora vive en `expo-file-system/legacy` y emite
advertencia de deprecación. La API actual es la de clases (`new File(...)`).

---

## 4. QR de expediente — pendiente

**Falta decidir a dónde apunta la URL.** Opciones, de menor a mayor trabajo:

1. **Edge Function de Supabase** que reciba un token y devuelva HTML — sin proyecto nuevo
2. **Sitio estático** (Vercel/Netlify) que consulte Supabase con el token
3. **Expo web** — `app.json` ya tiene `"bundler": "metro"`

La 1 es la más directa. Hace falta además una tabla de tokens: identificador aleatorio, fecha
de expiración, y qué secciones expone. Eso es lo que da revocación y caducidad.

Aquí **sí** el usuario elige qué información se comparte.

---

## 5. Librerías

Verificadas contra Expo SDK 54:

```bash
npx expo install react-native-svg      # 15.12.1, viene en el SDK
npm install react-native-qrcode-svg    # 6.3.21, JS puro, funciona en Expo Go

# opcionales segun alcance
npx expo install expo-brightness       # ~14.0.8
npx expo install expo-print            # ~15.0.8
npx expo install expo-sharing          # ~14.0.8
npx expo install expo-file-system      # ~19.0.23
```

`react-native-qrcode-svg` no tiene código nativo: solo depende de `react-native-svg`, que sí
está en el SDK. **No hace falta development build.**

**No se necesita `expo-camera`**: no hay escáner dentro de la app.

---

## 6. Decisiones abiertas

1. **¿La pantalla del QR de emergencia es accesible sin iniciar sesión?** Un QR de emergencia
   detrás de un login sirve de poco si el dueño está inconsciente — pero abrirlo choca de frente
   con la privacidad. **Sin resolver.**
2. Destino de la URL del QR de expediente (§4).
3. Si se preserva la `ñ` en apellidos a costa de 1 byte por cada una.

---

## 7. Próximos pasos

1. Instalar `react-native-svg` + `react-native-qrcode-svg`
2. `armarQREmergencia()` como función pura + pruebas de longitud con datos reales
3. Pantalla del QR con brillo al máximo
4. Exportación a PNG y PDF
5. Diseñar el QR de expediente (requiere resolver §4)
