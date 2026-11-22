# Stack técnico: App de Lista de Tareas (To-Do List)

> Evaluación 1 · Desarrollo de Aplicaciones Móviles
> Estado: decisiones técnicas. Este documento **no contiene código de la app**.
> Complementa a [docs/brief.md](brief.md) (qué se construye); este documento explica **con qué** se construye.

## Cómo leer este documento

Cada decisión tiene tres partes: **qué se eligió**, **por qué** y **qué alternativas se descartaron y por qué**.

Las afirmaciones sobre APIs y versiones se verificaron en la documentación oficial (Expo SDK 57, React Native, React), en el registro de npm y en `node_modules/expo/bundledNativeModules.json`. Lo que es criterio propio y no un dato verificado se marca como **(criterio)**. Al final hay una nota de fuentes.

## 1. Resumen de la pila

| Tema | Decisión |
|---|---|
| Framework | Expo SDK 57 + React Native 0.86 + TypeScript |
| Navegación | Expo Router, navegación stack |
| Estado | React Context + `useReducer`, sin librerías externas |
| Generación de `id` | `Crypto.randomUUID()` de `expo-crypto` |
| Estilos | `StyleSheet.create` + archivo de tema (`src/theme/`) |
| Lista | `FlatList` |
| Confirmar al eliminar | `Alert.alert` |
| Íconos | `@expo/vector-icons` (con riesgo de obsolescencia anotado) |
| Descripción con formato | `@10play/tentap-editor` (editor visual: negrita, cursiva, lista numerada, lista con viñetas, casilla) |
| Teclado | `EditorKeyboardAvoidingView` de TenTap (reemplaza a `KeyboardAvoidingView` en el formulario); respaldo: `react-native-keyboard-controller` |
| Pruebas | Jest 29 + `jest-expo` + React Native Testing Library 13; TDD en reducer y validación |
| Calidad | `npx expo lint` y `npx tsc --noEmit` antes de cerrar cada tarea |
| Commits | Conventional Commits |

Versiones del proyecto hoy (de `package.json`): `expo ~57.0.31`, `expo-router ~57.0.29`, `react 19.2.3`, `react-native 0.86.3`, `typescript ~6.0.3`.

## 2. Framework: Expo SDK 57 + React Native + TypeScript

### Qué se eligió

**React Native** como framework de interfaz, **Expo** como plataforma de herramientas encima (servidor de desarrollo, módulos listos, Expo Go) y **TypeScript** como lenguaje.

### Por qué

- **La interfaz usa componentes nativos reales.** La documentación de React Native lo dice así: «At runtime, React Native creates the corresponding Android and iOS views for those components» y «Because React Native components are backed by the same views as Android and iOS, React Native apps look, feel, and perform like any other apps». Por ejemplo, `<TextInput>` se convierte en un `EditText` en Android.
- **Se escribe una sola vez** (en TypeScript con componentes de React) y sirve para Android e iOS.
- **Se prueba en el celular sin instalar Android Studio.** Con `npx expo start` se escanea el código QR con Expo Go desde Google Play. Es lo que usa este proyecto en un celular Android.
- **TypeScript** detecta errores de tipos antes de ejecutar la app (`npx tsc --noEmit`).
- **Expo Router** y los módulos de Expo ya vienen alineados en versión con el SDK, lo que evita conflictos de dependencias.

### Comparación para el informe

| Criterio | **Expo + React Native** (elegido) | **Ionic** | **Flutter** | **Nativo (Kotlin / Swift)** |
|---|---|---|---|---|
| Lenguaje | JavaScript / TypeScript con React | Tecnologías web (HTML, CSS, JavaScript) con Angular, React o Vue | Dart | Kotlin (Android), Swift (iOS) |
| Cómo se dibuja la interfaz | Vistas nativas reales de cada plataforma | Interfaz web dentro de un contenedor nativo (Capacitor) | Widgets propios que Flutter dibuja él mismo, sin usar los widgets del sistema | Vistas y herramientas oficiales de cada plataforma (Android: Jetpack Compose) |
| Un código para Android e iOS | Sí | Sí | Sí | No: son dos proyectos y dos lenguajes (consecuencia lógica) |
| Prueba rápida en el celular | Expo Go: se escanea un QR | Se despliega con Capacitor o Cordova, o corre en el navegador como PWA | Emulador o celular conectado (USB o red), con hot reload | Android Studio o Xcode |
| Curva de aprendizaje para quien ya sabe JavaScript o React | Baja | Baja si sabe web | Media: hay que aprender Dart (criterio) | Alta: dos lenguajes y dos entornos (criterio) |
| Limitación importante | Expo Go solo incluye ciertos módulos nativos | Depende del contenedor nativo y de sus plugins | Reimplementa los controles, por lo que no son los del sistema | Doble esfuerzo para dos plataformas |

