# Diseño visual: App de Lista de Tareas (To-Do List)

> Evaluación 1 · Desarrollo de Aplicaciones Móviles
> Estado: diseño visual. Este documento **no contiene código de la app**.
> Complementa a [docs/brief.md](brief.md) (qué se construye) y [docs/stack.md](stack.md) (con qué se construye). Aquí se explica **cómo se ve** y por qué.
> Los valores salen de `src/theme/index.ts`, que es la única fuente de verdad: si cambia un valor allí, se actualiza este documento.

## 1. Dirección visual

**Limpia y amigable.** La persona usuaria no tiene conocimientos técnicos y usa el celular con una sola mano. La interfaz tiene que entenderse sin pensar.

| Principio | Cómo se aplica |
|---|---|
| **Calma** | Fondo verde grisáceo muy claro, tarjetas blancas, sombras suaves. Nada grita |
| **Un solo acento** | Un verde profundo marca solo la acción principal («+» y «Guardar») |
| **Aire** | Escala de espaciado fija de 8 dp; cada tarjeta respira |
| **Amabilidad** | Esquinas redondeadas, textos cortos que tutean, ilustración en el estado vacío |
| **Accesible por defecto** | Contraste AA y elementos tocables de al menos 48 dp |

Base: los **roles de color de Material Design 3**, en tema claro, adaptados a Android, que es la plataforma de prueba. **(criterio)**

## 2. Color

| Rol | Hex | Dónde se usa |
|---|---|---|
| `primary` | `#2F5D50` | Botón flotante «+», botón «Guardar», ícono del estado vacío |
| `onPrimary` | `#FFFFFF` | Texto e íconos sobre `primary` |
| `primaryContainer` | `#D6EADF` | Círculo del estado vacío y efecto *ripple* al tocar |
| `background` | `#F6F8F5` | Fondo de las pantallas y de la barra superior |
| `surface` | `#FFFFFF` | Tarjetas de tarea y campos de texto |
| `text` | `#1B1F1C` | Títulos y texto principal |
| `textSecondary` | `#4A524D` | Descripciones, etiquetas de campo, ícono de papelera |
| `placeholder` | `#6B736E` | Texto de ejemplo dentro de los campos |
| `outline` | `#727973` | Borde de los campos de texto |
| `error` | `#B3261C` | Mensaje y borde de un campo con error |

**Reglas:**

- Todos los pares de texto y fondo tienen un contraste de **al menos 4,5:1** (WCAG AA).
- El verde `primary` es para **acciones**, no para decorar. Si todo es verde, nada destaca.
- El rojo `error` aparece **solo** en errores de validación. La papelera es gris (`textSecondary`): eliminar se confirma en un diálogo, así que no hace falta alarmar desde la lista.

## 3. Tipografía

Se usa la fuente del sistema (Roboto en Android). No se cargan fuentes extra: cero peso y cero riesgo en Expo Go.

| Estilo | Tamaño / interlineado | Peso | Dónde |
|---|---|---|---|
| `headline` | 20 / 28 | 600 | Título del estado vacío |
| `title` | 16 / 24 | 700 | Título de cada tarea |
| `body` | 14 / 20 | 400 | Descripción de la tarea, texto de los campos |
| `label` | 12 / 16 | 600 | Etiquetas de campo y mensajes de error |
| `button` | 14 / 20 | 600 | Texto del botón «Guardar» |

La barra superior usa peso 700 para «Mis tareas», «Nueva tarea» y «Editar tarea».

**Jerarquía en la tarjeta:** el título va en `text` y en negrita; la descripción, más pequeña y en `textSecondary`. Así se lee primero el *qué* y después el detalle.

## 4. Espaciado, forma y profundidad

### Espaciado (escala de 8 dp)

| Token | Valor | Uso típico |
|---|---|---|
| `sm` | 8 | Separación entre título y descripción, entre etiqueta y campo |
| `md` | 16 | Márgenes laterales de la pantalla, relleno de las tarjetas, distancia entre tarjetas |
| `lg` | 24 | Separación entre campos del formulario |
| `xl` | 32 | Reservado para separaciones grandes |

### Radios

| Token | Valor | Elemento |
|---|---|---|
| `input` | 12 | Campos de texto |
| `card` | 16 | Tarjetas de tarea |
| `pill` | 24 | Botón «Guardar» (forma de píldora) |
| `fab` | 28 | Botón flotante (círculo de 56 dp) |

Mientras más importante y más «tocable» es un elemento, más redondo es.

### Sombras

| Token | Elevación Android | Uso |
|---|---|---|
| `card` | 2 | Tarjetas: apenas se separan del fondo |
| `fab` | 6 | Botón flotante: flota claramente sobre la lista |

La barra superior **no** tiene sombra y comparte el color del fondo: la pantalla se ve como una sola superficie limpia.

## 5. Componentes

### Tarjeta de tarea (`TaskItem`)

- Fondo `surface`, radio 16, sombra `card`, 16 dp de separación con la siguiente.
- A la izquierda, el área para editar: el título ocupa **máximo dos líneas** (se corta con «…»); la descripción se dibuja con su formato (negrita, cursiva, listas, casillas) y se corta a los **3 primeros bloques** («…» si hay más), para que la lista se mantenga pareja.
- A la derecha, la papelera (`delete-outline`, 24 dp, gris) dentro de un área tocable de 48 × 48 dp.
- La papelera está **al lado** del área de edición, no dentro de ella: tocarla nunca abre el formulario (criterio CA-D6).

### Botón flotante «+» (`FloatingAddButton`)

