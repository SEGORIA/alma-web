# Alma Agencia Creativa — alma-web

Sitio público, panel de administración interno y portales de clientes/equipo
de **Alma Agencia Creativa** (Manizales, Colombia). React + TypeScript + Vite
en el frontend, Firebase (Auth + Firestore) como backend, y unas pocas
funciones serverless en Vercel (`api/*.ts`) para envío de correos y gestión
de cuentas de estudiante.

## Repos hermanos

- **`alma-edu`** — el LMS público de la Academia, desplegado en
  `edu.almaagenciacreativa.com`. Repo independiente que lee/escribe el mismo
  proyecto de Firebase que este. Los cursos y recursos se administran desde
  `/admin/academia` en este repo.

## Stack

- **Frontend**: React 19 + TypeScript + Vite, React Router, Framer Motion,
  Tailwind (solo en algunas páginas), React Helmet Async para SEO.
- **Backend de datos**: Firebase Firestore. `src/lib/db.ts` centraliza todo
  el acceso: cada colección tiene sus funciones `get*`/`create*`/`update*`,
  con fallback a datos estáticos (`src/data/*.ts`) cuando Firebase no está
  configurado, para poder desarrollar sin credenciales.
- **Auth**: Firebase Auth para el equipo (`/admin/*`), protegido además por
  una allowlist en Firestore (colección `admins`, ver `isAdmin()` en
  `db.ts`) — sin esa allowlist, cualquier cuenta del mismo proyecto de
  Firebase Auth (incluyendo estudiantes de la Academia) podría entrar al
  panel. El portal de clientes y el de equipo usan token/PIN en vez de
  cuentas reales.
- **Subida de archivos**: Cloudinary (unsigned upload), no Firebase Storage.
- **Funciones serverless** (`api/*.ts`, Vercel): envío de correos (kit
  gratuito, solicitudes del portal, briefs) y gestión de cuentas de alumno
  (Firebase Admin SDK). El código compartido entre funciones vive en
  `server-utils/` — **no** en `api/_algo.ts`: un archivo con prefijo `_`
  dentro de `api/` puede quedar excluido del bundle de la función en
  producción aunque compile bien en local.

## Empezar

```bash
npm install
cp .env.example .env   # completa tus credenciales (ver comentarios en el archivo)
npm run dev
```

Sin `.env`, el sitio público funciona igual (con los datos estáticos de
`src/data/`), pero el panel admin y los portales necesitan Firebase
configurado.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm test` | Corre la suite de tests (Vitest) una vez |
| `npm run test:watch` | Tests en modo watch |
| `npm run preview` | Sirve el build de producción localmente |

## Tests

Vitest cubre por ahora las funciones puras más sensibles (limpieza de datos
antes de escribir a Firestore, generación de slugs, escape de HTML en los
templates de correo, rate limiting). No hay tests de componentes React
todavía — para cambios de UI, verificar manualmente en el navegador sigue
siendo necesario.

## Estructura

```
src/
  pages/           páginas públicas, portales (cliente/equipo) y todo /admin
  sections/        secciones de la landing (Hero, Academia, LeadMagnet…)
  components/      componentes compartidos (uploaders, feedback, admin/*)
  data/            tipos + datos estáticos de fallback (uno por dominio)
  lib/             acceso a Firestore (db.ts), auth, storage, analytics…
  hooks/           hooks compartidos (useAuth, useIsMobile…)
api/               funciones serverless de Vercel (correos, alumnos)
server-utils/      código compartido por las funciones de api/ (NO api/_x.ts)
```

## Reglas de Firestore

Están versionadas en [`firestore.rules`](firestore.rules) y se aplican con
`firebase deploy --only firestore:rules`. **No las edites solo en la consola
de Firebase**: el repo y el proyecto se separan y es muy fácil dejar una
colección sin regla. Cuando eso pasa el sitio no falla de forma visible —
`db.ts` cae al fallback estático de `src/data/`, así que la web sigue en pie
mostrando datos viejos mientras el panel deja de tener efecto. Si sospechas
de algo así, abre la consola del navegador y busca errores `[db] …:
permission-denied`.

## Despliegue

Vercel, con deploy automático al hacer push a `main`. Las variables de
entorno (Firebase, Cloudinary, Gmail/Resend, `FIREBASE_SERVICE_ACCOUNT`) se
configuran en el dashboard de Vercel del proyecto — ver `.env.example` para
la lista completa y de dónde sacar cada una.