Qué dice cada fuente oficial detrás de la tabla:

- **Ionic:** «an open source UI toolkit for building performant, high-quality mobile apps using web technologies»; «Ionic uses Capacitor (or Cordova) to deploy natively, or runs in the browser as a Progressive Web App». **Capacitor:** «a cross-platform native runtime», con plugins nativos en Swift (iOS) y Java (Android).
- **Flutter:** «Flutter uses the Dart programming language». Sobre el dibujo: «bypassing the system UI widget libraries in favor of its own widget set» y «Flutter has its own implementations of each UI control». El motor de renderizado actual es Impeller. En desarrollo corre en una VM con *stateful hot reload*; en producción se compila a código máquina.
- **Nativo:** Android presenta a Kotlin como lenguaje con soporte completo y de primera clase en Android Studio, y Jetpack Compose es su kit de interfaz moderno. Kotlin Multiplatform permite compartir código entre plataformas, pero no es el camino por defecto.

### Alternativas descartadas y por qué

- **Ionic:** buena opción si el equipo viene de desarrollo web, pero la interfaz es una app web en un contenedor, no vistas nativas. Para una rúbrica de «componentes de UI comunes», preferimos los componentes nativos de React Native **(criterio)**.
- **Flutter:** obliga a aprender un lenguaje nuevo (Dart) y un conjunto de widgets propio. No hay una ventaja para una lista de tareas simple que compense ese costo **(criterio)**.
- **Nativo (Kotlin / Swift):** habría que escribir y mantener la app dos veces. Para una evaluación de una sola persona y una sola prueba en Android, el esfuerzo no se justifica **(criterio)**.

### Límites que conviene reconocer en el informe

- Expo describe a Expo Go como «a playground for students and learners to try Expo quickly» y dice que «it's limited and not useful for building production-grade projects». Para publicar una app real se usaría un *development build* o un build de producción con EAS.
- Por eso este proyecto **no puede usar librerías con código nativo que Expo Go no incluya**. Cada paquete nuevo se revisa con esa regla.

## 3. Navegación: Expo Router con stack

### Qué se eligió

**Expo Router**, navegación **stack**, con rutas por archivos dentro de `src/app/`:

- `src/app/_layout.tsx`: define el stack y el proveedor del estado.
- `src/app/index.tsx`: pantalla «Mis tareas».
- `src/app/task-form.tsx`: pantalla del formulario, que agrega o edita según el parámetro `id`.

### Por qué

- Expo Router es un enrutador por archivos: «When a file is added to the **app** directory, the file automatically becomes a route in your navigation». Eso hace que la estructura de pantallas se vea con solo mirar las carpetas.
- Un stack apila pantallas y «volver» quita la de arriba. Es justo el flujo del brief (lista → formulario → volver a la lista).
- Soporta **rutas tipadas** (`typedRoutes` ya está activado en `app.json`): «you'll get type errors if links are broken».
- `AGENTS.md` del proyecto exige Expo Router para toda la navegación.

### Alternativas descartadas

- **React Navigation usado directamente:** Expo Router ya está construido sobre esa idea y añade las rutas por archivos. Usarlo a mano sería más código de configuración sin beneficio **(criterio)**.
- **Tabs o drawer:** el brief define solo dos pantallas con relación jerárquica (lista → detalle de edición). Un menú de pestañas no aporta nada.

## 4. Estado: React Context + `useReducer`

### Qué se eligió

Un **proveedor de contexto** (`TasksProvider`) en el layout raíz, que guarda la lista de tareas con `useReducer`. Las pantallas lo leen con un hook propio (`useTasks`).

