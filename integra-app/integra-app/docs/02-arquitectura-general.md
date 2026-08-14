# 2. Arquitectura general

> Qué es Integra, qué significa "local-first" en la práctica, y cómo viaja un dato desde que
> el usuario toca la pantalla hasta que llega a Postgres.

---

## 2.1 Qué es la aplicación

**Integra** es una app móvil de salud personal. El paciente lleva el control de:

- sus **medicamentos** y las **tomas** de cada día,
- sus **mediciones** clínicas (glucosa, presión, peso, temperatura),
- sus **citas** médicas,
- su **expediente** (perfil, condiciones, alergias, contactos de emergencia),

y además consulta una **wiki de artículos** sobre condiciones médicas.

### Pestañas

| Ruta | Pestaña | Propósito |
|---|---|---|
| `src/app/(tabs)/index.tsx` | Inicio | Resumen del día |
| `src/app/(tabs)/medicacion/` | Medicación | Tratamientos, horarios y tomas |
| `src/app/(tabs)/medicion/` | Mediciones | Glucosa, presión, peso |
| `src/app/(tabs)/cita.tsx` | Citas | Agenda médica |
| `src/app/(tabs)/expediente/` | Expediente | Perfil, diagnósticos y contactos |

> **Nota histórica:** el proyecto empezó como PWA en Next.js y fue migrado a Expo. Si en el
> historial de Git encontrás `next.config.ts` o `public/sw.js`, son de esa etapa y ya no aplican.

---

## 2.2 Local-first: la decisión que condiciona todo

**La app funciona sin internet.** Los datos se guardan primero en el teléfono y se sincronizan
con el servidor cuando hay conexión.

Esto no es un detalle de implementación, es la premisa de diseño. Un paciente tiene que poder
registrar que se tomó una pastilla en un consultorio sin señal, en un bus, o en una zona rural.

### Los dos flujos

**Con conexión:**

```
Carga datos locales (instantáneo)
      ↓
Pide al servidor lo que cambió
      ↓
Actualiza la pantalla y el SQLite local
```

**Sin conexión:**

```
Carga datos locales (instantáneo)
      ↓
El usuario escribe → se guarda en SQLite y entra en una cola de pendientes
      ↓
Vuelve el internet → la cola se envía → llega lo nuevo del servidor
```

En **ningún** caso la pantalla espera a la red para mostrar algo. Por eso no vas a encontrar
`useEffect` + `fetch` + estados de carga en este código: leer el observable es lo que dispara la
petición, y el resultado ya está en disco desde la vez anterior.

### Consecuencias en el diseño

| Decisión | Por qué |
|---|---|
| Las llaves primarias son **UUID**, no enteros autoincrementales | Sin conexión no hay base de datos que asigne un `serial`. El dispositivo genera el ID con `Crypto.randomUUID()` |
| Toda tabla tiene `created_at`, `updated_at` y `deleted` | Son las columnas que necesita el motor de sincronización |
| **No se borra físicamente nada** — se marca `deleted = true` | Un `DELETE` real es invisible para un teléfono que estaba offline. Marcar `deleted` es un *cambio* que sí se puede sincronizar |
| `updated_at` lo escribe un **trigger** de Postgres, nunca el cliente | Jamás confíes en el reloj de un teléfono para resolver conflictos |

---

## 2.3 Las cuatro capas

```
┌──────────────────────────────────────────────────────────┐
│  src/app/          PANTALLAS                             │
│  Rutas de expo-router. Leen observables y renderizan.    │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────┐
│  src/features/     COMPONENTES, ESQUEMAS Y LÓGICA        │
│  Campos de formulario, esquemas Zod, reglas de negocio.  │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────┐
│  src/state/        DATOS SINCRONIZADOS                   │
│  Un observable por tabla + helpers de consulta.          │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────┐
│  src/lib/          CONFIGURACIÓN                         │
│  Cliente de Supabase y motor de sincronización.          │
└────────────────────────┬─────────────────────────────────┘
                         │
                    ═════╪═════  frontera de red
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Supabase          PostgREST → Postgres (con RLS)        │
│  Esquema definido en db/schema.ts (Drizzle)              │
└──────────────────────────────────────────────────────────┘
```

