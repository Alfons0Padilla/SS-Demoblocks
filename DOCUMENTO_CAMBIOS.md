# Documento de cambios: RoboBloques como página única

**Fecha:** 28 de septiembre de 2026  
**Proyecto:** RoboBloques  
**Estado:** Propuesta funcional basada en los avances actuales y en las referencias visuales compartidas.

## 1. Objetivo del cambio

RoboBloques dejará de plantearse como una experiencia dividida entre inicio, curso guiado y sandbox. El producto se enfocará en una sola página de programación visual donde el usuario pueda:

1. visualizar uno o varios personajes dentro de un área de trabajo;
2. seleccionar un personaje haciendo clic sobre él;
3. abrir un menú contextual de acciones para ese personaje;
4. agregar y ordenar las acciones que debe ejecutar;
5. ejecutar la secuencia y visualizar la acción programada directamente sobre el personaje.

La interfaz debe conservar el enfoque amigable, visual y educativo del proyecto actual, pero priorizar el lienzo de programación y la relación directa entre personaje, acciones y resultado.

## 2. Referencias visuales

Las referencias entregadas muestran dos estados principales:

- **Vista general:** una barra lateral para acceder a las acciones, un área amplia donde aparecen los personajes y una zona inferior para mostrar o construir el programa.
- **Personaje seleccionado:** al hacer clic sobre un personaje aparece un menú flotante asociado a él. Ese menú contiene las acciones disponibles que pueden agregarse a su programación.

El menú debe estar visualmente vinculado al personaje seleccionado y no debe confundirse con una navegación general de la página.

## 3. Avances actuales que se conservan

Los siguientes elementos ya existen en el proyecto y sirven como base para la nueva versión:

- Interfaz en español y diseño responsive.
- Identidad visual de **RoboBloques**.
- Recursos gráficos disponibles en `Recursos/`, incluyendo Robotcito, el libro y el cubo.
- Barra superior con estado de simulación.
- Bloques de movimiento existentes:
  - Avanzar.
  - Retroceder.
  - Girar a la izquierda.
  - Girar a la derecha.
  - Detener.
- Categorías de bloques ya contempladas:
  - Movimiento.
  - Control.
  - Repetición.
  - Condiciones.
  - Sensores.
- Adición de bloques mediante clic, teclado y arrastrar/soltar.
- Eliminación de bloques agregados.
- Mensaje de simulación local sin hardware conectado.
- Estructura preparada para una futura integración con Blockly y, posteriormente, con comandos enviados a un robot.

## 4. Cambio de alcance

### 4.1. Nueva dirección

El alcance principal será una única página de programación visual. El usuario trabajará en el mismo espacio donde observa el resultado de sus acciones.

### 4.2. Elementos que dejan de ser prioritarios

- La separación entre `index.html`, `curso.html` y `sandbox.html` como flujo principal.
- El curso guiado como recorrido obligatorio.
- La presentación del carrito como único objeto programable.
- La navegación entre pantallas para elegir bloques y ejecutar la simulación.

Las páginas actuales pueden conservarse temporalmente como respaldo o prototipo, pero la nueva interfaz debe ser el punto de entrada principal.

## 5. Estructura propuesta de la página única

### 5.1. Encabezado

El encabezado conservará:

- logotipo y nombre RoboBloques;
- indicador de modo simulación;
- controles principales de la aplicación.

Se recomienda incluir en esta zona:

- **Ejecutar**: inicia la simulación;
- **Detener**: interrumpe la simulación;
- **Ayuda**: explica cómo seleccionar personajes y agregar acciones.

### 5.2. Área de escenario o lienzo

Será la zona principal de la interfaz. Allí se visualizarán los dibujos o personajes disponibles y sus movimientos programados.

Requisitos:

- mostrar claramente el fondo y los límites del escenario;
- permitir visualizar más de un personaje;
- distinguir el personaje seleccionado mediante borde, halo o control visual;
- conservar una posición inicial para cada personaje;
- actualizar la posición, orientación o estado del personaje durante la simulación;
- evitar que el menú de acciones tape por completo al personaje seleccionado;
- adaptarse a pantallas pequeñas sin perder el área de trabajo.

### 5.3. Menú de personajes

El proyecto deberá ofrecer una forma clara de desplegar o agregar personajes. Puede implementarse como una bandeja lateral, un botón `+` o una sección compacta del escenario.

Cada personaje deberá tener:

