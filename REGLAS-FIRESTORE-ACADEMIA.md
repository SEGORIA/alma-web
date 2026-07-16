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

Firebase Console → **Firestore Database** → pestaña **Reglas**.

**Agrega** estos bloques `match` dentro de `match /databases/{database}/documents { … }`,
**sin borrar** las reglas que ya tengas para las demás colecciones
(`clientes`, `portales`, `equipo`, `leads`, `briefs`, etc.).

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // — helper: ¿el usuario autenticado es del equipo?
    function esAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // — Allowlist de admins: cada quien lee solo su propio doc; nadie escribe
    //   desde el cliente (se administra a mano en la consola).
    match /admins/{uid} {
      allow get: if request.auth != null && request.auth.uid == uid;
      allow list, write: if false;
    }

    // — Cursos y recursos: lectura pública; solo el equipo escribe.
    match /cursos/{cursoId} {
      allow read: if true;
      allow write: if esAdmin();
    }
    match /recursos/{recursoId} {
      allow read: if true;
      allow write: if esAdmin();
    }

    // — Estudiantes: cada quien lee/escribe SOLO sus propios datos y progreso.
    match /estudiantes/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /inscripciones/{cursoId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // … aquí van tus reglas existentes para clientes, portales, equipo, etc. …
  }
}
```

> Nota: si tus reglas actuales terminan con un `match /{document=**}` abierto
> (`allow read, write: if true;`), esas colecciones nuevas quedarían abiertas de
> todos modos. Lo ideal es ir cerrando ese comodín, pero como mínimo agrega los
> bloques de arriba para `admins` y `estudiantes`, que son los que protegen
> datos sensibles.

---

## 4. Sembrar los recursos gratis

Una vez desplegado `alma-web`, entra a **/admin/academia → pestaña 🎁 Recursos
gratis** y pulsa **"📦 Cargar los 7 Hacks iniciales"** (aparece solo cuando la
lista está vacía). Eso crea los 7 prompts de Instagram como recursos
administrables. A partir de ahí puedes editarlos, despublicarlos o agregar más.