Acciones del reducer: **agregar**, **actualizar** y **eliminar**.

### Por qué

- Las dos pantallas necesitan ver la misma lista, así que el estado debe vivir **por encima de ambas**. El layout raíz es ese lugar.
- Un reducer concentra todas las reglas de cambio de la lista en una sola función. La documentación de React exige que sea **pura**: «It must be pure, should take the state and action as arguments, and should return the next state». Eso lo hace muy fácil de probar con TDD.
- No agrega dependencias y no requiere código nativo.
- Cuando más adelante se guarde en disco, solo cambia el proveedor; las pantallas no se enteran.

### Alternativas descartadas

- **`useState` elevado + props:** habría que pasar la lista y los *handlers* por varios niveles. Con Expo Router, las pantallas no son hijas directas unas de otras, por lo que no hay un lugar natural para pasar props.
- **Zustand, Redux Toolkit u otra librería de estado:** son válidas, pero para tres acciones simples agregan una dependencia y conceptos nuevos que explicar **(criterio)**.

## 5. Generación del `id`

### Qué se eligió

`Crypto.randomUUID()` de **`expo-crypto`** (versión del SDK: `~57.0.4`).

### Por qué

- Devuelve un UUID v4 generado con valores aleatorios seguros.
- La documentación de Expo SDK 57 lo marca como **incluido en Expo Go**, así que cumple la restricción del proyecto.
- Es un estándar: la unicidad no depende de la hora ni de un contador.

### Cómo se usa en el diseño

El `id` se crea **antes** del reducer, en el *handler* de «Guardar», y viaja dentro de la acción. Así el reducer sigue siendo **puro** (si generara el id adentro, cada llamada daría un resultado distinto y sería difícil de probar). **(criterio de diseño, basado en el requisito de pureza de React)**

### Alternativas descartadas

- **Generador propio** (`Date.now()` más un contador): no necesita dependencias y alcanzaría con datos en memoria, pero no garantiza unicidad y se ve menos profesional.
- **`uuid` o `nanoid`:** no se verificó su compatibilidad con Expo Go en este proyecto; hay una alternativa que sí está verificada.

### Pendiente de verificar

- `expo-crypto` bajo Jest: puede requerir un *mock* en las pruebas. Una forma de evitarlo es pasar el generador de id como argumento a la función que arma la acción.

## 6. Estilos y tema

### Qué se eligió

`StyleSheet.create` en cada componente, con colores, espaciados y tamaños **centralizados** en `src/theme/`.

El tema incluirá, al menos: colores (fondo, texto, acento, error), espaciados (escala fija), tamaños de texto y el tamaño mínimo de elemento tocable (48 dp, alineado con el criterio de accesibilidad del brief).

### Por qué

- `StyleSheet.create` viene incluido en React Native: cero dependencias.
- Con un solo archivo de tema, cambiar un color o un espaciado se hace en un lugar. Eso ayuda a mantener la jerarquía visual, el contraste y el balance que pide la rúbrica.
- Los detalles visuales se documentarán aparte en `docs/design.md`.

### Alternativas descartadas

- **NativeWind, styled-components u otra librería de estilos:** agregan dependencias y una sintaxis más que aprender **(criterio)**.
- **Estilos en línea repartidos por los componentes:** los valores se repiten y es fácil perder la consistencia.

## 7. Lista y confirmación de eliminación

### Qué se eligió

- **`FlatList`** para mostrar las tareas.
- **`Alert.alert`** para el diálogo «¿Eliminar esta tarea?».

### Por qué `FlatList`

- Según React Native, es «a performant interface for rendering basic, flat lists», y renderiza el contenido fuera de pantalla de forma asíncrona para ahorrar memoria y mantener el desplazamiento fluido.
- `keyExtractor` permite usar el `id` de la tarea como clave estable; esto es importante porque las tareas se agregan y se eliminan.
- `ListEmptyComponent` muestra el estado de lista vacía definido en el brief.
- Nota técnica: `FlatList` solo se vuelve a dibujar si cambian sus propiedades. Si un ítem depende de datos fuera de `data`, hay que pasarlos con `extraData`.

### Por qué `Alert.alert`