**La regla de dependencias apunta hacia abajo.** `app/` importa de `features/` y de `state/`;
`state/` importa de `lib/`; `lib/` no importa de nadie del proyecto. Si alguna vez necesitás que
`lib/` importe algo de `state/`, es señal de que la abstracción está mal cortada — y además crea
un ciclo de importación que Metro resuelve de formas impredecibles.

---

## 2.4 El recorrido de un dato

Seguimos un caso real: **el usuario marca que se tomó una pastilla**.

### Paso 1 — El componente llama a una acción

`src/features/medicacion/TomasDelDia.tsx` renderiza la fila y, al presionar, llama a:

```ts
// src/features/medicacion/acciones.ts
export function marcarTomada(tomaId: string) {
    toma$[tomaId].assign({
        estado: 'tomada',
        registrada_en: new Date().toISOString(),
        pospuesta_hasta: null
    })
}
```

No hay `fetch`, no hay `await`, no hay `setLoading(true)`. Una asignación.

### Paso 2 — Legend-State reacciona (todo esto es síncrono)

1. **Actualiza la memoria.** El observable cambia al instante.
2. **Re-renderiza solo lo que corresponde.** Los componentes suscritos a *esa toma* se
   actualizan; el resto de la lista no se toca.
3. **Escribe en SQLite.** El cambio sobrevive a que cierres la app.
4. **Encola la escritura remota.**

El usuario ya vio el resultado. Nada de lo anterior dependió de la red.

### Paso 3 — La escritura sale a la red

El plugin de Supabase arma la petición:

```
PATCH /rest/v1/tomas?id=eq.<uuid>
Authorization: Bearer <JWT del usuario>
```

Como el registro **ya existe** (tiene `created_at`), Legend-State lo trata como `UPDATE`.
Si no lo tuviera, sería un `INSERT`. Esa distinción es importante y es la raíz del bug abierto
que se documenta en [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).

### Paso 4 — Postgres valida

1. **RLS** comprueba `auth.uid() = perfil_id`. Si la fila no es tuya, la operación no afecta
   ninguna fila — silenciosamente.
2. El **trigger `handle_times`** pone `updated_at = now()` con el reloj del servidor.
3. Se aplican las restricciones (`NOT NULL`, `UNIQUE`, llaves foráneas).

### Paso 5 — La respuesta vuelve

La fila guardada regresa y Legend-State la escribe encima de la copia local, con los
`created_at` / `updated_at` reales del servidor. También avanza el marcador `lastSync`.

### Paso 6 — Los otros dispositivos se enteran

Con `realtime: true`, Supabase empuja el cambio por WebSocket a los demás dispositivos de esa
cuenta. Si uno está offline, lo recibirá en la próxima sincronización incremental.

### Si no había internet

Los pasos 1 y 2 ocurren igual. El paso 3 falla, la escritura queda en una cola persistida en
SQLite (`retrySync: true`) y se reintenta — incluso después de reiniciar la app.

---

## 2.5 El modelo de seguridad

La regla que gobierna todo el proyecto:

> **La llave anónima (`anon`) es pública.** Expo la incrusta dentro del bundle de JavaScript.
> Cualquiera que descargue el APK puede extraerla en menos de un minuto.
> **Row Level Security es lo único que protege los datos.**

Consecuencias prácticas:

1. **Toda tabla en `public` debe tener RLS activado.** Sin RLS, PostgREST expone la tabla y el
   rol `anon` tiene permisos completos por defecto. Una tabla sin RLS es una tabla que cualquiera
   puede borrar.
