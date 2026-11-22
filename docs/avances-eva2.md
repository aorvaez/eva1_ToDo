# Avances de la Evaluación 2

Registro de lo que se fue construyendo en la rama `eva2`, paso por paso. Cada paso indica el commit en el que quedó, las decisiones que se tomaron y cómo se probó.

Documentos relacionados: [README](../README.md) (estado actual de la app), [informe-eva1.md](informe-eva1.md) (informe original de la Evaluación 1) y [stack.md](stack.md) (decisiones técnicas).

---

## Resumen

| Paso | Qué se agregó | Commit | Estado |
|---|---|---|---|
| 0 | Rama `eva2` con el editor de descripción con formato y los documentos | `169b8cf`, `fda4e5d` | Hecho |
| 1 | Almacenamiento local de las tareas (AsyncStorage) | `e0a2bfa` | Hecho |
| 2 | Campos nuevos en la tarea: foto, lugar, clima | `c8f4ca3` | Hecho |
| 3 | Cámara: adjuntar foto | `c8f4ca3` | Hecho y probado en el celular |
| 4 | GPS: lugar donde se crea la tarea | `17befd1` | Hecho y probado en el celular |
| 4b | Nombre del lugar y clima actual | `d4ca624` | Hecho y probado en el celular |
| 5 | Cuentas con Firebase Auth | `abc7231` | Hecho y probado en el celular |
| 5b | Modo sin cuenta, opcional | `a76591a` | Hecho y probado en el celular |
| 6 | Sincronización con Firestore en tiempo real | `cefc779` | Hecho y probado en el celular |
| 7 | Importar tareas desde JSONPlaceholder | `69e19ff` | Hecho (pendiente probar en el celular) |
| 8 | Pruebas de importación y sincronización | en `69e19ff` y `cefc779` | Hecho (cobertura en `src/__tests__`) |
| 9 | Documentación: README, informe Eva 1 y avances | `8a5e146` y siguiente | En curso |

---

## Paso 0: rama y documentos

- Se creó la rama `eva2` desde `main`, con los cambios de la Evaluación 1 que estaban sin commit: el editor de descripción con formato (TenTap) y los documentos de diseño.
- Se decidió **mantener Expo** en lugar de Ionic o Capacitor, porque el proyecto ya estaba construido sobre Expo y sus módulos oficiales cubren la cámara y el GPS.
- Commits: `169b8cf` (editor con formato), `fda4e5d` (brief, stack y diseño).

## Paso 1: almacenamiento local

- Las tareas se guardan en el teléfono con **AsyncStorage**, así sobreviven a cerrar la app.
- Antes de guardar, la app espera a cargar la lista existente, para nunca sobrescribir datos con una lista vacía.
- Los datos guardados que no tienen la forma de una tarea se descartan al leerlos.
- Prueba: `tasksStorage.test.ts` (guardar y cargar, JSON corrupto, datos con forma inválida, error de lectura).
- Commit: `e0a2bfa`.

## Paso 2: campos nuevos en la tarea

- Se agregaron campos opcionales: `imageUri` (foto), `location` (lugar), `weather` (clima). Así las tareas guardadas antes siguen funcionando.
- Commit: incluido en `c8f4ca3`.

## Paso 3: cámara

- La foto se toma con `expo-image-picker` y se **copia** a la carpeta de documentos de la app, porque la caché del sistema puede borrar el original.
- El permiso se pide al pulsar «Adjuntar foto». Si se niega, aparece un aviso con acceso a los ajustes.
- Prueba: `camera.test.ts` (foto copiada, permiso denegado, cancelación).
- Probado en el celular: sí.
- Commit: `c8f4ca3`.

## Paso 4: GPS

- La ubicación se registra **una vez, al crear** la tarea, con permiso solo mientras la app está abierta y precisión equilibrada.
- Si se niega el permiso o el GPS está apagado, la tarea se guarda sin ubicación y el formulario lo indica.
- Las coordenadas se validan antes de guardarse.
- Prueba: `location.test.ts` (coordenadas, permiso denegado, sensor con error, coordenadas fuera de rango).
- Probado en el celular: sí.
- Commit: `17befd1`.

## Paso 4b: nombre del lugar y clima