- Es parte de React Native, funciona en Android e iOS y no necesita código nativo extra.
- Firma: `Alert.alert(title, message?, buttons?, options?)`.
- **Detalles de Android que importan aquí** (según la documentación):
  - Como máximo **tres botones**; nosotros usamos dos («Cancelar» y «Eliminar»).
  - La propiedad `style` de los botones (`cancel`, `destructive`) **solo funciona en iOS**; en Android se ignora. Por eso la distinción visual entre «Cancelar» y «Eliminar» en Android no se puede lograr con `style`.
  - Para poder cerrar el diálogo tocando fuera de él hay que pasar `cancelable: true`; el cierre se puede manejar con `onDismiss`.

### Alternativas descartadas

- **`ScrollView` + `map`:** crea todos los elementos de una vez; sirve para listas muy cortas, pero escala peor.
- **`FlashList`:** es una librería de terceros; no se verificó su compatibilidad con Expo Go y es más de lo que necesita una lista simple.
- **Modal propio para confirmar:** da más control visual, pero hay que construir y probar el componente. Se puede reconsiderar si la rúbrica de diseño lo pide.

## 8. Íconos

### Qué se eligió

**`@expo/vector-icons`** (versión del SDK: `^15.0.2`), importando cada familia por su ruta, por ejemplo `@expo/vector-icons/Ionicons`.

Se necesitan dos íconos: «+» y papelera. Ambos botones llevan etiqueta de accesibilidad (criterio del brief).

### Por qué

- Es la librería de íconos estándar del ecosistema Expo, con miles de íconos listos.
- Es solo JavaScript más fuentes (usa `expo-font`, que ya está instalado), así que funciona en Expo Go.
- Esta fue una decisión previa del proyecto.

### Riesgo anotado

La guía de íconos de Expo advierte: «`@expo/vector-icons` will be deprecated and is not recommended» y recomienda migrar a `@react-native-vector-icons`. Hoy sigue siendo una dependencia válida para SDK 57, pero conviene dejar registrado que puede quedar obsoleta.

### Alternativas descartadas

- **`expo-symbols`:** ya está instalado y viene en Expo Go, pero está en **beta**, y en Android hay que dar un nombre de Material Symbol aparte del nombre de iOS (si solo se pasa un nombre de SF Symbol, en Android no se dibuja nada).
- **`@react-native-vector-icons`:** es lo que Expo recomienda a futuro, pero **no se verificó** si funciona en Expo Go.

## 9. Editor de texto enriquecido en la descripción

### Qué se eligió

**`@10play/tentap-editor`** (TenTap, versión `^1.1.0`), un editor de texto enriquecido para React Native basado en Tiptap/ProseMirror, con **`react-native-webview`** (versión `13.16.1`, la que ya trae Expo Go para SDK 57) como dependencia nativa.

La descripción pasa de ser un `string` a ser un documento con formato: negrita, cursiva, lista numerada, lista con viñetas y casilla (lista de tareas). Se guarda como el JSON de Tiptap (tipo `RichDoc` en `src/types/task.ts`), no como HTML, porque TenTap lo entrega y lo recibe directo en ese formato con `getJSON()` e `initialContent`, y porque la tarjeta de la lista lo puede dibujar recorriendo el árbol, sin tener que analizar HTML.

Componentes nuevos:

- `src/components/RichTextField.tsx`: el campo del formulario. Crea el editor con `useEditorBridge` y dibuja una **barra propia** de 5 botones (no el `Toolbar` de TenTap, que usa imágenes PNG y solo aparece con el teclado abierto) que llaman a `toggleBold`, `toggleItalic`, `toggleOrderedList`, `toggleBulletList` y `toggleTaskList`, y marcan el botón activo con `useBridgeState`.
- `src/components/RichTextPreview.tsx`: la vista previa en la tarjeta. Dibuja el mismo JSON con `Text` y `View` nativos, **sin WebView**, para no cargar un WebView por cada fila del `FlatList`.
- `src/utils/richDoc.ts`: funciones puras (`docToText`, `textDoc`, `emptyDoc`) para pasar del documento a texto plano, usadas en `validateTask` y en las pruebas.

### Por qué

