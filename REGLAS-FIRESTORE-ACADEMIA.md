# Academia — pasos manuales en Firebase / Vercel

Estos pasos **no se pueden hacer desde el código** — hay que hacerlos a mano en
la consola de Firebase y en Vercel. Hazlos **antes de desplegar** los cambios de
`alma-web`, o el equipo quedará bloqueado fuera de `/admin` (ver paso 1).

---

## 1. Allowlist de administradores (⚠️ HAZLO ANTES DE DESPLEGAR)

Ahora `/admin/*` exige que tu usuario, además de tener sesión de Firebase Auth,
exista en una colección `admins`. Esto es lo que impide que un estudiante que se
registre en la Academia entre al panel de administración.

Para cada persona del equipo que hoy entra al admin:

1. Firebase Console → **Authentication** → pestaña **Users**.
2. Copia el **User UID** de esa persona (columna de la derecha).
3. Firebase Console → **Firestore Database** → **+ Iniciar colección** (o usar la
   existente) con ID de colección **`admins`**.
4. Crea un documento cuyo **ID de documento sea exactamente ese UID**. El
   contenido puede ser simple, p. ej. un campo `email` (string) con el correo.
5. Repite para cada miembro del equipo con acceso al admin.

> Si despliegas sin crear estos documentos, nadie podrá entrar a `/admin`.

---

## 2. Variables de entorno de `alma-edu` en Vercel

La Academia (`edu.almaagenciacreativa.com` / repo `alma-edu`) usa el **mismo
proyecto de Firebase** que el sitio principal. En el proyecto de Vercel de
`alma-edu`, agrega **exactamente las mismas** variables que ya tiene `alma-web`:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GA_MEASUREMENT_ID   (opcional, mismo ID de GA4)
```

---

## 3. Reglas de seguridad de Firestore

> **⚠️ Este paso ya no se hace desde aquí.** Las reglas completas del proyecto
> viven ahora en [`firestore.rules`](firestore.rules), en la raíz del repo.
>
> Antes, esta sección traía solo el bloque de Academia con una nota de "sin
> borrar tus reglas existentes". En la práctica el bloque se pegó **en lugar
> de** las reglas anteriores, y las ~20 colecciones del sitio (`config`,
> `equipo`, `proceso`, `precios_planes`, `portafolio`, `testimonios`, `faqs`,
> `categorias`, `precios_extras`, `kit_archivos`…) se quedaron sin regla, es
> decir, denegadas. El sitio no se rompió de forma visible: cayó al fallback
> estático de `src/data/` y estuvo sirviendo datos viejos, con todo lo que se
> editaba en `/admin` sin llegar nunca a la web pública.
>
> Por eso el archivo se versiona: para pegar **el archivo completo**, no
> fragmentos sueltos.

Para aplicarlas:

```bash
firebase deploy --only firestore:rules
```

Si el CLI pide re-autenticarse, primero `firebase login --reauth`. Como
alternativa, abre `firestore.rules`, copia **todo** el contenido y pégalo en
Firebase Console → **Firestore Database** → pestaña **Reglas** → **Publicar**.

Cada vez que cambien las reglas: edítalas en `firestore.rules`, despliega y
commitea el cambio, para que el repo y la consola no se separen otra vez.

---

## 4. Sembrar los recursos gratis

Una vez desplegado `alma-web`, entra a **/admin/academia → pestaña 🎁 Recursos
gratis** y pulsa **"📦 Cargar los 7 Hacks iniciales"** (aparece solo cuando la
lista está vacía). Eso crea los 7 prompts de Instagram como recursos
administrables. A partir de ahí puedes editarlos, despublicarlos o agregar más.