- Las coordenadas se muestran como **nombre del lugar** (ciudad y región), con geocodificación inversa de `expo-location`. Si no hay nombre, se muestran las coordenadas.
- El **clima actual** del lugar viene de Open-Meteo, que no pide clave. La respuesta se valida campo por campo y tiene un tiempo máximo de 8 segundos.
- Decisión tomada con el usuario: que el GPS sirva para algo que la persona vea, en lugar de solo guardar coordenadas.
- Pruebas: `weather.test.ts` y el caso de nombre del lugar en `location.test.ts`.
- Probado en el celular: sí.
- Commit: `d4ca624`.

## Paso 5: cuentas con Firebase

- Inicio de sesión y creación de cuenta con correo y contraseña (Firebase Auth). La sesión se mantiene al cerrar la app.
- La configuración viene de `.env`, que está en `.gitignore`. Se incluye `.env.example` como plantilla.
- Los mensajes de error salen en español.
- Se resolvió un detalle de tipos: la función `getReactNativePersistence` existe en el build de React Native, pero TypeScript no la encontraba. Se declaró su firma en `src/types/firebase-react-native.d.ts`.
- Pruebas: `auth.test.ts`.
- Probado en el celular: sí (dos cuentas, las listas quedan separadas).
- Commit: `abc7231`.

## Paso 5b: modo sin cuenta

- La app abre directo en la lista. Sin cuenta, las tareas se guardan en el teléfono como **invitado**.
- Iniciar sesión es opcional. Al entrar, si hay tareas de invitado, la app pregunta **una sola vez por cuenta** si quieres importarlas.
- Sin `.env`, la app funciona completa en modo local.
- Pruebas: `guestImportOffer.test.tsx`, `authUnavailable.test.ts`, y casos de `tasksStorage.test.ts` y `tasksReducer.test.ts`.
- Probado en el celular: sí.
- Commit: `a76591a`.

## Paso 6: sincronización con Firestore

- Con cuenta, las tareas se guardan en `users/{uid}/tasks` y se actualizan en tiempo real entre dispositivos.
- **Conflictos:** gana la copia modificada más recientemente.
- **Borrar** marca la tarea como borrada en lugar de quitarla, para que el borrado llegue a la nube. Así una tarea borrada sin conexión no reaparece.
- **La foto no se sube:** queda solo en el teléfono.
- **Al arrancar** se espera la respuesta del servidor antes de subir nada, para no pisar cambios de otro dispositivo.
- La lógica está en funciones puras (`src/utils/taskSync.ts`), y el componente `TasksSync` solo conecta esas funciones con Firestore.
- Pruebas: `taskSync.test.ts` (fusión por fecha, qué subir, validación de datos de la nube) y `tasksReducer.test.ts` (borrado y fusión).
- Probado en el celular: sí.
- Commit: `cefc779`.

## Paso 7: importar desde una API

- El botón **Importar tareas** trae 10 tareas de JSONPlaceholder (API pública de práctica, sin clave).
- Cada tarea importada tiene un id fijo derivado de su origen, así importar otra vez no duplica nada.
- Si la importación falla (sin conexión, tiempo agotado o respuesta inválida), se muestra un mensaje y la lista no cambia.
- La API indica si la tarea estaba completada. Como el modelo de la app no tiene ese campo, se anota en la descripción.
- Pruebas: `importTodos.test.ts` (petición, filtrado de datos inválidos, errores HTTP, sin duplicados).
- Probado en el celular: pendiente.
- Commit: `69e19ff`.

## Paso 8: pruebas

- Hay 12 suites con 87 pruebas. Se cubren los periféricos, la API de importación, la sincronización, la autenticación, el almacenamiento y el reducer.
- Lo que no se prueba automáticamente: la conexión real con Firebase, la cámara y el GPS en el dispositivo, y los formularios completos. Esas partes se verificaron a mano con Expo Go.

## Paso 9: documentación

- **README:** describe la app tal como está hoy, con la rúbrica mapeada al código, la configuración de Firebase y las limitaciones (commit `8a5e146`).
- **Informe de la Evaluación 1:** se conserva completo en [informe-eva1.md](informe-eva1.md).
- **Este documento:** registro de avances.
- **Pendiente:** completar `docs/stack.md` con los paquetes y alternativas de la Evaluación 2.

---

## Pendientes

- Probar la importación en el celular.
- Video de demostración.
- Comprobar el teclado con el formulario abierto (criterio CA-G5 del brief, pendiente desde la Evaluación 1).
- Corregir el fallo de carrera al importar mientras la lista carga (ver [README](../README.md#8-limitaciones-conocidas)).