- El brief exige que la app funcione en **Expo Go SDK 57, sin librerías con código nativo adicional** (CA-G2). La documentación de TenTap dice que el editor funciona en Expo Go: Expo Go no puede cargar el módulo nativo del teclado personalizado, así que usa automáticamente un *driver* en JavaScript; solo el teclado nativo personalizado necesita un *development build*, y este proyecto no lo usa.
- La única dependencia nativa de TenTap es `react-native-webview`, que **ya está en Expo Go** (confirmado en `node_modules/expo/bundledNativeModules.json`, versión `13.16.1`, igual a la que instala `npx expo install`).
- TenTap trae de fábrica los cinco formatos pedidos (`TenTapStartKit` incluye `BoldBridge`, `ItalicBridge`, `OrderedListBridge`, `BulletListBridge` y `TaskListBridge`), así que no hace falta escribir un editor propio.
- Es un **editor visual**: la negrita se ve en negrita mientras se escribe, sin símbolos de Markdown, que es lo que se pidió.

### Alternativas descartadas y por qué

- **Componente DOM de Expo (`'use dom'`) con un editor web (por ejemplo Tiptap para web):** también funciona en Expo Go, pero obliga a escribir la barra de formato en HTML/CSS dentro del componente DOM, separada del sistema de diseño de la app (`src/theme/`). TenTap ya resuelve el puente nativo y deja la barra en React Native normal.
- **Barra de botones que inserta marcas de Markdown (`**negrita**`, `1. `, `[ ] `) sobre un `TextInput` normal:** no requiere dependencias nuevas, pero el usuario pidió ver el formato aplicado mientras se escribe, no símbolos. Se consideró primero y se descartó en la planificación.
- **Editor propio con `TextInput` y `RichText`-like de React Native:** reimplementar listas, casillas y estado de negrita/cursiva a mano es mucho más trabajo que una librería ya probada.

### Riesgos y puntos a verificar

- Expo Go trae su propia versión de `react-native-webview`, distinta de la que instala el proyecto. La documentación de TenTap recomienda probar el editor dentro de un `ScrollView` en un *development build* antes de confiar en el comportamiento del teclado en Expo Go. Afecta al criterio CA-G5 (el teclado no debe tapar los campos ni «Guardar»).
- El paquete agrega varias dependencias de Tiptap/ProseMirror (~5 MB descomprimidos). Es aceptable para este MVP.
- Si Expo Go no lleva bien el teclado con el editor dentro del `ScrollView`, el respaldo documentado para el teclado en general (sección 10) sigue aplicando.

## 10. Teclado: evitar que tape los campos y «Guardar»

### Qué se eligió

En el formulario, `EditorKeyboardAvoidingView` de TenTap (sustituye a `KeyboardAvoidingView` desde que se agregó el editor de la sección 9, porque TenTap la exige para que su propio teclado y su barra de formato no queden tapados) + `ScrollView` con `keyboardShouldPersistTaps="handled"` y `useScrollToCaret`, y el botón «Guardar» **dentro del contenido que se desplaza**. En el resto de la app, donde no hay editor de TenTap, sigue aplicando `KeyboardAvoidingView` normal.

**Respaldo:** si no funciona bien en el celular, pasar a `react-native-keyboard-controller` con `KeyboardAwareScrollView`.

### Por qué

- Android 16 **obliga** al modo *edge-to-edge* desde SDK 54 y no se puede desactivar, según el blog de Expo. En ese modo el sistema ya no redimensiona la ventana por sí solo. El mismo blog indica: «you'll need to use `KeyboardAvoidingView` or — ideally — `react-native-keyboard-controller`».
- `KeyboardAvoidingView` y `ScrollView` son componentes de React Native: no agregan dependencias y se sabe que funcionan en Expo Go.
- Un formulario de dos campos no necesita más.

### Alternativas descartadas

- **`react-native-keyboard-controller` como primera opción:** da mejor experiencia, pero **la documentación de Expo se contradice**: la guía de teclado dice que no está en Expo Go, mientras que la página del SDK 57 dice que sí, y `bundledNativeModules.json` la lista (`1.21.9`). Se deja como respaldo hasta probar en el celular.
- **`softwareKeyboardLayoutMode: "pan"` en `app.json`:** está documentado, pero con *edge-to-edge* obligatorio probablemente no baste como única solución. **(Inferencia, sin confirmar.)**

