# Qué tamaño tienen los cuadros

Type: prototype
Status: resolved
Claimed by: sesión de prototipo

## Question

Qué tamaño tiene el cuadro en Vista previa y el cuadro en Escena, dónde entra Vista previa en la barra, y si la lista de escenas marca la escena por la que pasa el recorrido.

El artefacto es un prototipo para reaccionar. Estas piezas ya están cerradas y el prototipo las muestra así, sin volver a decidirlas:

- Vista previa, de arriba abajo: el cuadro, la lista de escenas, el recorrido. Cada escena muestra su medio visual con el mismo encaje. En un video, el fotograma de la entrada. Sin añadir, eliminar ni reordenar.
- Los botones de ese modo son Reproducir, Pausar y Renderizar.
- Escena conserva un cuadro al lado de sus datos, más chico que el de Vista previa.
- El recorrido vive en Vista previa.

El prototipo propone el tamaño de cada cuadro, el lugar de Vista previa en la barra y si la lista señala la escena del momento. Esos tres son el supuesto a reaccionar.

## Comments

Prototipo para reaccionar, todavía sin elegir. Tres variantes en [tamano-de-los-cuadros.html](../prototype/tamano-de-los-cuadros.html): El cuadro llena, La lista marca el paso y Medidas a la mitad. Se cambia con `?variant=A`, `?variant=B` o `?variant=C`, con las flechas de la barra negra, o con las teclas de dirección cuando el cursor no está en un campo.

La persona eligió El cuadro llena. Vista previa queda al final de la barra, su cuadro usa la altura del modo y el de Escena queda más chico. La lista no señala la escena del recorrido.

## Answer

Vista previa es el último modo de la barra: Biblioteca, Escenas, Escena, Apariencia, Vista previa.

El cuadro de Vista previa usa la altura que le deja el modo y conserva la proporción del short. El cuadro de Escena mide 120 px de ancho, con esa misma proporción, y queda al lado de los datos. Es más chico que el de Vista previa.

La lista de Vista previa no marca la escena por la que pasa el recorrido. Elegir una escena sigue llevando el recorrido al inicio de esa escena.

Las otras dos variantes, La lista marca el paso y Medidas a la mitad, quedaron afuera. El prototipo sigue en [tamano-de-los-cuadros.html](../prototype/tamano-de-los-cuadros.html).
