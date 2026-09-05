# Despliegue de Integra

Guía para llevar Integra a producción y para entender cómo queda desplegada una vez publicada.

El sistema se despliega en **tres piezas**, cada una con su propia herramienta:

| Pieza | Dónde vive | Herramienta | Se despliega cuando |
|---|---|---|---|
| **Base de datos** | `db/schema.ts` → `drizzle/` | `drizzle-kit migrate` | Cambia el modelo de datos |
| **Edge Function** | `supabase/functions/expediente/` | Supabase CLI | Cambia la lógica del expediente compartido |
| **Aplicación móvil** | raíz del proyecto | EAS Build | Cada versión publicada |

**El orden importa:** base de datos → Edge Function → aplicación. La app asume que las tablas, las políticas y el bucket de imágenes ya existen; publicarla antes deja al usuario con pantallas vacías y errores de permisos.

> Todas las rutas son relativas a `integra-app/integra-app/`.

---

## Cómo queda desplegado

```
   ┌─────────────────────┐
   │   Aplicación móvil  │   Android (Play Store / APK)
   │   Expo SDK 57       │   iOS (App Store)
   └──────────┬──────────┘
              │  HTTPS + JWT del usuario
              ▼
   ┌─────────────────────────────────────────────┐
   │              Supabase (producción)          │
   │                                             │
   │  Auth ──── correo/contraseña + Google       │
   │  Postgres ─ 12 tablas, RLS en todas         │
   │  Storage ── bucket `avatares`               │
   │  Edge Fn ── `expediente` (QR de emergencia) │
   └─────────────────────────────────────────────┘
```

- **Todo el estado del usuario vive en Supabase.** No hay servidor propio que mantener.
- **La autorización se impone en la base de datos**, mediante políticas RLS. La aplicación no decide qué puede ver cada quien; solo pregunta.
- **La sesión se guarda localmente** en SQLite (`expo-sqlite/kv-store`) y se refresca sola mientras la app está en primer plano.
- **La Edge Function es el único punto público sin autenticación**: sirve el expediente de emergencia a quien escanee un QR válido y no vencido.

---

## Requisitos

| Herramienta / cuenta | Para qué | Costo |
|---|---|---|
| Node 20+ | Todo el tooling | — |
| EAS CLI (`npm i -g eas-cli`) | Compilar y publicar la app | — |
| Supabase CLI (`npm i -g supabase`) | Desplegar la Edge Function | — |
| Cuenta de Expo | Builds en la nube | Plan gratuito alcanza |
| Google Play Console | Publicar en Android | 25 USD, una vez |
| Apple Developer Program | Publicar en iOS | 99 USD al año |

Para Android se puede compilar y repartir un **APK sin cuenta de Play**. Para iOS no hay forma de instalar en un dispositivo físico sin cuenta de desarrollador.

---

# Parte 1 — Backend (Supabase)

## 1.1 Proyecto separado para producción

Creá un **proyecto de Supabase distinto** del que usás para desarrollar.

| Entorno | Proyecto | `DATABASE_URL` |
|---|---|---|
| Desarrollo | `integra-dev` | Apunta ahí de forma permanente |
| Producción | `integra-prod` | Solo mientras se despliega |

Sin esa separación, cualquier migración que probás en tu máquina toca los datos reales de los usuarios — y son datos de salud.

Del proyecto nuevo anotá tres cosas, en **Project Settings**:

- **Project URL** → `https://<ref>.supabase.co`
- **anon / publishable key** → la que consume la app
- **Connection string** (modo *Session*) → la `DATABASE_URL` para drizzle
- **Reference ID** → el `<ref>` que pide la CLI

## 1.2 Aplicar el esquema

El esquema se define en `db/schema.ts` y las migraciones generadas viven en `drizzle/` (27 archivos, de `0000` a `0026`). **No están en `supabase/migrations/`, así que `supabase db push` no las ve** — se aplican únicamente con drizzle.