### Pendiente de verificar en el celular

- Qué valor de `behavior` de `KeyboardAvoidingView` funciona mejor en Android. La guía de Expo sugiere dejarlo sin definir en Android, y el blog de *edge-to-edge* dice que hace falta usar el componente. Hay que probarlo en el dispositivo.
- Este es el criterio CA-G5 del brief.

## 11. Pruebas

### Qué se eligió

| Paquete | Versión | Para qué |
|---|---|---|
| `jest-expo` | `~57.0.6` | Preset de Jest que simula las partes nativas del SDK de Expo |
| `jest` | `~29.7` | Ejecuta las pruebas |
| `@types/jest` | `~29.5` | Tipos de TypeScript para Jest |
| `@testing-library/react-native` | `~13.3.3` | Pruebas de componentes por lo que ve el usuario |
| `react-test-renderer` | `19.2.3` | Dependencia compartida que pide RNTL 13; se fija a mano (desviación 2, sección 17) |

Configuración: `"jest": { "preset": "jest-expo" }` en `package.json` y `"jest"` en `compilerOptions.types` de `tsconfig.json`.

**Estrategia:** TDD (primero la prueba, luego el código) para el **reducer** y la **validación**; pocas pruebas de componentes. Los archivos de prueba van en `src/__tests__/`, **nunca dentro de `src/app/`**, porque en esa carpeta cada archivo es una ruta.

### Por qué estas versiones

- `jest-expo ~57.0.6` es la versión que Expo lista para SDK 57 y depende de `babel-jest ^29`, es decir, de **Jest 29**. Jest 30 llega con SDK 58.
- Para Expo Router, la guía oficial dice que en SDK 57 `expo-router/testing-library` funciona **solo con `@testing-library/react-native` versión 13**; la versión 14 se exige desde SDK 58.
- `react-test-renderer` viene dentro de `jest-expo` (fijo en `19.2.3`), pero RNTL 13 lo pide como dependencia compartida y `npm` intenta traer una versión incompatible con React 19.2.3. Por eso **se fija a mano en `19.2.3`** (ver desviación 2 en la sección 17).

### Trampa a evitar

El comando de la guía general (`npx expo install @testing-library/react-native`) traería hoy la versión 14.1.0, que es para SDK 58. **Hay que fijar `~13.3.3`.**

### Alternativas descartadas

- **Combo SDK 58 (Jest 30 + RNTL 14):** no es compatible con `jest-expo` 57.
- **Solo reducer y validación, sin RNTL:** cubre lo esencial, pero deja fuera las pruebas de componentes que se pidieron.
- **Pruebas de instantáneas (*snapshots*):** Expo recomienda pruebas de extremo a extremo (Maestro) antes que snapshots para probar la interfaz. Aquí no se usan.

## 12. Calidad y commits

- **Antes de cerrar cada tarea:** `npx expo lint` y `npx tsc --noEmit`, sin errores. (Lo exige `AGENTS.md`.) Se complementa con `npx expo-doctor` y `npx expo install --check` al agregar paquetes.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/). Tipos que usaremos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. Ejemplo: `feat: add task form screen`.
- **Instalar paquetes:** siempre con `npx expo install <paquete>`, nunca con `npm install` directo, para que resuelva versiones compatibles con el SDK (regla de `AGENTS.md`).

## 13. Estructura de carpetas propuesta dentro de `src/`

Regla: **`src/app/` contiene solo pantallas y layouts**. Todo lo demás vive fuera.

