import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    /* Nota sobre `react-hooks/set-state-in-effect`:
       se deja en "error" a propósito, pero las páginas admin que cargan sus datos
       de Firestore al montar (`useEffect(() => { load() }, [])`) lo suprimen línea
       a línea. La regla marca cualquier función llamada desde un efecto que acabe
       en un setState —incluso después de un await—, así que ese patrón no tiene
       arreglo sin mover el fetching a React Query o a loaders del router. Mientras
       tanto, mantenerla activa sigue detectando los casos que sí son evitables. */
    rules: {
      // Convención del proyecto: un prefijo _ marca algo intencionalmente sin usar
      // (p. ej. descartar una key al desestructurar: const { _omit, ...resto } = obj).
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
  },
])