`drizzle.config.ts` lee `DATABASE_URL` desde `.env.local`:

```bash
cd integra-app/integra-app

# En .env.local, apuntá DATABASE_URL al proyecto de producción
npx drizzle-kit migrate
```

Verificá que llegaron las doce tablas:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Deben aparecer:

```
alergias · articulos · citas · citas_resultado · condiciones
contactos_emergencia · exportaciones_expediente · medicamentos
mediciones · perfiles · tipo_medicion · tomas
```

Las migraciones también instalan los **triggers** del sistema: creación automática de perfil al registrarse (`0001`), generación de tomas a partir de un medicamento (`0015`) y normalización de mediciones (`0019`). Si el esquema quedó bien, esos triggers ya están.

> Volvé a apuntar `DATABASE_URL` a desarrollo apenas termines. Un `drizzle-kit push` accidental contra producción no tiene deshacer.

## 1.3 Verificar las políticas de seguridad

RLS es lo único que separa el expediente de una persona del de otra. Las políticas vienen en las migraciones, pero conviene confirmarlas:

```sql
-- Ninguna tabla debe aparecer en este resultado
select tablename from pg_tables
where schemaname = 'public' and rowsecurity = false;

-- Revisar que cada tabla tenga sus políticas
select tablename, policyname, cmd from pg_policies
where schemaname = 'public'
order by tablename;
```

`articulos` es la única con lectura pública — es contenido informativo. El resto compara `auth.uid()` contra `perfil_id`.

**Probalo de verdad antes de publicar:** creá dos cuentas, cargá un medicamento en cada una y confirmá desde el panel que ninguna ve los datos de la otra.

## 1.4 Crear el bucket de avatares

Los buckets **no los crean las migraciones de drizzle**. Este bloque se corre una vez, a mano, en cada proyecto nuevo:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "avatares_lectura_publica"
on storage.objects for select to public
using (bucket_id = 'avatares');

create policy "avatares_subir_propio"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatares_actualizar_propio"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatares_borrar_propio"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

La app sube cada avatar como `<perfil_id>/<uuid>.jpg`, así que la carpeta raíz siempre es el id del usuario. Por eso las políticas comparan `(storage.foldername(name))[1]` con `auth.uid()`: nadie puede sobrescribir la foto de otro aunque conozca la ruta.

La lectura es pública porque las fotos se muestran por URL directa. El límite de 2 MB y la lista de tipos MIME evitan que el bucket se use para otra cosa.

## 1.5 Configurar la autenticación

### Correo y contraseña

**Authentication → Providers → Email:**

| Ajuste | Producción | Por qué |
|---|---|---|
| Confirm email | **Activado** | Sin confirmación, cualquiera se registra con un correo ajeno |
| Secure email change | Activado | Pide confirmación en la dirección vieja y en la nueva |
| Minimum password length | 8 o más | El default local es 6 |

### URLs de redirección

**Authentication → URL Configuration** — agregá el esquema de la app:

```
integra-app://
integra-app://auth/callback
```

El esquema sale de `"scheme": "integra-app"` en `app.json`, y `auth/callback` es la ruta que arma `makeRedirectUri()` en el login con Google. Sin estas URLs no vuelven ni los enlaces de confirmación de correo ni el flujo de Google.

### Google

**Authentication → Providers → Google:**

1. En Google Cloud Console, creá las credenciales OAuth del proyecto.
2. Como *Authorized redirect URI* poné la de Supabase: `https://<ref>.supabase.co/auth/v1/callback`.
3. Pegá el Client ID y el Client Secret en el panel de Supabase y activá el proveedor.

La app abre el navegador del sistema con `expo-auth-session`, recibe los tokens en `integra-app://auth/callback` y los entrega a `supabase.auth.setSession()`. Esto **solo funciona en builds nativas**, no en Expo Go.

### Plantillas de correo

**Authentication → Email Templates.** Las que vienen por defecto dicen "Supabase". En una app que maneja datos de salud, un correo con marca desconocida se lee como intento de estafa y baja la tasa de confirmación. Personalizalas antes de publicar.