```
src/
├── app/                    # SOLO rutas: cada archivo es una pantalla
│   ├── _layout.tsx         # Stack + TasksProvider
│   ├── index.tsx           # Lista de tareas
│   └── task-form.tsx       # Formulario (agregar / editar)
├── components/             # Piezas de interfaz reutilizables
│   ├── TaskItem.tsx
│   ├── EmptyState.tsx
│   ├── FormField.tsx
│   ├── RichTextField.tsx   # Campo de descripción con formato (barra + editor TenTap)
│   ├── RichTextPreview.tsx # Dibuja el formato en la tarjeta, sin WebView
│   └── FloatingAddButton.tsx
├── context/                # Estado compartido
│   ├── TasksContext.tsx    # Proveedor + hook useTasks
│   └── tasksReducer.ts     # Reducer puro (TDD)
├── utils/                  # Funciones puras
│   ├── validateTask.ts     # Validación de título y descripción (TDD)
│   └── richDoc.ts          # Documento con formato <-> texto plano (TDD)
├── theme/
│   └── index.ts            # Colores, espaciados, tamaños
├── types/
│   └── task.ts             # Tipo Task y RichDoc (documento con formato)
└── __tests__/              # Pruebas (fuera de src/app/)
    ├── tasksReducer.test.ts
    ├── validateTask.test.ts
    └── components.test.tsx
```

Los nombres de archivos, carpetas y variables van en inglés; los textos de la interfaz, en español.

## 14. Herramientas de desarrollo con agentes

Estas herramientas ayudan a **escribir** el código; no forman parte de la app. Los datos de instalación vienen de `claude plugin list` y `claude mcp list` en el equipo del proyecto.

| Herramienta | Estado en el equipo | Para qué sirve |
|---|---|---|
| **Claude Code** | En uso | Agente de programación que lee el proyecto, edita archivos y ejecuta comandos con permiso |
| **Plugin `expo`** | Instalado, alcance **project** (confirmado con `claude plugin install`, que respondió que ya estaba instalado) | Skills oficiales de Expo que guían al agente en tareas de Expo. Repositorio: `expo/skills` |
| **Plugin `frontend-design`** | Versión **1.1.1**, desde `claude-plugins-official`, alcance **project** | Hace que el agente elija una dirección visual antes de escribir código de interfaz. Es una capa de estilo, no de corrección: no garantiza que el código funcione |
| **Plugin `ponytail`** | Versión **5.3.3**, marketplace `DietrichGebert/ponytail`, alcance **project**, modo **lite** con `PONYTAIL_DEFAULT_MODE=lite` | Conjunto de reglas (estilo YAGNI) que hace que el agente escriba solo lo necesario y no sobreconstruya. Es un plugin de la comunidad, no oficial de Anthropic |
| **MCP Context7** | Alcance **user**, conectado | Entrega al agente documentación actualizada de librerías en vez de depender de su memoria. Trabaja en dos pasos: encontrar la librería y consultar su documentación |

Notas:

- **ponytail:** los modos se cambian con `/ponytail [lite | full | ultra | off]`. Según `/ponytail-help`:
  - **Lite:** construye lo pedido y menciona en una línea la opción más pequeña.
  - **Full** (predeterminado): el cambio mínimo completo, con verificación donde la lógica lo necesite, y una respuesta que nombra lo omitido y los riesgos.
  - **Ultra:** como Full, pero además cuestiona la solicitud antes de construir.

  Un análisis de terceros indica que su beneficio se nota en tareas grandes y casi no en las pequeñas, y que no reemplaza decidir la arquitectura ni revisar los cambios.
- **frontend-design y diseño:** como el diseño visual se documentará en `docs/design.md`, ese plugin será más útil en esa etapa.

## 15. Paquetes a instalar

Se instalaron al empezar la implementación, con `npx expo install`. Las filas marcadas con (*) no estaban en la planificación original y se documentan en la sección 17.

| Paquete | Versión | Tipo |
|---|---|---|
| `expo-crypto` | `~57.0.4` | dependencia |
| `@expo/vector-icons` | `^15.0.2` | dependencia |
| `@10play/tentap-editor` (*) | `^1.1.0` | dependencia |
| `react-native-webview` (*) | `13.16.1` | dependencia |
| `jest-expo` | `~57.0.6` | desarrollo |
| `jest` | `~29.7` | desarrollo |
| `@types/jest` | `~29.5` | desarrollo |
| `@testing-library/react-native` | `~13.3.3` | desarrollo |
| `react-test-renderer` (*) | `19.2.3` | desarrollo |
| `eslint` (*) | `^9.39.5` | desarrollo |
| `eslint-config-expo` (*) | `~57.0.2` | desarrollo |

Después de instalar, se corre `npx expo install --check` para confirmar que las versiones sean las que espera el SDK. Si `expo install` no acepta fijar una versión en alguno de los paquetes de desarrollo, se ajusta en ese momento.