- identificador o nombre;
- imagen;
- posición inicial;
- orientación;
- lista de acciones asignadas;
- estado de selección;
- estado de ejecución.

### 5.4. Menú contextual de acciones

Al hacer clic sobre un personaje:

1. se marca como seleccionado;
2. se muestra un menú cercano al personaje;
3. el menú presenta las acciones disponibles;
4. al elegir una acción, esta se agrega al programa del personaje;
5. el menú permanece abierto para permitir agregar varias acciones o puede cerrarse mediante `Cerrar`;
6. al hacer clic fuera del menú, este se cierra y se conserva la programación.

Acciones iniciales recomendadas:

| Categoría | Acción | Resultado visual |
|---|---|---|
| Movimiento | Avanzar | El personaje avanza una distancia configurable |
| Movimiento | Retroceder | El personaje retrocede |
| Movimiento | Girar izquierda | Cambia su orientación 90° a la izquierda |
| Movimiento | Girar derecha | Cambia su orientación 90° a la derecha |
| Control | Detener | Pausa o termina la secuencia del personaje |
| Control | Esperar | Mantiene el personaje quieto durante un tiempo |
| Repetición | Repetir | Ejecuta una secuencia un número de veces |
| Condiciones | Si | Permite ejecutar una acción según una condición |
| Sensores | Distancia | Obtiene una medida del entorno para usarla en una condición |

Las acciones avanzadas pueden permanecer deshabilitadas o marcadas como “próximamente” hasta que exista una implementación ejecutable.

### 5.5. Panel inferior de programación

La parte inferior mostrará el programa asociado al personaje seleccionado. Debe incluir:

- nombre o imagen del personaje activo;
- lista ordenada de acciones;
- controles para reordenar;
- opción para eliminar cada acción;
- opción para limpiar el programa del personaje;
- estado de la secuencia: pendiente, ejecutando, completada o detenida.

La programación debe mantenerse separada por personaje. Cambiar de personaje debe mostrar sus propias acciones sin sobrescribir las de los demás.

## 6. Flujo funcional principal

### Flujo A: agregar una acción

1. El usuario observa los personajes en el escenario.
2. Hace clic sobre uno de ellos.
3. El personaje queda seleccionado.
4. Aparece el menú de acciones.
5. El usuario selecciona `Avanzar`, `Girar derecha` u otra acción.
6. La acción aparece en el panel inferior.
7. El personaje conserva la selección para agregar más acciones.

### Flujo B: ejecutar un programa

1. El usuario selecciona un personaje.
2. Verifica la secuencia de acciones.
3. Pulsa `Ejecutar`.
4. La aplicación recorre las acciones en orden.
5. El escenario refleja cada movimiento.
6. La interfaz indica el avance de la ejecución.
7. Al terminar, se muestra el estado `Programa completado`.

### Flujo C: editar un programa

El usuario podrá:

- agregar nuevas acciones;
- eliminar acciones;
- cambiar el orden;
- limpiar todas las acciones del personaje;
- cambiar de personaje y editar una programación independiente.

## 7. Modelo de datos sugerido

La implementación puede organizar el estado con una estructura equivalente a la siguiente:

```js
const characters = [
  {
    id: "robotcito",
    name: "Robotcito",
    image: "Recursos/robotcito.png",
    position: { x: 120, y: 160 },
    direction: 0,
    actions: [
      { type: "forward", value: 1 },
      { type: "right", value: 90 }
    ]
  }
];
```

Cada acción debe conservar un `type` estable para que la interfaz pueda mostrar una etiqueta amigable y la simulación pueda ejecutar un comportamiento concreto.

## 8. Reglas de interacción y accesibilidad

- Los personajes deben poder seleccionarse con mouse, teclado y dispositivos táctiles.
- Un personaje seleccionado debe tener un indicador visual y un nombre accesible.
- Los botones del menú deben ser elementos `button`, no texto sin interacción.
- El menú debe poder cerrarse con `Escape`.
- El foco debe ser visible.
- Las acciones deben tener etiquetas comprensibles en español.
- Los mensajes de ejecución deben anunciarse con una región `aria-live`.
- La aplicación no debe depender únicamente del arrastrar/soltar: agregar mediante clic debe seguir funcionando.

## 9. Adaptación de los avances técnicos actuales

### HTML

- Convertir la página de trabajo en la vista principal.
- Integrar en una sola estructura el encabezado, el escenario, el menú de personajes, el menú contextual y el panel de programa.
- Mantener los textos y etiquetas en español.
- Reutilizar los recursos existentes de `Recursos/`.

