# Control de tareas Jira — RoboBloques

## Épicas

- **EP-01 — Página de inicio de RoboBloques**
  - Presentar la plataforma educativa, sus accesos principales y el estado de simulación.

- **EP-02 — Escenario de programación**
  - Permitir seleccionar personajes y observar sus movimientos dentro del escenario.

- **EP-03 — Biblioteca de bloques**
  - Ofrecer bloques visuales para construir programas sin escribir código.

- **EP-04 — Secuencia de acciones**
  - Permitir agregar, ordenar, editar y eliminar acciones del personaje seleccionado.

- **EP-05 — Ejecución de simulaciones**
  - Ejecutar, detener y reiniciar los programas creados en el escenario.

- **EP-06 — Curso guiado de programación**
  - Enseñar el primer movimiento mediante una misión paso a paso.

- **EP-07 — Sandbox de experimentación**
  - Ofrecer un espacio libre para probar bloques y crear secuencias propias.

- **EP-08 — Interacciones del personaje**
  - Implementar movimiento, giros, espera, detención, mensajes y pintura.

- **EP-09 — Lógica de programación**
  - Incorporar repeticiones y condiciones para crear programas más completos.

- **EP-10 — Diseño visual y experiencia educativa**
  - Mantener una interfaz amigable, clara, colorida y adaptable a distintos dispositivos.

## Historias de usuario

- **HU-01 — Ver la presentación de RoboBloques**
  - Como estudiante quiero conocer la plataforma y elegir entre el curso o el espacio libre.

- **HU-02 — Acceder al curso guiado**
  - Como estudiante quiero abrir la misión “Primer movimiento” para aprender a programar.

- **HU-03 — Acceder al sandbox**
  - Como estudiante quiero entrar a un espacio libre para experimentar con los bloques.

- **HU-04 — Seleccionar un personaje**
  - Como estudiante quiero seleccionar a Robotcito para programar sus acciones.

- **HU-05 — Agregar un personaje al escenario**
  - Como estudiante quiero colocar un personaje en el escenario para iniciar una simulación.

- **HU-06 — Mover un personaje manualmente**
  - Como estudiante quiero arrastrar el personaje para elegir su posición inicial.

- **HU-07 — Agregar un bloque de movimiento**
  - Como estudiante quiero usar Avanzar, Retroceder o Girar para controlar al personaje.

- **HU-08 — Agregar un bloque de control**
  - Como estudiante quiero usar Esperar o Detener para controlar el ritmo del programa.

- **HU-09 — Crear una secuencia**
  - Como estudiante quiero juntar varios bloques para formar un programa.

- **HU-10 — Ejecutar una secuencia**
  - Como estudiante quiero pulsar Ejecutar para ver al personaje realizar el programa.

- **HU-11 — Detener una simulación**
  - Como estudiante quiero detener la ejecución cuando necesite corregir mi programa.

- **HU-12 — Repetir acciones**
  - Como estudiante quiero usar el bloque Repetir para ejecutar varias veces una acción.

- **HU-13 — Usar condiciones**
  - Como estudiante quiero usar el bloque Si para crear comportamientos según una condición.

- **HU-14 — Dibujar durante el movimiento**
  - Como estudiante quiero usar Avanzar y pintar para dejar una línea en el escenario.

- **HU-15 — Mostrar mensajes**
  - Como estudiante quiero usar Decir para mostrar un mensaje durante la simulación.

- **HU-16 — Completar una misión**
  - Como estudiante quiero superar el reto del curso para comprobar que entendí el concepto.

## Tareas técnicas

- **TA-01 — Crear la página principal**
  - Construir la portada con los accesos a curso, sandbox y espacio de programación.

- **TA-02 — Crear la navegación**
  - Configurar los enlaces entre Inicio, Curso guiado y Sandbox.

- **TA-03 — Crear el catálogo de personajes**
  - Registrar a Robotcito, su imagen, nombre y posición inicial.

- **TA-04 — Renderizar personajes en el escenario**
  - Mostrar los personajes seleccionados con su posición y orientación actuales.

- **TA-05 — Implementar arrastre del personaje**
  - Permitir mover el personaje con el puntero sin sacarlo de los límites del escenario.

- **TA-06 — Crear el catálogo de acciones**
  - Registrar los bloques de movimiento, control, pintura, ciclos, condiciones y mensajes.

- **TA-07 — Crear las pestañas de bloques**
  - Organizar los bloques por personajes, movimiento, pintura, ciclos, control y condiciones.

- **TA-08 — Implementar la secuencia de acciones**
  - Mostrar los bloques agregados al personaje y permitir editarlos.

- **TA-09 — Implementar controles de ejecución**
  - Activar Ejecutar y Detener según el estado actual de la simulación.

- **TA-10 — Implementar reinicio de simulación**
  - Regresar el personaje a su posición inicial y limpiar las líneas dibujadas.

- **TA-11 — Implementar la misión Primer movimiento**
  - Crear el reto para que el estudiante use el bloque Avanzar.

- **TA-12 — Implementar zona de arrastre del curso**
  - Permitir seleccionar o arrastrar un bloque hacia el área de trabajo de la lección.

- **TA-13 — Implementar movimiento y giros**
  - Ejecutar desplazamientos, giros a la izquierda y giros a la derecha.

- **TA-14 — Implementar espera y detención**
  - Pausar la secuencia y detener la ejecución del personaje.

- **TA-15 — Implementar pintura en el escenario**
  - Dibujar una línea cuando el personaje avance con el bloque de pintura.

- **TA-16 — Implementar bloques Repetir y Si**
  - Ejecutar acciones contenidas dentro de ciclos y condiciones.

- **TA-17 — Implementar mensajes del personaje**
  - Mostrar en el escenario los mensajes creados con el bloque Decir.

- **TA-18 — Implementar eliminación del personaje**
  - Permitir borrar el personaje seleccionado cuando la simulación esté detenida.

## Bugs

- **BUG-01 — El personaje no aparece en el escenario**
  - Corregir la carga de la imagen o la creación visual de Robotcito.

- **BUG-02 — El personaje sale de los límites**
  - Evitar que el arrastre coloque al personaje fuera del escenario.

- **BUG-03 — Ejecutar permanece activo durante la simulación**
  - Deshabilitar Ejecutar mientras el programa está corriendo.

- **BUG-04 — Detener no reinicia el personaje**
  - Corregir el retorno a la posición y orientación iniciales.

- **BUG-05 — Las líneas de pintura no se limpian**
  - Limpiar el SVG de pintura al reiniciar la simulación.

- **BUG-06 — La secuencia se ejecuta en orden incorrecto**
  - Corregir el orden de procesamiento de los bloques agregados.

- **BUG-07 — El bloque Repetir no contiene las acciones**
  - Corregir la inserción y ejecución de acciones dentro del ciclo.

- **BUG-08 — La misión no detecta el bloque Avanzar**
  - Corregir la validación de la solución del curso guiado.

- **BUG-09 — El diseño se rompe en pantallas pequeñas**
  - Ajustar la distribución del escenario, bloques y controles en móviles.