## 16. Riesgos y puntos a verificar

| # | Punto | Cómo se resuelve |
|---|---|---|
| 1 | Comportamiento del teclado en Android con *edge-to-edge* | Probar en el celular; si falla, usar `react-native-keyboard-controller` |
| 2 | La documentación se contradice sobre `react-native-keyboard-controller` en Expo Go | Verificar al momento de usarla de respaldo |
| 3 | `expo-crypto` bajo Jest | Probar; si hace falta, simular el módulo o inyectar el generador de id |
| 4 | `@expo/vector-icons` puede quedar obsoleta | Tenerlo anotado; evaluar migrar en una unidad futura |
| 5 | `Alert.alert` no distingue estilo de botones en Android | Aceptarlo en el MVP o reemplazar por un modal propio si el diseño lo pide |
| 6 | Expo Go es un entorno de aprendizaje, no de producción | Mencionarlo en el informe; usar *development build* si se publicara |
| 7 | Expo Go trae su propia versión de `react-native-webview`, distinta de la instalada | Probar el editor TenTap dentro del `ScrollView` en el celular; afecta a CA-G5 |
| 8 | `@10play/tentap-editor` bajo Jest (usa WebView) | No se prueba con RNTL; se deja fuera de la cobertura automática y se valida a mano |

## 17. Desviaciones documentadas

Cambios respecto de lo planificado, surgidos al implementar.

| # | Desviación | Por qué |
|---|---|---|
| 1 | Se agregan **`eslint`** (`^9.39.5`) y **`eslint-config-expo`** (`~57.0.2`), con un `eslint.config.js` que ignora `dist/` y `example/` | `npx expo lint` no funciona sin ESLint, y `AGENTS.md` exige ejecutarlo antes de cerrar cada tarea. No estaba en la sección 15 original |
| 2 | Se fija **`react-test-renderer@19.2.3`** como dependencia de desarrollo | Estaba previsto no instalarlo a mano (ya viene dentro de `jest-expo`). Pero RNTL 13 lo declara como dependencia compartida (`>=18.2.0`) y `npm` intentó traer la versión 19.3.1, que exige React 19.3.1: la instalación fallaba con `ERESOLVE`. Fijarlo en la versión que usa `jest-expo` y que coincide con el React del proyecto (19.2.3) lo resuelve |

## Nota de fuentes

- **Documentación de Expo SDK 57**: páginas de Crypto, Keyboard Controller, Symbols, Safe Area Context, guía de teclado, guía de íconos, Expo Router (introducción y pruebas), pruebas unitarias con Jest, Expo Go y blog sobre *edge-to-edge*.
- **React Native:** páginas de `FlatList`, `Alert`, `KeyboardAvoidingView` e introducción a los componentes principales.
- **React:** referencia de `useReducer`.
- **Frameworks comparados:** documentación de Ionic y Capacitor, de Flutter (arquitectura y Dart) y de Android (Kotlin).
- **npm y archivos locales:** registro de npm para `jest-expo`, `@testing-library/react-native`, `@10play/tentap-editor`; `node_modules/expo/bundledNativeModules.json`; `package.json` y `app.json`.
- **TenTap:** documentación oficial (`10play.github.io/10tap-editor`), vía Context7, para instalación en Expo, soporte de Expo Go, bridges del `TenTapStartKit`, `useEditorBridge`, `useEditorContent`, `useBridgeState` y `EditorKeyboardAvoidingView`.
- **Herramientas de agentes:** `claude plugin list` y `claude mcp list` en el equipo del proyecto para versiones, alcances y estado. Para describir qué hacen `ponytail` y `frontend-design` se usaron además el README de ponytail y artículos de terceros, no documentación de Anthropic; los niveles de ponytail salen de `/ponytail-help`.
- **Context7:** está instalado con alcance de usuario y conectado, pero **no estuvo disponible durante la redacción original de este documento**, porque la sesión de Claude Code se inició antes de instalarlo. Por eso esas verificaciones se hicieron directamente contra las fuentes oficiales anteriores. Sí se usó para la sección 9 (TenTap), agregada después.
- Los puntos marcados **(criterio)** son juicios propios, no datos de una fuente.
