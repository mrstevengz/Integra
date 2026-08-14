# Documentación de Integra

> Documentación técnica completa del proyecto. Escrita para que una persona que nunca
> ha visto el código pueda instalarlo, entenderlo y contribuir.

**Última actualización:** 2026-08-13
**Rama documentada:** `feature/medicion-cita-mvp`
**Repositorio:** https://github.com/mrstevengz/Integra 

---

## Por dónde empezar

Si es tu primer día en el proyecto, lee en este orden:

| # | Documento | Qué vas a aprender | Tiempo |
|---|---|---|---|
| 1 | [Instalación y ejecución](01-instalacion-y-ejecucion.md) | Clonar, instalar, correr la app, versiones, comandos y flujo de Git | 30 min |
| 2 | [Arquitectura general](02-arquitectura-general.md) | Qué es local-first y cómo viaja un dato desde la pantalla hasta Postgres | 20 min |
| 3 | [Fundamentos de React y componentes](03-fundamentos-react-componentes.md) | Componentes, props, hooks, JSX y estilos con NativeWind | 40 min |
| 4 | [Carpeta `app/` — Expo Router](04-carpeta-app-expo-router.md) | Cómo funciona la navegación por archivos | 30 min |
| 5 | [Carpeta `state/` — Legend-State](05-carpeta-state-legend-state.md) | Observables, sincronización y offline | 45 min |
| 6 | [Carpeta `lib/`](06-carpeta-lib.md) | Cliente de Supabase y configuración de sincronización | 15 min |
| 7 | [Carpeta `features/`](07-carpeta-features.md) | Componentes reutilizables, esquemas y lógica de negocio | 30 min |
| 8 | [Carpeta `db/` — Drizzle y Supabase](08-carpeta-db-drizzle.md) | Esquema, migraciones y Row Level Security | 45 min |
| 9 | [Zod y React Hook Form](09-zod-react-hook-form.md) | Cómo se construye y valida un formulario | 30 min |
| 10 | [Referencia por archivo](10-referencia-por-archivo.md) | Tabla de cada archivo del proyecto con sus librerías y versiones | consulta |

Si solo necesitas **levantar el proyecto**, con el documento 1 es suficiente.

---

## Mapa rápido del repositorio

```
Integra/                                 ← raíz del repositorio Git
└── integra-app/
    └── integra-app/                     ← raíz de la app Expo (aquí van los comandos)
        ├── src/
        │   ├── app/                     ← pantallas y navegación (expo-router)
        │   ├── features/                ← componentes reutilizables + esquemas Zod + lógica
        │   ├── lib/                     ← configuración de Supabase y Legend-State
        │   └── state/                   ← un archivo por tabla sincronizada
        ├── db/
        │   └── schema.ts                ← esquema de la base de datos (Drizzle)
        ├── drizzle/                     ← migraciones SQL generadas
        ├── docs/                        ← esta documentación
        ├── assets/                      ← íconos e imágenes
        ├── .env.local                   ← secretos (NO se versiona)
        ├── app.json                     ← configuración de Expo
        ├── drizzle.config.ts
        ├── tailwind.config.js
        ├── babel.config.js
        ├── metro.config.js
        └── package.json
```

Regla mental para saber dónde va un archivo nuevo:

| Si el archivo... | va en |
|---|---|
| es una pantalla que el usuario abre | `src/app/` |
| se reutiliza en más de una pantalla | `src/features/<área>/` |
| define la forma de una tabla y su sincronización | `src/state/` |
| configura una librería de forma global | `src/lib/` |
| define una tabla de Postgres | `db/schema.ts` |

---

## Convenciones del proyecto

**Idioma.** El código, los nombres de variables y los comentarios están en **español sin
tildes** (`medicamento`, `programada_para`, `//Funcion para...`). La documentación sí lleva
tildes. Mantené esa separación: cambiar la convención a medias es peor que cualquiera de las dos.

**El sufijo `$`.** Toda variable que termina en `$` es un *observable* de Legend-State, no un
valor normal. `perfil$` es el observable; `perfil$.get()` es el objeto. Es solo una convención
de nombres, pero es la que evita confundir los dos.

**Nombres de archivos.**

| Patrón | Significado | Ejemplo |
|---|---|---|
| `PascalCase.tsx` | Componente de React | `CampoTexto.tsx` |
| `kebab-case.ts` | Lógica, helpers o esquemas | `generar-tomas.ts` |
| `*-schema.ts` | Esquema de validación con Zod | `medicacion-schema.ts` |
| `_layout.tsx` | Layout de expo-router | `src/app/(tabs)/_layout.tsx` |
| `(carpeta)` | Grupo de rutas (no aparece en la URL) | `src/app/(tabs)/` |
| `[archivo].tsx` | Ruta dinámica | `[articuloId].tsx` |

**Alias de importación.** `@/` apunta a `src/`, configurado en `tsconfig.json`:

```ts
import { perfil$ } from '@/state/usuario'      // ✅
import { perfil$ } from '../../state/usuario'  // ⛔ evitar
```

---

## Documentación anterior

En la raíz del proyecto existen archivos de documentación previos:
`DOCUMENTACION.md`, `db/SCHEMA.md`, `src/lib/LIB.md`, `src/state/STATES.md` y
`src/features/FEATURES.md`.

Esta carpeta `docs/` los reemplaza y los corrige. Los archivos viejos se mantienen por ahora
para no romper enlaces, pero **contienen datos desactualizados**; las diferencias están
señaladas en [10-referencia-por-archivo.md](10-referencia-por-archivo.md#anexo-correcciones-a-la-documentación-anterior).

---

## Estado actual del proyecto

| Área | Estado |
|---|---|
| Navegación y pestañas nativas | ✅ Funcionando |
| Estilos (NativeWind) | ✅ Funcionando |
| Autenticación (registro / login / cierre de sesión) | ✅ Funcionando |
| Perfil y expediente (condiciones, alergias, contactos) | ✅ Funcionando |
| Artículos (wiki, solo lectura) | ✅ Funcionando |
| Medicación (medicamentos, horarios, tomas del día) | ✅ Funcionando |
| Mediciones (tipos, registro, historial) | 🔧 En desarrollo |
| Citas | ⛔ Pendiente |
| Notificaciones push | ⛔ Pendiente |

### Problema conocido y abierto

> ⚠️ **Conflicto de clave única al usar dos dispositivos.**
> `generarTomasPendientes()` puede crear tomas duplicadas cuando el caché local está
> desactualizado, lo que produce el error
> `duplicate key value violates unique constraint "tomas_medicamento_programada_unq"`.
> La causa está identificada (el guard usa `lastSync`, que se restaura desde el caché, en lugar
> de `isLoaded`) pero **la corrección todavía no está aplicada**.
> Ver [05-carpeta-state-legend-state.md](05-carpeta-state-legend-state.md#58-problema-abierto-conflicto-de-clave-única).