### CSS

- Reutilizar la identidad visual actual de `css/styles.css`.
- Crear estilos específicos para:
  - escenario;
  - personaje seleccionado;
  - menú contextual;
  - acciones por personaje;
  - estado de ejecución;
  - vista responsive.
- Asegurar que el menú se reposicione cuando el personaje esté cerca del borde del escenario.

### JavaScript

- Sustituir el estado global de un único programa por un estado separado por personaje.
- Reutilizar la definición actual de comandos (`forward`, `backward`, `left`, `right` y `stop`).
- Reutilizar la lógica actual de agregar y eliminar bloques donde sea compatible.
- Añadir selección de personaje y apertura/cierre del menú contextual.
- Añadir un ejecutor de acciones visuales para actualizar posición y orientación.
- Mantener el mensaje explícito de simulación mientras no exista hardware conectado.

## 10. Criterios de aceptación

La nueva versión se considerará lista cuando:

- la experiencia principal pueda utilizarse desde una sola página;
- se visualice al menos un personaje dentro del escenario;
- al hacer clic en el personaje aparezca su menú de acciones;
- sea posible agregar al menos las cinco acciones de movimiento actuales;
- las acciones aparezcan en el panel del personaje correcto;
- se puedan eliminar y reordenar acciones;
- ejecutar reproduzca las acciones en el orden configurado;
- el movimiento sea visible en el escenario;
- cambiar de personaje no mezcle sus programas;
- limpiar elimine únicamente el programa seleccionado;
- la interfaz funcione con teclado y en una pantalla pequeña;
- no se prometa conexión real al robot mientras la función no esté implementada.

## 11. Fases recomendadas

### Fase 1: reorganización visual

- Definir la página única.
- Crear el escenario.
- Mostrar personajes.
- Implementar selección y menú contextual.

### Fase 2: programación por personaje

- Mostrar la secuencia de acciones.
- Añadir, eliminar y reordenar acciones.
- Separar el estado de cada personaje.

### Fase 3: simulación

- Ejecutar acciones de movimiento.
- Animar desplazamiento y giros.
- Mostrar estados de ejecución, finalización y detención.

### Fase 4: acciones avanzadas

- Incorporar espera, repetición, condiciones y sensores.
- Añadir parámetros editables para las acciones.
- Preparar la estructura para Blockly y para una futura comunicación con hardware.

## 12. Resultado esperado

RoboBloques debe sentirse como un pequeño editor visual: el usuario ve a sus personajes, selecciona uno, le asigna acciones y observa inmediatamente el resultado. La prioridad ya no es recorrer varias páginas, sino programar de forma directa, visible y comprensible desde un único espacio de trabajo.

## 13. Ajustes posteriores de alcance