- Círculo de 56 dp, fondo `primary`, ícono `add` blanco de 28 dp, sombra `fab`.
- Abajo a la derecha, a 16 dp de los bordes, más el margen del área segura del sistema. Queda al alcance del pulgar.
- La lista deja espacio libre debajo de la última tarjeta para que el botón nunca la tape.

### Campo de formulario (`FormField`)

- Para el **título**: etiqueta arriba («Título») en estilo `label`, campo blanco, borde de 1 dp `outline`, radio 12, alto mínimo de 48 dp.
- Texto de ejemplo: «Ej. Comprar pan».
- **Con error:** el borde pasa a `error` con 2 dp y aparece el mensaje debajo, en rojo. El lector de pantalla lo anuncia.

### Campo con formato (`RichTextField`)

Es el campo de la **descripción**. Misma apariencia que `FormField` (etiqueta, caja blanca, borde `outline` de 1 dp y radio 12, al menos 120 dp de alto, borde `error` de 2 dp con mensaje debajo), más una barra de formato encima del editor.

- **Barra de 5 botones**, cada uno de 48 × 48 dp: negrita, cursiva, lista numerada, lista con viñetas y casilla.
- Un botón **activo** (el cursor está sobre ese formato) muestra fondo `primaryContainer` e ícono en `primary`; **inactivo**, ícono en `textSecondary` y sin fondo.
- El texto se ve formateado **mientras se escribe** (negrita en negrita, listas con numeración o viñeta, casillas marcables): es un editor visual, no símbolos de Markdown.
- Texto de ejemplo: «Describe la tarea».

### Botón «Guardar»

- Ancho completo, forma de píldora (radio 24), fondo `primary`, texto blanco, alto mínimo de 48 dp.
- Va **dentro** del contenido que se desplaza, para que el teclado nunca lo tape (criterio CA-G5).

### Estado vacío (`EmptyState`)

- Centrado en la pantalla.
- Círculo de 96 dp en `primaryContainer` con el ícono `checklist` en `primary`.
- «Aún no tienes tareas» en `headline` y debajo «Toca + para agregar una» en `body` gris.
- Convierte una pantalla en blanco en una invitación a empezar.

### Diálogo de eliminación

- Diálogo nativo (`Alert.alert`): «¿Eliminar esta tarea?», «Esta acción no se puede deshacer.», con «Cancelar» y «Eliminar».
- Se cierra también al tocar fuera de él.
- Límite conocido: en Android no se puede pintar «Eliminar» en rojo con `Alert.alert` (ver `docs/stack.md`, riesgo 5). Se acepta en el MVP.

## 6. Pantallas

### «Mis tareas» (`/`)

```
┌──────────────────────────────┐
│ Mis tareas                   │  ← barra del color del fondo, sin sombra
│                              │
│ ┌──────────────────────────┐ │
│ │ Comprar pan          🗑  │ │  ← tarjeta blanca, radio 16
│ │ Pasar por la panadería…  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Llamar a mamá        🗑  │ │
│ │ Preguntar por el viaje   │ │
│ └──────────────────────────┘ │
│                              │
│                         (+)  │  ← botón flotante verde
└──────────────────────────────┘
```

### «Nueva tarea» / «Editar tarea» (`/task-form`)

```
┌──────────────────────────────┐
│ ←  Nueva tarea               │
│                              │
│ Título                       │
│ ┌──────────────────────────┐ │
│ │ Ej. Comprar pan          │ │
│ └──────────────────────────┘ │
│ El título es obligatorio     │  ← solo si hay error, en rojo
│                              │
│ Descripción                  │
│ [B] [I] [1.] [•] [☑]         │  ← barra de formato
│ ┌──────────────────────────┐ │
│ │ Pasar por la panadería   │ │
│ │ antes de las 6 (negrita) │ │
│ │ 1. Pan                   │ │
│ │ ☐ Leche                  │ │
│ └──────────────────────────┘ │
│                              │
│ (        Guardar           ) │  ← píldora verde, ancho completo
└──────────────────────────────┘
```

Capturas reales en [docs/screenshots/](screenshots/): estado vacío, validación, lista y confirmación de eliminación.

## 7. Interacción

- **Respuesta al tocar:** todo lo tocable muestra el *ripple* de Android en `primaryContainer`. Los botones verdes, además, bajan su opacidad a 85 % mientras se presionan.
- **Errores:** aparecen al tocar «Guardar», no antes. Desde ahí se actualizan mientras la persona escribe, y cada mensaje desaparece en cuanto su campo es válido.
- **Sin animaciones propias:** solo las transiciones nativas del stack. Mantiene la app liviana y predecible. **(criterio)**
- **Sin avisos de «guardado»:** la confirmación es ver la tarea en la lista.

## 8. Accesibilidad

- Elementos tocables de **al menos 48 × 48 dp** (`minTouchTarget`).
- Contraste de texto de **al menos 4,5:1**.
- Etiquetas de accesibilidad en los botones de solo ícono: «Agregar tarea», «Eliminar tarea: *título*». Cada tarjeta se anuncia como «Editar tarea: *título*».
- Los 5 botones de la barra de formato llevan su propia etiqueta: «Negrita», «Cursiva», «Lista numerada», «Lista con viñetas», «Casilla», y anuncian si están activos.
- Los campos usan su etiqueta visible como etiqueta de accesibilidad.
- Los mensajes de error se anuncian solos al aparecer.

## 9. Fuera de alcance

- **Modo oscuro:** el tema es solo claro (ver «Sugerencias» del brief). Los roles de color ya están nombrados para poder agregar una variante oscura después sin tocar los componentes.
- **Fuentes propias, ilustraciones a medida y animaciones:** no aportan al MVP.
- **Modal de confirmación propio:** solo si la rúbrica pide distinguir visualmente «Eliminar».
