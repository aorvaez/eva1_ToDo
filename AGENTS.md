Esta es una aplicación móvil Expo/React Native. Prioriza patrones mobile-first, rendimiento y compatibilidad multiplataforma.

## Expo ha cambiado — no confíes en tus datos de entrenamiento

Expo introduce cambios incompatibles en cada versión del SDK. Las APIs que recuerdas probablemente fueron renombradas, movidas o eliminadas. Antes de escribir código que toque una API de Expo, EAS o React Native:

1. Lee la versión mayor del paquete `expo` en `package.json`.
2. Consulta la documentación versionada correspondiente: `https://docs.expo.dev/versions/v<major>.0.0/`
3. Para cualquier otra cosa, consulta https://docs.expo.dev/llms.txt — un índice de toda la documentación de Expo con correcciones a errores comunes de los LLM. Sigue sus enlaces a la página específica que necesites; nunca respondas de memoria.

## Comandos

Usa `bunx` en lugar de `npx` si el proyecto usa bun (existe `bun.lock`).

```bash
npx expo install <package>  # SIEMPRE usar en vez de npm/yarn/pnpm/bun add — resuelve versiones compatibles con el SDK
npx expo start              # iniciar el servidor de desarrollo
npx expo lint               # lint
npx tsc --noEmit            # verificación de tipos
npx expo-doctor             # diagnosticar problemas de dependencias y configuración
npx expo install --fix      # corregir versiones de paquetes incompatibles
```

Ejecuta lint y la verificación de tipos antes de dar cualquier tarea por terminada.

## Navegación y enrutamiento

- Usa **Expo Router** para toda la navegación. Las rutas viven en `src/app/` — cada archivo ahí es una pantalla, y los archivos `_layout.tsx` definen los navegadores. Mantén el código que no es de rutas (componentes, hooks, utilidades) fuera de `src/app/`.
- Importa `Link`, `router` y `useLocalSearchParams` desde `expo-router`.
- Documentación: https://docs.expo.dev/router/introduction.md

## Compilación con EAS

Usa EAS para compilar, firmar y enviar la app en la nube (`eas build`, `eas submit`) y para publicar actualizaciones por aire (`eas update`) — sin necesidad de Xcode ni Android Studio locales. Ejecuta EAS CLI como `bunx eas-cli <comando>` en proyectos con Bun, o `npx eas-cli@latest <comando>` en caso contrario; sustitúyelo por `eas` a secas en los ejemplos de la documentación.
Documentación: https://docs.expo.dev/eas/index.md

## Reglas

- Si los directorios `ios/` y `android/` no existen, se generan (Continuous Native Generation). Nunca los crees ni edites a mano — configura el comportamiento nativo en `app.json` y con config plugins.
- Expo Go solo incluye sus módulos nativos integrados. Tras añadir una librería con código nativo, la app necesita un development build: `npx expo run:ios|android` en local, o `eas build --profile development`.
- Prefiere los módulos recomendados de Expo sobre librerías de terceros, y revisa tus skills disponibles antes de añadir dependencias. Documentación: https://docs.expo.dev/versions/latest/index.md