- Se elimina la categoría **Sensores** porque el proyecto ya no utilizará el carrito ni sensores de hardware.
- Se elimina el personaje carrito de la biblioteca inicial.
- Los bloques de avance y pintura permiten configurar su duración en segundos.
- Los bloques de bucle permiten configurar cuántas veces se repite su contenido.
- Los parámetros se editan desde el menú contextual del personaje, junto a cada acción programada.
- Los bloques **Girar izquierda** y **Girar derecha** se configuran en grados, no en segundos.
- Las animaciones actualizan la posición y orientación directamente durante cada frame, sin transiciones CSS superpuestas.
- El botón **Detener** se habilita únicamente durante la ejecución; al usarlo, se cancela la animación, se limpian los trazos y el personaje vuelve a su posición y orientación inicial sin ejecutar otra vez el programa.
- El botón **Ejecutar** inicia al mismo tiempo los programas de todos los personajes que tengan acciones; cada personaje conserva y ejecuta únicamente su propia secuencia.
- El botón **Reiniciar** se habilita al finalizar o detener la ejecución; al pulsarlo, todos los personajes vuelven a su posición y orientación iniciales y se limpian los trazos.
- La posición inicial se actualiza cada vez que el usuario arrastra un personaje; ejecutar y detener utilizan esa última posición elegida.
- El menú del personaje permanece visible al cambiar de pestaña o interactuar con la biblioteca de bloques. Solo se cierra al hacer clic en el espacio del escenario, ejecutar, detener o iniciar un programa nuevo.
- El movimiento y el giro utilizan interpolación lineal por frame para mantener una velocidad constante y evitar tirones; la duración configurada conserva su relación con el bloque, con una reproducción ligeramente más rápida.
- En **Avanzar y pintar**, los segundos representan la duración real del desplazamiento y determinan su distancia a velocidad constante: una acción de 5 segundos avanza y dibuja cinco veces más que una de 1 segundo. La línea se crea al comenzar y acompaña al personaje durante ese mismo desplazamiento, sin tener un tiempo de dibujo independiente.
- Se corrigió la edición de parámetros para que todos los campos de un bloque se guarden, incluidos segundos, grados, grosor y repeticiones.
- El bloque **Esperar** ahora respeta los segundos configurados; **Detener** interrumpe la secuencia y **Decir** actualiza el mensaje de simulación sin bloquear el ejecutor.
- La biblioteca de bloques se ubica a la izquierda del escenario y la pestaña **Personajes** es la primera categoría.
- El escenario ocupa el área principal de trabajo, mientras que la secuencia del personaje seleccionado aparece en un panel independiente debajo.
- Se eliminó el menú flotante sobre el personaje; los bloques se agregan directamente arrastrándolos o haciendo clic y se muestran en la secuencia inferior.
- Las categorías de la biblioteca funcionan como paneles desplegables independientes: al pulsar una se abre o cierra, y varias categorías pueden permanecer abiertas al mismo tiempo.
- La programación inferior permite editar directamente los parámetros de cada bloque:
  - **Avanzar**, **Retroceder**, **Avanzar y pintar** y **Esperar**: segundos.
  - **Girar izquierda** y **Girar derecha**: grados.
  - **Avanzar y pintar**: grosor de la línea.
  - **Repetir**: cantidad de veces.
- Los parámetros también aparecen en acciones anidadas dentro de bucles o condiciones y se guardan al cambiar el campo.
- Los bloques de la secuencia son arrastrables para cambiar su orden.
- Un bloque existente puede moverse entre la secuencia principal y el interior de un bloque **Repetir**.
- La zona interna de **Repetir** también acepta bloques nuevos arrastrados desde la biblioteca.
- Dentro de cada bloque contenedor se muestran zonas de inserción entre acciones y al final, permitiendo reordenarlas con precisión.
- Al soltar directamente sobre una acción, se inserta antes o después según la mitad del bloque donde se realice el arrastre, incluyendo acciones dentro de **Repetir**.
- El arrastre de acciones anidadas no propaga su evento al bloque contenedor, por lo que la acción seleccionada conserva su referencia y puede cambiar de posición correctamente.
- La interfaz fue ajustada para conservar una distribución estable cuando se abren varias categorías de bloques:
  - La biblioteca lateral tiene una altura máxima y desplazamiento independiente.
  - Cada categoría abierta limita su contenido y evita que el panel se expanda indefinidamente.
  - La secuencia utiliza una sola columna, mantiene el ancho de los bloques y permite desplazarse cuando crece.
  - El escenario conserva su tamaño y no se deforma por el contenido de la biblioteca o la programación; su área útil se amplió y la capa de pintura queda ajustada al interior del marco, sin líneas internas que se confundan con bordes.
  - El catálogo de personajes ahora solo ofrece a Robotcito; Eva y Anikka dejaron de estar disponibles para agregar al escenario.
  - Los personajes del escenario se muestran únicamente con su imagen, sin contorno, fondo, aro de selección ni nombre visible.
  - Cuando se agregan varias instancias de Robotcito, la programación las identifica como **Robotcito 1**, **Robotcito 2**, etc. El nombre no se muestra sobre la imagen del escenario.
  - El panel de programación incluye el botón **Borrar personaje**, que elimina el personaje seleccionado junto con sus acciones y selecciona otra instancia disponible cuando existe.
  - Se retiró el botón **Nuevo programa** del encabezado porque ya no forma parte del flujo de trabajo actual.
  - La orientación durante la ejecución se normaliza entre 0 y 360 grados para evitar acumulaciones negativas al repetir giros.

## 14. Eliminación de personajes

- El escenario comienza vacío y los personajes se incorporan desde la biblioteca.
- Al seleccionar un personaje, su menú contextual incluye un botón visible para eliminarlo.
- Eliminar un personaje remueve únicamente esa instancia y conserva los demás personajes y sus programas.
- La acción cancela cualquier animación activa, cierra el menú contextual y actualiza el contador del escenario.
- Después de eliminarlo, se puede incorporar nuevamente el mismo personaje desde la biblioteca.