2. **RLS deniega por defecto.** Una política es un *permiso*, no una *restricción*.
   Tabla con RLS y cero políticas = nadie puede hacer nada (seguro, pero inútil).
   Tabla sin RLS = todos pueden hacer todo (peligroso).
3. **La llave `service_role` nunca sale del servidor.** Esa llave *ignora* todas las políticas.

### Defensa en profundidad

La misma restricción se declara en dos lugares:

```ts
// Postgres (db/schema.ts): la verdad, aplicada por la base de datos
pgPolicy('articulos_lectura_publica', { for: 'select', to: [anonRole, authenticatedRole], using: sql`true` })

// Cliente (src/state/articulos.ts): el espejo, aplicado por Legend-State
actions: ['read']
```

La política de Postgres es la que **realmente** protege. La línea del cliente hace que un
`.set()` accidental falle de inmediato en desarrollo, en vez de dar un 403 silencioso en
producción.

Ver [08-carpeta-db-drizzle.md](08-carpeta-db-drizzle.md) para el detalle de RLS.

---

## 2.6 Herramientas que deliberadamente NO usamos

| Herramienta | Por qué no |
|---|---|
| **TanStack Query** | La capa de sincronización de Legend-State ya cumple esa función. Tener las dos significaría dos cachés que se contradicen |
| **Redux / Zustand / Jotai** | `observable()` de Legend-State también cubre el estado local de UI |
| **AsyncStorage** | `expo-sqlite/kv-store` ofrece la misma API y ya es dependencia |
| **Drizzle como cliente en tiempo de ejecución** | Rompería RLS: se conectaría como dueño de las tablas, que salta todas las políticas |
| **`useState` para datos del servidor** | Se desincroniza del observable. El estado local se reserva para UI pura (modal abierto, campo enfocado) |

---

## 2.7 Dos trampas de mezclar RLS con local-first

**1. Las revocaciones son invisibles.** Con sincronización incremental el cliente pregunta
"¿qué cambió desde T?". Si una fila deja de cumplir la política, simplemente deja de aparecer —
no llega marcada como borrada. **La copia ya sincronizada se queda en el SQLite del dispositivo
para siempre.** Si algún día se implementa compartir datos entre usuarios (por ejemplo, un
médico que ve el expediente de un paciente), hay que diseñar una señal explícita de revocación.

**2. RLS controla filas, nunca columnas.** Si `mediciones` algún día tiene un campo
`notas_medico` que el paciente no debe leer, RLS no ayuda: eso requiere una tabla o una vista
aparte.

---

## 2.8 Autenticación y arranque

El flujo de sesión vive en [`src/state/auth.ts`](../src/state/auth.ts) y
[`src/app/_layout.tsx`](../src/app/_layout.tsx).

```
La app arranca
      ↓
supabase.auth recupera la sesión guardada en SQLite
      ↓
onAuthStateChange dispara → auth$.session.set(sesion), auth$.cargando.set(false)
      ↓
RootLayout lee auth$ y decide:
      ├── ¿hay sesión?  → <Stack.Protected guard={!!sesion}>  → (tabs) y (articulos)
      └── ¿no hay?      → <Stack.Protected guard={!sesion}>   → (auth)
```

Mientras `cargando` es `true` se muestra un `ActivityIndicator`. Sin ese estado, la app
parpadearía un instante en el login antes de saltar al contenido.

Al cerrar sesión, `cerrarSesion()` hace tres cosas en orden: invalida la sesión, resetea
**todas** las tablas sincronizadas y borra el resto del almacenamiento local. La bandera
`cerrandoSesion` bloquea la navegación hasta que la limpieza termine, para que ninguna pantalla
alcance a renderizar con datos a medio borrar.

---

## 2.9 Referencias

- [Guía local-first de Expo](https://docs.expo.dev/guides/local-first/)
- [Legend-State v3 — Persist & Sync](https://legendapp.com/open-source/state/v3/sync/persist-sync/)
- [Supabase — Local-first con Expo y Legend-State](https://supabase.com/blog/local-first-expo-legend-state)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