## 1.6 Desplegar la Edge Function

`supabase/functions/expediente/` sirve los expedientes compartidos por QR. Corre con la **service role key**, que le da acceso completo a la base, y valida por su cuenta el token, la vigencia y las secciones que el usuario decidió compartir.

```bash
cd integra-app/integra-app

supabase login
supabase link --project-ref <ref-de-produccion>
supabase functions deploy expediente
```

La función está declarada en `supabase/config.toml` con **`verify_jwt = false`**: es intencional y necesario, porque quien escanea el QR —personal de emergencia, típicamente— no tiene cuenta en Integra. La autorización la hace la propia función contra la tabla `exportaciones_expediente`.

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan solas. Para cualquier otra variable:

```bash
supabase secrets set NOMBRE=valor
supabase secrets list
```

Verificá que responde — el token va **en la ruta**, no como parámetro:

```bash
curl -i "https://<ref>.supabase.co/functions/v1/expediente/<token>"
```

Un token inexistente debe devolver error, no un expediente vacío con `200`.

---

# Parte 2 — Aplicación móvil

## 2.1 Estado de la configuración

El proyecto ya está vinculado a EAS. En `app.json`:

```json
"extra": { "eas": { "projectId": "6907c350-776e-493c-b66f-8ffb0e054226" } }
```

Ese identificador **se versiona en git**: es lo que conecta el código con el proyecto en expo.dev. Si trabajás sobre un proyecto de Expo distinto, corré `eas init` de nuevo; si no, no lo toques.

```bash
eas login
eas whoami
```

Lo demás ya está resuelto y no requiere acción: los cuatro íconos son PNG (`icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`), la tipografía Lexend está registrada con `expo-font` y mapeada en `tailwind.config.js` (`font-lexend`, `font-lexend-bold`, `font-lexend-extrabold`), y `app.json` declara el permiso de Android que la app necesita (`RECORD_AUDIO`).

## 2.2 Antes de la primera build de iOS

