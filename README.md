<p align="center">
  <img src="assets/images/Logo_IPSS.png" alt="Logo del Instituto Profesional San Sebastián" width="420">
</p>

# Evaluación 2 – ToDo-app (segunda mejora)

**Desarrollo de Aplicaciones Móviles**
Instituto Profesional San Sebastián

| | |
|---|---|
| **Profesor** | Boris Belmar Muñoz |
| **Alumno** | Andrés Antonio Orellana Narváez |
| **Sección** | 51 |
| **Rama** | `eva2` (la Evaluación 1 está en `main`) |

---

## ÍNDICE

1. [Qué es la app hoy](#1-qué-es-la-app-hoy)
2. [Requisitos y cómo se cumplen](#2-requisitos-y-cómo-se-cumplen)
3. [Periféricos: cámara y GPS](#3-periféricos-cámara-y-gps)
4. [Servicios web y APIs](#4-servicios-web-y-apis)
5. [Arquitectura y patrones](#5-arquitectura-y-patrones)
6. [Cómo ejecutar el proyecto](#6-cómo-ejecutar-el-proyecto)
7. [Pruebas y calidad](#7-pruebas-y-calidad)
8. [Limitaciones conocidas](#8-limitaciones-conocidas)
9. [Estructura de archivos](#9-estructura-de-archivos)
10. [Eva 1 → Eva 2: cómo estaba y cómo está](#10-eva-1--eva-2-cómo-estaba-y-cómo-está)

Documentos de apoyo: [docs/avances-eva2.md](docs/avances-eva2.md) (registro de avances paso por paso), [docs/informe-eva1.md](docs/informe-eva1.md) (informe completo de la Evaluación 1), [docs/brief.md](docs/brief.md) (qué se construye y criterios de aceptación), [docs/stack.md](docs/stack.md) (con qué se construye y por qué) y [docs/design.md](docs/design.md) (diseño visual).

---

## 1. QUÉ ES LA APP HOY

Una app de **lista de tareas** para el celular. Cada tarea tiene un **título** y una **descripción con formato** (negrita, cursiva, listas y casillas), y además puede tener una **foto**, el **lugar** donde se creó y el **clima** de ese lugar.

Se puede usar de dos formas:

- **Sin cuenta:** las tareas se guardan en el teléfono. La app abre directo en la lista.
- **Con cuenta** (correo y contraseña): las tareas se guardan en la nube, se sincronizan en tiempo real entre dispositivos y quedan protegidas: cada persona solo ve sus tareas.

Ambas formas funcionan. La cuenta es opcional; sin ella la app no pide nada.

---

## 2. REQUISITOS Y CÓMO SE CUMPLEN

### Requisitos de la Evaluación 2

| Requisito de la evaluación | Dónde se cumple |
|---|---|
| Capturar imágenes con la cámara y adjuntarlas a las tareas | `src/services/camera.ts`, botón «Adjuntar foto» en `src/app/task-form.tsx` |
| Registrar la ubicación (GPS) donde se crea cada tarea | `src/services/location.ts`, `src/app/task-form.tsx` |
| Sincronizar las tareas con un servicio web para almacenarlas de forma remota | Firestore: `src/services/tasksRemote.ts`, `src/components/TasksSync.tsx` |
| Importar tareas desde una API externa | JSONPlaceholder: `src/services/api.ts`, `src/utils/importTodos.ts`, botón en `src/app/index.tsx` |
| Pruebas automatizadas de la cámara y la ubicación | `src/__tests__/camera.test.ts`, `src/__tests__/location.test.ts` |
| Almacenamiento local que funcione sin conexión | `src/storage/tasksStorage.ts` (AsyncStorage) |
| Autenticación de usuarios | Firebase Auth: `src/services/auth.ts`, `src/context/AuthContext.tsx`, `src/app/login.tsx` |

### Cómo se cubren los indicadores de la rúbrica

| Indicador | Evidencia en el proyecto |
|---|---|
| **Funcionalidades con periféricos** | Cámara y GPS integrados a la creación de tareas, con copia de la foto al almacenamiento permanente y precisión balanceada del GPS |
| **Permisos** | Solicitud en contexto (al pulsar «Adjuntar foto» o al abrir «Nueva tarea»), textos de justificación en `app.json`, aviso con acceso a los ajustes si se niega, y la tarea se guarda igual sin ubicación |
| **Pruebas de periféricos** | Éxito, permiso denegado, cancelación, error del sensor y coordenadas fuera de rango |
| **Integración con servicios web y APIs** | Firebase (cuentas y nube), JSONPlaceholder (importación), Open-Meteo (clima), con validación de cada respuesta y tiempo máximo de 8 segundos |
| **Pruebas de servicios web y APIs** | Mapeo y filtrado de la importación, errores HTTP y respuestas inválidas, fusión de cambios de la nube (gana el más reciente), y datos de la nube verificados antes de usarse |
| **Seguridad** | Reglas de Firestore (cada usuario solo accede a `users/{su uid}`), archivo `.env` fuera de Git, la foto nunca sale del teléfono |

---

## 3. PERIFÉRICOS: CÁMARA Y GPS

### Cámara

- Se toma la foto con `expo-image-picker` y se **copia** a la carpeta de documentos de la app (`expo-file-system`). La caché del sistema puede borrar el original, por eso no se usa directamente.
- Calidad de la imagen al 70 % para que ocupe menos espacio.
- La foto se muestra en el formulario y como miniatura en la tarjeta de la lista.
- **La foto no se sube a la nube**: queda solo en el teléfono donde se tomó (Firebase Storage requiere plan de pago). Es una limitación declarada.

### GPS

- Solo permiso **mientras la app está abierta** y precisión **equilibrada** (menos consumo de batería).
- Se registra **una vez, al crear** la tarea. Editar una tarea conserva el lugar original.
- Las coordenadas que llegan del sensor se validan (latitud entre −90 y 90, longitud entre −180 y 180) antes de guardarse.
- Con la ubicación se obtienen dos datos útiles para la persona: el **nombre del lugar** (ciudad y región, con geocodificación inversa de `expo-location`) y el **clima actual** de ese lugar. Si cualquiera falla, la tarea se guarda sin ese dato.

### Permisos

| Caso | Qué ve la persona |
|---|---|
| Permiso de cámara concedido | La foto se adjunta |
| Permiso de cámara denegado | Aviso con botón **Abrir ajustes** |
| Permiso de ubicación denegado o GPS apagado | Aviso en el formulario: «Sin ubicación: la tarea se guardará sin ella» |
| Sin internet al pedir el clima o el nombre del lugar | La tarea se guarda sin esos datos |

---

## 4. SERVICIOS WEB Y APIS

| Servicio | Para qué | Clave | Dónde está |
|---|---|---|---|
| **Firebase Auth** | Cuentas con correo y contraseña; la sesión se mantiene al cerrar la app | Configuración web en `.env` | `src/services/auth.ts`, `src/services/firebase.ts` |
| **Firestore** | Tareas de cada cuenta en `users/{uid}/tasks`, con actualización en tiempo real | Misma configuración | `src/services/tasksRemote.ts`, `src/components/TasksSync.tsx` |
| **JSONPlaceholder** | Importar 10 tareas de ejemplo | Sin clave | `src/services/api.ts` |
| **Open-Meteo** | Temperatura y estado del cielo en el lugar de la tarea | Sin clave | `src/services/weather.ts` |

### Cómo se protegen los datos

- **Reglas de Firestore:** solo la cuenta dueña puede leer y escribir sus tareas. Las reglas están en la [guía de configuración](#6-cómo-ejecutar-el-proyecto).
- **Validación de respuestas:** cada dato que llega de la red (nube, JSONPlaceholder, Open-Meteo) se revisa campo por campo antes de usarse. Lo que no tiene la forma esperada se descarta.
- **Tiempo máximo de 8 segundos** en las peticiones HTTP, para que la app no quede esperando.
- **Mensajes de error en español**, sin mostrar códigos técnicos.
- **Sin secretos en el repositorio:** el archivo `.env` está en `.gitignore`. La `apiKey` de una app web de Firebase identifica el proyecto, no da acceso a los datos; lo que protege la información son las reglas.

### Sincronización

- Los cambios de una persona con cuenta se suben a Firestore y llegan a sus otros dispositivos en tiempo real.
- **Conflictos:** gana la copia modificada más recientemente.
- **Borrar** marca la tarea como borrada en lugar de quitarla. Así el borrado llega a la nube y a los otros teléfonos, y una tarea borrada sin conexión no reaparece al reconectar.
- **Al arrancar**, la app espera la respuesta del servidor antes de subir nada, para no pisar cambios hechos en otro dispositivo.
- Lo que se creó sin conexión queda guardado en el teléfono y se sube en el siguiente arranque con conexión.

---

## 5. ARQUITECTURA Y PATRONES

```
Pantallas (src/app)  ──►  Contextos (estado)  ──►  Almacenamiento local (AsyncStorage)
                                 │
                                 └──►  Sincronización (TasksSync)  ──►  Firestore
Servicios (src/services): cámara · ubicación · clima · importación · autenticación
```

- **Context + `useReducer`** para la lista de tareas. El reducer es **puro**: el `id` y la hora llegan dentro de la acción, así que las pruebas no necesitan simular nada.
- **`AuthContext`** para la sesión. **`TasksProvider`** usa como dueño de la lista el uid de la cuenta, o `guest` cuando no hay sesión; al cambiar de persona, la lista se reinicia.
- **Lógica de sincronización pura** en `src/utils/taskSync.ts` (fusión por fecha, qué subir, qué se envía a la nube y validación de lo que llega). Se prueba sin Firebase.
- **Servicios aislados** en `src/services/`: cada uno encapsula un periférico o una API, y las pantallas no conocen los detalles.
- **Modo sin configuración:** si falta el `.env`, `auth` y `db` son `null`; la app sigue funcionando en modo local y explica que las cuentas no están disponibles.

---

## 6. CÓMO EJECUTAR EL PROYECTO

### Requisitos

- **Node.js** y **npm** (el proyecto se desarrolló con Node 24).
- Un celular con **Expo Go** para **SDK 57** (Android).

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Configurar Firebase: ver la sección siguiente
#    Sin este paso la app funciona igual, sin cuentas ni nube.

# 3. Iniciar el servidor de desarrollo, limpiando la caché
npx expo start -c
```

Escanea el código QR con **Expo Go**. Usa `-c` cada vez que cambies el `.env`, porque Expo copia esas variables al compilar.

### Configurar Firebase (opcional)

1. En la consola de Firebase, crea un proyecto y registra una **app web**.
2. **Authentication → Método de acceso:** activa **Correo electrónico/contraseña**.
3. **Firestore Database:** créala en modo producción.
4. En **Firestore → Reglas**, publica:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/tasks/{taskId} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

5. Copia `.env.example` a `.env` en la raíz y completa los seis valores de `firebaseConfig`.

### Comandos de calidad

| Comando | Qué hace |
|---|---|
| `npx jest` | Ejecuta las pruebas automáticas |
| `npx tsc --noEmit` | Revisa los tipos de TypeScript |
| `npx expo lint` | Revisa el estilo y errores comunes |

---

## 7. PRUEBAS Y CALIDAD

Se ejecutan con `npx jest`: **12 suites, 87 pruebas, todas pasan.** Además, `npx tsc --noEmit` y `npx expo lint` no reportan errores.

| Área | Archivos de prueba | Qué comprueban |
|---|---|---|
| Cámara | `camera.test.ts` | Foto copiada; permiso denegado; cancelación |
| Ubicación | `location.test.ts` | Coordenadas válidas; permiso denegado; sensor con error; coordenadas fuera de rango; nombre del lugar |
| Clima | `weather.test.ts` | Petición correcta; error HTTP; respuesta con tipos incorrectos; sin red; etiquetas de clima |
| Importación | `importTodos.test.ts` | Petición con tiempo límite; filtrado de datos inválidos; errores; sin duplicados al importar otra vez |
| Sincronización | `taskSync.test.ts` | Fusión por fecha; la foto local se conserva; qué se sube; lo que llega de la nube se valida |
| Reducer | `tasksReducer.test.ts` | Agregar, editar, borrar (marca), cargar, importar y fusionar sin mutar el estado |
| Almacenamiento | `tasksStorage.test.ts` | Guardar y cargar; listas separadas por persona; JSON corrupto; datos con forma inválida |
| Autenticación | `auth.test.ts`, `authUnavailable.test.ts` | Mensajes en español; cuentas no disponibles sin `.env` |
| Importación de tareas al entrar | `guestImportOffer.test.tsx` | Aviso una sola vez por cuenta; importar las tareas sin cuenta |
| Interfaz | `components.test.tsx` | Tarjeta, foto, lugar, clima y estado vacío |

**Lo que no tiene prueba automática:** la conexión real con Firebase, la cámara y el GPS en el dispositivo, y los formularios completos. Esas partes se verificaron a mano en el celular con Expo Go.

---

## 8. LIMITACIONES CONOCIDAS

- **Foto solo en el teléfono.** No se sincroniza con la nube (requiere plan de pago de Firebase Storage).
- **Sincronización sin reintentos.** Si una subida falla, se reintenta en el siguiente cambio o arranque. No hay indicador visual de que la sincronización está en curso.
- **Conflictos por fecha.** Si dos dispositivos editan la misma tarea al mismo tiempo, gana la última modificación; no hay fusión de texto.
- **Importación y carga inicial.** Si se pulsa «Importar tareas» mientras la lista guardada todavía carga, la carga puede reemplazar las tareas importadas. Es poco probable, pero es un fallo conocido.
- **Tareas importadas borradas.** Si borras una tarea importada, no vuelve a aparecer al importar otra vez. Es intencional, pero conviene saberlo.
- **Aviso de importación una sola vez.** Si respondes «Ahora no» al iniciar sesión, las tareas sin cuenta no se pueden importar después.
- **Modo sin cuenta sin protección.** Cualquiera que use el teléfono ve la lista sin cuenta.
- **Expo Go es un entorno de aprendizaje.** Para publicar la app se usaría un *development build* o un build de producción con EAS.
- **Probado solo en Android.** No se probó en iOS.
- **Geocodificación en Android.** Puede depender de los servicios de Google del teléfono; no se comprobó en un equipo sin ellos.
- **Pendiente de la Evaluación 1:** comprobar en el celular el comportamiento del teclado con el formulario abierto (criterio CA-G5 del brief).
- **Video de demostración:** pendiente.

---

## 9. ESTRUCTURA DE ARCHIVOS

```
ToDo-app/
├── README.md                  # Este documento
├── AGENTS.md                  # Instrucciones del proyecto para agentes
├── app.json                   # Configuración de Expo y permisos de cámara y ubicación
├── .env.example               # Plantilla de la configuración de Firebase (el .env real no se sube)
├── docs/                      # Brief, stack, diseño y capturas
└── src/
    ├── app/                   # SOLO pantallas: cada archivo es una ruta
    │   ├── _layout.tsx        # Proveedores (sesión, tareas, sincronización) y stack
    │   ├── index.tsx          # Mis tareas: lista, importar, cerrar sesión
    │   ├── task-form.tsx      # Formulario: agregar o editar, foto, ubicación
    │   └── login.tsx          # Iniciar sesión o crear cuenta (opcional)
    ├── components/            # Piezas de interfaz y componentes sin pantalla
    │   ├── TaskItem.tsx       # Tarjeta: foto, título, descripción, lugar y clima
    │   ├── TasksSync.tsx      # Sincroniza con Firestore (no dibuja nada)
    │   ├── GuestImportOffer.tsx  # Ofrece importar las tareas sin cuenta (no dibuja nada)
    │   └── …                  # FormField, RichTextField, EmptyState, FloatingAddButton
    ├── context/               # Estado compartido
    │   ├── AuthContext.tsx    # Sesión de Firebase (o ausencia de ella)
    │   ├── TasksContext.tsx   # Lista de la persona o de invitado
    │   └── tasksReducer.ts    # Reducer puro
    ├── services/              # Periféricos y APIs
    │   ├── camera.ts          # Foto con permiso
    │   ├── location.ts        # GPS con permiso, nombre del lugar
    │   ├── weather.ts         # Clima (Open-Meteo)
    │   ├── api.ts             # Importación (JSONPlaceholder)
    │   ├── firebase.ts        # Configuración de Firebase desde .env
    │   ├── auth.ts            # Entrar, crear cuenta, salir
    │   └── tasksRemote.ts     # Firestore: escuchar y subir tareas
    ├── storage/
    │   └── tasksStorage.ts    # Guardado local por persona
    ├── utils/                 # Funciones puras
    │   ├── taskSync.ts        # Fusión por fecha, qué subir, validación de la nube
    │   ├── importTodos.ts     # Convierte los todos importados en tareas
    │   ├── validateTask.ts    # Validación del formulario
    │   └── richDoc.ts         # Texto con formato ↔ texto plano
    ├── types/                 # Tipos compartidos (Task) y declaraciones de Firebase
    ├── theme/                 # Colores, espacios y tipografía
    └── __tests__/             # Pruebas (fuera de src/app/)
```

---

## 10. EVA 1 → EVA 2: CÓMO ESTABA Y CÓMO ESTÁ

### Cómo estaba (Evaluación 1, rama `main`)

- Lista de tareas con **título y descripción con formato**, en **memoria**: al cerrar la app todo se perdía.
- **Sin cuentas**, sin nube y sin ningún periférico.
- Sin APIs externas.
- **16 pruebas**: validación, reducer y componentes.
- Descripción con formato con el editor TenTap, y un diseño visual con Material Design 3.

### Cómo está (Evaluación 2, rama `eva2`)

| Aspecto | Eva 1 | Eva 2 |
|---|---|---|
| Datos | Solo en memoria | Guardados en el teléfono y, con cuenta, en Firestore |
| Usuarios | Una sola lista | Modo sin cuenta **y** cuentas con correo y contraseña, con listas separadas |
| Sincronización | No existe | Tiempo real entre dispositivos, con resolución de conflictos |
| Periféricos | Ninguno | Cámara (con foto adjunta) y GPS (lugar, nombre del lugar y clima) |
| Permisos | No aplica | Solicitud en contexto, justificación y casos de denegación |
| APIs | Ninguna | Firebase (Auth y Firestore), JSONPlaceholder y Open-Meteo |
| Configuración | No requiere | Opcional (`.env`); sin ella la app funciona en modo local |
| Pruebas | 16 | **87** (12 suites), incluyendo periféricos, API y sincronización |

**Cambios de stack:** se agregaron `@react-native-async-storage/async-storage`, `firebase`, `expo-image-picker`, `expo-file-system` y `expo-location`. Se mantuvieron Expo, React Native y TypeScript. El enunciado mencionaba Ionic y Capacitor; se decidió seguir con Expo, que ya era la base del proyecto y ofrece los mismos periféricos mediante módulos oficiales.

**Justificación del framework y diseño visual:** siguen en [docs/stack.md](docs/stack.md) y [docs/design.md](docs/design.md). El informe completo de la Evaluación 1 está en [docs/informe-eva1.md](docs/informe-eva1.md).

---

## REFERENCIAS

- Expo: [SDK](https://docs.expo.dev/versions/latest/), [Expo Router](https://docs.expo.dev/router/introduction), [Expo Go](https://docs.expo.dev/get-started/expo-go/), [expo-image-picker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/), [expo-file-system](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/) y [expo-location](https://docs.expo.dev/versions/v57.0.0/sdk/location/).
- Firebase: [Autenticación web](https://firebase.google.com/docs/auth/web/start), [Firestore: escuchar cambios](https://firebase.google.com/docs/firestore/query-data/listen), [Firestore: agregar datos](https://firebase.google.com/docs/firestore/manage-data/add-data) y [Expo y Firebase](https://docs.expo.dev/guides/using-firebase/).
- APIs: [JSONPlaceholder](https://jsonplaceholder.typicode.com/) y [Open-Meteo](https://open-meteo.com/en/docs).
- React Native: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/install/) y [Alert](https://reactnative.dev/docs/alert).
- Accesibilidad: [WCAG 2.2, contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