`app.json` define `android.package` como `com.mrstevengz.integraapp`, pero el bloque de iOS todavía no tiene identificador. **Sin `bundleIdentifier` no se puede compilar para iOS:**

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.mrstevengz.integraapp"
}
```

Conviene usar el mismo identificador que Android para no mantener dos nombres del mismo producto. Una vez publicado en la App Store **no se puede cambiar**: cambiarlo equivale a publicar una app nueva, sin los usuarios de la anterior.

Si solo vas a compilar para Android, este paso no aplica.

## 2.3 Perfiles de build

`eas.json` ya define los tres perfiles:

```json
{
  "cli": { "version": ">= 21.0.1", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" } },
    "production":  { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

| Perfil | Qué produce | Para qué |
|---|---|---|
| `development` | Cliente de desarrollo con depurador | Programar con módulos nativos (Google, SQLite, cámara) |
| `preview` | APK instalable directo | Probar con usuarios reales antes de publicar |
| `production` | AAB para Play Store, IPA para App Store | Publicación |

**Por qué APK en preview y AAB en producción:** un APK se instala tocándolo, así que se puede pasar por WhatsApp a un grupo de prueba. Google Play exige AAB, que no es instalable a mano. Cada formato sirve a una etapa distinta.

**`appVersionSource: "remote"` con `autoIncrement`** hace que EAS lleve la cuenta del número interno de build. Sin eso habría que subir `versionCode` y `buildNumber` a mano en cada envío, y olvidarlo una vez basta para que la tienda rechace el paquete.

## 2.4 Variables de entorno

Las builds corren **en los servidores de Expo**, donde tu `.env.local` no existe — está en `.gitignore` y nunca se sube. La app necesita exactamente dos variables:

```bash
eas env:create --environment production \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://<ref-produccion>.supabase.co" \
  --visibility plaintext

eas env:create --environment production \
  --name EXPO_PUBLIC_SUPABASE_KEY \
  --value "<anon-key-de-produccion>" \
  --visibility plaintext

eas env:list --environment production
```

Repetí lo mismo con `--environment preview`, apuntando al proyecto que quieras probar.

### Por qué `plaintext` y no `secret`

Las variables `EXPO_PUBLIC_*` **quedan incrustadas en el binario al compilar**. Cualquiera que descargue el APK las puede leer. Marcarlas como secretas en EAS no las oculta del binario; solo te impide verlas a vos en el panel.

Y no es un problema: la clave anónima por sí sola no da acceso a nada. Toda la autorización la imponen las políticas RLS del punto 1.3. Ese es exactamente el modelo para el que la clave fue diseñada.

> **`DATABASE_URL` nunca va a EAS.** Es una credencial con permisos totales sobre la base y su único uso es `drizzle-kit` desde tu máquina. Si terminara en una variable `EXPO_PUBLIC_*`, quedaría dentro de la app de todos los usuarios y cualquiera podría leer o borrar la base entera.
>
> Lo mismo aplica a la **service role key**: vive solo en el entorno de la Edge Function.

## 2.5 Compilar

```bash
# APK de prueba
eas build --platform android --profile preview

# Producción
eas build --platform android --profile production
eas build --platform ios --profile production
```

La primera vez EAS pide las credenciales de firma. **Dejá que las genere y las guarde él** (`Generate new keystore`).

> Si perdés el keystore de Android no podés volver a publicar actualizaciones de esa app: hay que subirla como aplicación nueva y los usuarios existentes quedan varados en la versión vieja. Que EAS lo administre es la forma de no perderlo.

Como `/android` e `/ios` están en `.gitignore`, EAS corre `prebuild` en cada compilación y genera los proyectos nativos a partir de `app.json`. Todo lo que declares ahí —íconos, permisos, plugins, esquema— se aplica en ese momento.

La compilación tarda entre 10 y 25 minutos. El enlace de descarga sale en la consola y queda en expo.dev.

## 2.6 Publicar en las tiendas

```bash
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

Para Android hace falta una cuenta de servicio de Google Play; EAS guía el proceso la primera vez.

**Antes del envío**, preparalo en cada consola: descripción, capturas, clasificación de contenido y política de privacidad. Las dos tiendas exigen **una URL pública de política de privacidad** y la revisan; en una app que maneja datos médicos es lo primero que miran.

En el cuestionario de seguridad de datos de Google Play, declará que la app **recolecta datos de salud**, que viajan cifrados y que el usuario puede eliminarlos. Omitirlo es causa de retiro.

## 2.7 Versionado

La versión visible para el usuario está en `app.json`:

```json
"version": "1.0.0"
```

Subila con versionado semántico: parche para correcciones, menor para funciones nuevas, mayor para cambios que rompen compatibilidad.

El número interno (`versionCode` en Android, `buildNumber` en iOS) lo maneja EAS gracias a `autoIncrement` + `appVersionSource: "remote"`. **No los pongas en `app.json`.**

---

# Parte 3 — Actualizaciones sin recompilar (opcional)

Hoy el proyecto **no tiene `expo-updates` instalado**, así que cada cambio requiere una build nueva y pasar por revisión de tienda. Si querés habilitar actualizaciones OTA:

```bash
npx expo install expo-updates
eas update:configure
```

`eas update:configure` agrega un `channel` a cada perfil de `eas.json`. Ese canal es lo que conecta una build con su rama de actualizaciones: una build de `production` solo recibe updates publicadas en el canal `production`.

Después de eso hay que **compilar y publicar una vez más** — las builds anteriores no saben buscar actualizaciones. De ahí en adelante:

```bash
eas update --branch production --message "Corrige el cálculo de la próxima toma"
```

## Qué se puede actualizar por OTA y qué no

| Sale por OTA | Necesita recompilar y reenviar |
|---|---|
| Pantallas, componentes, estilos | Agregar o quitar un módulo nativo |
| Lógica de estado y consultas | Cambiar permisos en `app.json` |
| Textos, validaciones, correcciones | Cambiar ícono, nombre o esquema |
| Ajustes de NativeWind | Subir la versión del SDK de Expo |

La regla práctica: **si tocaste `app.json`, `package.json` o instalaste algo con `expo install`, hay que recompilar.** Todo lo demás va por OTA.

---

# Lista de verificación de release

**Backend**

- [ ] Proyecto de producción creado, separado del de desarrollo
- [ ] Migraciones aplicadas — las doce tablas presentes
- [ ] Ninguna tabla con `rowsecurity = false`
- [ ] Aislamiento probado con dos cuentas reales
- [ ] Bucket `avatares` creado con sus cuatro políticas
- [ ] Confirmación de correo activada
- [ ] `integra-app://` e `integra-app://auth/callback` en las URLs permitidas
- [ ] Proveedor de Google configurado con su redirect URI
- [ ] Plantillas de correo personalizadas
- [ ] Edge Function `expediente` desplegada y respondiendo

**Antes de compilar**

- [ ] `ios.bundleIdentifier` definido (solo si se compila para iOS)
- [ ] `version` subida en `app.json`
- [ ] `npx tsc --noEmit` sin errores
- [ ] Variables cargadas en EAS y apuntando a **producción**

**Prueba en dispositivo, con la build de `preview`**

- [ ] Registro con correo nuevo y confirmación
- [ ] Inicio de sesión con Google
- [ ] Inicio y cierre de sesión repetidos, sin datos cruzados entre cuentas
- [ ] Alta de medicamento y generación automática de tomas
- [ ] Marcar, posponer y omitir una dosis
- [ ] Registrar una medición y ver su gráfica
- [ ] Crear una cita y registrar su resultado
- [ ] Subir y cambiar la foto de perfil
- [ ] Generar el QR de emergencia y abrirlo desde otro dispositivo
- [ ] Exportar el PDF del expediente
- [ ] Revocar una exportación y confirmar que el QR deja de funcionar
- [ ] Cerrar y abrir la aplicación: la sesión y los datos persisten

**Publicación**

- [ ] Política de privacidad publicada en una URL accesible
- [ ] Formulario de datos de salud declarado en Play Console
- [ ] Capturas y descripción cargadas
- [ ] Tag de la versión en git

---

# Marcha atrás

**Una build que salió mal.** En Play Console se detiene el despliegue y se promueve la versión anterior. En App Store Connect se retira de la venta y se reenvía la anterior. Es lento: la revisión de Apple puede tardar días.

**Una actualización OTA que salió mal** (si tenés `expo-updates` habilitado):

```bash
eas update:list --branch production
eas update:republish --group <id-de-la-version-anterior>
```

Es inmediato y no pasa por revisión. Por eso conviene sacar por OTA todo lo que se pueda.

**Una migración que salió mal.** No hay deshacer automático. Por eso importa revisar el `.sql` generado antes de aplicarlo y tener respaldos. Supabase respalda a diario en los planes pagos; **en el plan gratuito no hay respaldos automáticos** y una migración destructiva es irreversible.

Antes de cualquier migración con `DROP` o `ALTER COLUMN` en producción, sacá un respaldo manual:

```bash
supabase db dump --project-ref <ref> -f respaldo-$(date +%F).sql
```

---

# Referencia rápida

```bash
# --- Base de datos ---
npx drizzle-kit generate          # generar migración tras editar db/schema.ts
npx drizzle-kit migrate           # aplicar migraciones pendientes
supabase db dump --project-ref <ref> -f respaldo.sql

# --- Edge Function ---
supabase link --project-ref <ref>
supabase functions deploy expediente
supabase functions logs expediente

# --- Aplicación ---
eas env:list --environment production
eas build --platform android --profile preview
eas build --platform all --profile production
eas submit --platform android --profile production
eas build:list                    # historial y enlaces de descarga
```

